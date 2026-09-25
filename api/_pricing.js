// Per-unit rental price in dollars for a line of `quantity`. An item with a
// bulk_min_quantity / bulk_rental_price pair drops to the bulk price once
// the threshold is reached. `poolQuantity` lets items that share a
// variant_group count toward that threshold together (see
// bulkPoolCounter). Checkout imports this for the price it actually charges
// and the browser imports it for display, so the two can never disagree.
export function rentalUnitPrice(item, quantity, poolQuantity = quantity) {
  const bulkMin = Number(item?.bulk_min_quantity);
  const counted = Math.max(Number(quantity) || 0, Number(poolQuantity) || 0);
  if (item?.bulk_rental_price != null && bulkMin > 0 && counted >= bulkMin) {
    return Number(item.bulk_rental_price);
  }
  return Number(item?.rental_price ?? 0);
}

// Items in the same variant_group are one product split by option, e.g. a
// separate stock row per cake-topper digit. A "4 for $8" deal has to count
// any mix of digits, not 4 of the same one, so the bulk threshold is
// measured across the whole group. Takes [{ item, quantity }] for every
// rental in the order; returns (item, quantity) => the quantity to test.
export function bulkPoolCounter(entries) {
  const totals = new Map();
  for (const { item, quantity } of entries) {
    const group = item?.variant_group?.trim();
    if (group) totals.set(group, (totals.get(group) || 0) + (Number(quantity) || 0));
  }
  return (item, quantity) => {
    const group = item?.variant_group?.trim();
    return group ? totals.get(group) ?? quantity : quantity;
  };
}
