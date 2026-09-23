import { getSquareClient, getSquareLocationId } from "./_square.js";

/**
 * Phase 1-5 creates a Square Order for the FULL rental subtotal.
 *
 * It does not collect money yet. The next migration phase will attach a Square
 * Invoice/payment schedule so the booking deposit and remaining balance are
 * handled by Square without changing the rental inventory logic.
 */
export async function createSquareRentalOrder({
  reservation,
  rentalLines,
  squareCustomerId,
}) {
  const square = getSquareClient();
  const locationId = getSquareLocationId();

  const response = await square.orders.create({
    idempotencyKey: `asg-events-rental-order-${reservation.id}`,
    order: {
      locationId,
      customerId: squareCustomerId,
      referenceId: reservation.booking_number,
      lineItems: rentalLines.map((line) => ({
        name: line.name,
        quantity: String(line.quantity),
        basePriceMoney: {
          amount: BigInt(line.unitCents),
          currency: "CAD",
        },
      })),
    },
  });

  const order = response.order;
  if (!order?.id) throw new Error("Square did not return an order ID.");

  return {
    id: order.id,
    version: order.version == null ? null : Number(order.version),
    state: order.state || null,
  };
}
