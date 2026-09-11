import { handleApiError, requireClient } from "./_clientAuth.js";

function sortNewest(rows, field = "created_at") {
  return [...(rows || [])].sort((a, b) => {
    const left = new Date(a?.[field] || 0).getTime();
    const right = new Date(b?.[field] || 0).getTime();
    return right - left;
  });
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { supabase, user, customer } = await requireClient(req);

    await supabase.rpc("claim_my_records");
    await supabase.rpc("claim_my_purchases");

    const [reservationsResult, purchasesResult, requestsResult] = await Promise.all([
      supabase.from("reservations").select("*").eq("customer_id", customer.id).order("event_date", { ascending: false }),
      supabase.from("purchase_orders").select("*").eq("customer_id", customer.id).order("purchased_at", { ascending: false }),
      supabase.from("item_requests").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }),
    ]);

    if (reservationsResult.error) throw reservationsResult.error;
    if (purchasesResult.error) throw purchasesResult.error;
    if (requestsResult.error) throw requestsResult.error;

    const reservations = reservationsResult.data || [];
    const reservationIds = reservations.map((row) => row.id);
    const purchases = purchasesResult.data || [];
    const purchaseIds = purchases.map((row) => row.id);

    const [itemsResult, contractsResult, transactionsResult, purchaseItemsResult] = await Promise.all([
      reservationIds.length
        ? supabase.from("reservation_items").select("*").in("reservation_id", reservationIds)
        : Promise.resolve({ data: [], error: null }),
      reservationIds.length
        ? supabase.from("contracts").select("*").in("reservation_id", reservationIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("stripe_transactions")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false }),
      purchaseIds.length
        ? supabase.from("purchase_order_items").select("*").in("purchase_order_id", purchaseIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (itemsResult.error) throw itemsResult.error;
    if (contractsResult.error) throw contractsResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (purchaseItemsResult.error) throw purchaseItemsResult.error;

    const reservationItems = itemsResult.data || [];
    const itemIds = [...new Set(reservationItems.map((row) => row.item_id).filter(Boolean))];

    let itemCatalog = [];
    if (itemIds.length) {
      const { data, error } = await supabase.from("items").select("id,name,photos").in("id", itemIds);
      if (error) throw error;
      itemCatalog = data || [];
    }

    const itemMap = new Map(itemCatalog.map((item) => [item.id, item]));
    const decoratedReservationItems = reservationItems.map((row) => ({
      ...row,
      item: itemMap.get(row.item_id) || null,
    }));

    return res.status(200).json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email || user.email,
      },
      reservations: sortNewest(reservations, "event_date"),
      reservationItems: decoratedReservationItems,
      contracts: contractsResult.data || [],
      transactions: transactionsResult.data || [],
      purchases,
      purchaseItems: purchaseItemsResult.data || [],
      requests: requestsResult.data || [],
    });
  } catch (error) {
    return handleApiError(res, error);
  }
}
