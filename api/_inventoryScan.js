// Phase 2 QR inventory handler.
// Mounted from api/admin.js as resource=inventory-scan.
// Uses the existing admin passcode/service-role protection supplied by api/admin.js.

export async function handleInventoryScan(req, res, supabase) {
  if (req.method === "GET") {
    const code = String(req.query?.code || "").trim().toUpperCase();
    const itemId = Number(req.query?.itemId || 0);

    let asset = null;
    let item = null;

    if (code) {
      const assetResult = await supabase
        .from("assets")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (assetResult.error) return res.status(500).json({ error: assetResult.error.message });
      asset = assetResult.data;

      if (!asset) return res.status(404).json({ error: "Asset not found" });

      if (asset.item_id) {
        const itemResult = await supabase
          .from("items")
          .select("*")
          .eq("id", asset.item_id)
          .maybeSingle();

        if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });
        item = itemResult.data;
      }
    } else if (itemId) {
      const itemResult = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .maybeSingle();

      if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });
      item = itemResult.data;

      if (!item) return res.status(404).json({ error: "Catalogue item not found" });
    } else {
      return res.status(400).json({ error: "code or itemId is required" });
    }

    let reservationLines = [];

    if (item?.id) {
      const linesResult = await supabase
        .from("reservation_items")
        .select(
          "id, reservation_id, item_id, quantity, quantity_packed, quantity_out, quantity_returned, description, notes"
        )
        .eq("item_id", item.id);

      if (linesResult.error) return res.status(500).json({ error: linesResult.error.message });

      const reservationIds = [
        ...new Set((linesResult.data || []).map((line) => line.reservation_id).filter(Boolean)),
      ];

      let reservationsById = {};

      if (reservationIds.length) {
        const reservationsResult = await supabase
          .from("reservations")
          .select(
            "id, booking_number, event_date, pickup_date, drop_off_date, status, customer_id"
          )
          .in("id", reservationIds)
          .in("status", [
            "confirmed",
            "preparing",
            "ready_for_pickup",
            "out_for_delivery",
            "with_you",
          ]);

        if (reservationsResult.error) {
          return res.status(500).json({ error: reservationsResult.error.message });
        }

        const customerIds = [
          ...new Set((reservationsResult.data || []).map((row) => row.customer_id).filter(Boolean)),
        ];

        let customersById = {};

        if (customerIds.length) {
          const customersResult = await supabase
            .from("customers")
            .select("id, name, email")
            .in("id", customerIds);

          if (!customersResult.error) {
            customersById = Object.fromEntries(
              (customersResult.data || []).map((row) => [row.id, row])
            );
          }
        }

        reservationsById = Object.fromEntries(
          (reservationsResult.data || []).map((row) => [
            row.id,
            {
              ...row,
              customer: customersById[row.customer_id] || null,
            },
          ])
        );
      }

      reservationLines = (linesResult.data || [])
        .filter((line) => reservationsById[line.reservation_id])
        .map((line) => ({
          ...line,
          reservation: reservationsById[line.reservation_id],
        }))
        .sort(
          (a, b) =>
            new Date(a.reservation?.event_date || 0) -
            new Date(b.reservation?.event_date || 0)
        );
    }

    return res.status(200).json({
      scanType: asset ? (asset.kind === "box" ? "container" : "asset") : "item",
      asset,
      item,
      reservationLines,
    });
  }

  if (req.method === "POST") {
    const { action, reservationItemId, quantity } = req.body || {};

    if (action !== "pack_quantity") {
      return res.status(400).json({ error: "Unknown inventory scan action" });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ error: "Quantity must be a whole number of 0 or more." });
    }

    const lineResult = await supabase
      .from("reservation_items")
      .select("id, reservation_id, item_id, quantity, quantity_packed")
      .eq("id", reservationItemId)
      .maybeSingle();

    if (lineResult.error) return res.status(500).json({ error: lineResult.error.message });

    const line = lineResult.data;
    if (!line) return res.status(404).json({ error: "Reservation item not found" });

    const itemResult = await supabase
      .from("items")
      .select("id, name, tracking_mode, quantity_owned, quantity_out_of_service")
      .eq("id", line.item_id)
      .maybeSingle();

    if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });

    const item = itemResult.data;
    if (!item) return res.status(404).json({ error: "Catalogue item not found" });

    if (item.tracking_mode !== "quantity") {
      return res.status(400).json({
        error: "This item is serialized and must be packed by physical asset.",
      });
    }

    const required = Number(line.quantity || 0);
    if (qty > required) {
      return res.status(400).json({
        error: `This reservation only requires ${required}.`,
      });
    }

    const usableOwned = Math.max(
      0,
      Number(item.quantity_owned || 0) - Number(item.quantity_out_of_service || 0)
    );

    if (qty > usableOwned) {
      return res.status(400).json({
        error: `Only ${usableOwned} are currently usable.`,
      });
    }

    const updateResult = await supabase
      .from("reservation_items")
      .update({ quantity_packed: qty })
      .eq("id", line.id)
      .select(
        "id, reservation_id, item_id, quantity, quantity_packed, quantity_out, quantity_returned"
      )
      .single();

    if (updateResult.error) {
      return res.status(400).json({ error: updateResult.error.message });
    }

    return res.status(200).json({
      reservationItem: updateResult.data,
      item,
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
