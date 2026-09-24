// Per-unit rental price in dollars for a line of `quantity`. An item with a
// bulk_min_quantity / bulk_rental_price pair drops to the bulk price once
// that one line reaches the threshold. Checkout imports this for the price
// it actually charges and the browser imports it for display, so the two
// can never disagree.
export function rentalUnitPrice(item, quantity) {
  const bulkMin = Number(item?.bulk_min_quantity);
  if (item?.bulk_rental_price != null && bulkMin > 0 && Number(quantity) >= bulkMin) {
    return Number(item.bulk_rental_price);
  }
  return Number(item?.rental_price ?? 0);
}
