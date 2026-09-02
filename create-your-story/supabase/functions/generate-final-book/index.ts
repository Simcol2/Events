import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { AuthError, getServiceClient, requireEventOwner } from "../_shared/auth.ts";
import { getImageProvider, getLlmProvider } from "../_shared/ai/index.ts";
import { wrapText } from "../_shared/wrapText.ts";

const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;
const IMAGE_HEIGHT = 420;
const TEXT_FONT_SIZE = 20;

async function buildPdf(pages: Array<{ pageNumber: number; text: string; imageBytes: Uint8Array }>) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pages) {
    const pdfPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const image = await pdfDoc.embedPng(page.imageBytes);
    pdfPage.drawImage(image, {
      x: 0,
      y: PAGE_HEIGHT - IMAGE_HEIGHT,
      width: PAGE_WIDTH,
      height: IMAGE_HEIGHT,
    });

    const textAreaWidth = PAGE_WIDTH - 80;
    const lines = wrapText(page.text, font, TEXT_FONT_SIZE, textAreaWidth);
    const lineHeight = TEXT_FONT_SIZE * 1.4;
    const textBlockHeight = lines.length * lineHeight;
    let y = (PAGE_HEIGHT - IMAGE_HEIGHT) / 2 + textBlockHeight / 2;

    for (const line of lines) {
      const lineWidth = font.widthOfTextAtSize(line, TEXT_FONT_SIZE);
      pdfPage.drawText(line, {
        x: (PAGE_WIDTH - lineWidth) / 2,
        y,
        size: TEXT_FONT_SIZE,
        font,
        color: rgb(0.2, 0.15, 0.15),
      });
      y -= lineHeight;
    }

    pdfPage.drawText(String(page.pageNumber), {
      x: PAGE_WIDTH - 30,
      y: 16,
      size: 10,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return pdfDoc.save();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { eventId } = await req.json();
    if (!eventId) return jsonResponse({ error: "eventId is required" }, 400);

    const { event } = await requireEventOwner(req, eventId);
    if (["draft", "skeleton_generating", "skeleton_ready", "skeleton_failed"].includes(event.status)) {
      return jsonResponse({ error: "Lock the story and collect guest answers before generating the final book." }, 409);
    }

    const service = getServiceClient();

    await service.from("cys_events").update({ status: "final_generating", updated_at: new Date().toISOString() }).eq("id", eventId);
    await service.from("cys_final_books").upsert(
      { event_id: eventId, status: "generating", requested_at: new Date().toISOString(), error_message: null },
      { onConflict: "event_id" }
    );

    try {
      const { data: skeleton } = await service
        .from("cys_story_skeletons")
        .select("style_reference")
        .eq("event_id", eventId)
        .single();

      const { data: skeletonPages, error: pagesError } = await service
        .from("cys_skeleton_pages")
        .select("page_number, slot_type, text_template")
        .eq("event_id", eventId)
        .order("page_number");
      if (pagesError || !skeletonPages) throw pagesError ?? new Error("No skeleton pages found");

      const { data: approvedRows, error: approvedError } = await service
        .from("cys_guest_contributions")
        .select("guest_name, woven_text, host_edited_text, text_content, page:cys_skeleton_pages(page_number)")
        .eq("event_id", eventId)
        .eq("status", "approved");
      if (approvedError) throw approvedError;

      const approvedContributions = (approvedRows ?? [])
        .filter((r) => r.page)
        .map((r) => ({
          pageNumber: r.page.page_number,
          text: r.host_edited_text ?? r.text_content ?? r.woven_text ?? "",
          guestName: r.guest_name ?? undefined,
        }));

      const llm = getLlmProvider();
      const narrative = await llm.polishFinalNarrative({
        skeletonPages: skeletonPages.map((p) => ({
          pageNumber: p.page_number,
          slotType: p.slot_type,
          textTemplate: p.text_template,
        })),
        approvedContributions,
        tone: event.tone,
      });

      const imageProvider = getImageProvider();
      const styleReference = skeleton?.style_reference ?? {};
      const pdfPages: Array<{ pageNumber: number; text: string; imageBytes: Uint8Array }> = [];

      for (const page of narrative.pages) {
        const illustration = await imageProvider.generateIllustration({
          pageText: page.polishedText,
          styleReference,
          pageNumber: page.pageNumber,
          eventId,
        });

        const illustrationPath = `illustrations/${eventId}/${page.pageNumber}.png`;
        await service.storage.from("cys-story-assets").upload(illustrationPath, illustration.imageBytes, {
          contentType: illustration.mimeType,
          upsert: true,
        });
        const illustrationUrl = service.storage.from("cys-story-assets").getPublicUrl(illustrationPath).data.publicUrl;

        await service.from("cys_final_book_pages").upsert(
          {
            event_id: eventId,
            page_number: page.pageNumber,
            polished_text: page.polishedText,
            illustration_url: illustrationUrl,
            illustration_status: "ready",
            generated_by: Deno.env.get("IMAGE_PROVIDER") ?? "stub",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "event_id,page_number" }
        );

        pdfPages.push({ pageNumber: page.pageNumber, text: page.polishedText, imageBytes: illustration.imageBytes });
      }

      pdfPages.sort((a, b) => a.pageNumber - b.pageNumber);
      const pdfBytes = await buildPdf(pdfPages);

      const pdfPath = `pdfs/${eventId}/book.pdf`;
      await service.storage.from("cys-story-assets").upload(pdfPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
      const pdfUrl = service.storage.from("cys-story-assets").getPublicUrl(pdfPath).data.publicUrl;

      await service
        .from("cys_final_books")
        .update({ status: "ready", pdf_url: pdfUrl, completed_at: new Date().toISOString() })
        .eq("event_id", eventId);
      await service.from("cys_events").update({ status: "final_ready", updated_at: new Date().toISOString() }).eq("id", eventId);

      return jsonResponse({ ok: true, pdfUrl });
    } catch (genError) {
      const message = genError instanceof Error ? genError.message : String(genError);
      await service.from("cys_final_books").update({ status: "failed", error_message: message }).eq("event_id", eventId);
      await service.from("cys_events").update({ status: "final_failed", updated_at: new Date().toISOString() }).eq("id", eventId);
      return jsonResponse({ error: message }, 502);
    }
  } catch (err) {
    if (err instanceof AuthError) return jsonResponse({ error: err.message }, err.status);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
