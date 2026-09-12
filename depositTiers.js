// Mirrors the tier schedule in api/create-unified-checkout-session.js so
// the cart can show an accurate estimate before checkout. The real charge
// is always computed server-side from the same table - this is display
// only, never trusted for payment amounts.
export function estimateBookingDepositCents(rentalSubtotalCents) {
  return Math.ceil(rentalSubtotalCents * 0.5);
}

export function estimateSecurityDepositCents(rentalSubtotalCents) {
  if (rentalSubtotalCents >= 100000) return 30000;
  if (rentalSubtotalCents >= 75000) return 25000;
  if (rentalSubtotalCents >= 50000) return 20000;
  if (rentalSubtotalCents >= 30000) return 15000;
  if (rentalSubtotalCents >= 15000) return 10000;
  if (rentalSubtotalCents >= 5000) return 5000;
  return 0;
}
