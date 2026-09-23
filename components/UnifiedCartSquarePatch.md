# STEP 19: patch UnifiedCartModal

Do not replace the whole component blindly. The existing cart has purchase and
rental logic that should remain intact.

## 1. Change the displayed rental payment summary

The current component includes the security deposit in `dueTodayCents`.

Change:

```js
const dueTodayCents =
  purchaseSubtotalCents +
  bookingDepositEstimateCents +
  securityDepositEstimateCents;
```

to:

```js
const dueTodayCents =
  purchaseSubtotalCents +
  bookingDepositEstimateCents;
```

For rental-only Square checkout, the refundable security deposit is collected
closer to pickup, not at booking.

## 2. Replace `startCheckout()` with provider routing

Use this structure:

```js
async function startCheckout() {
  setCheckoutError("");
  setCheckingOut(true);

  try {
    const hasRentals = rentalItems.length > 0;
    const hasPurchases = purchaseItems.length > 0;

    // Square rental migration currently requires rental and purchase carts to
    // be checked out separately. This prevents Square's 50% invoice deposit
    // from accidentally applying to purchase merchandise.
    if (hasRentals && hasPurchases) {
      throw new Error(
        "Please check out your rental booking separately from purchase items."
      );
    }

    const endpoint = hasRentals
      ? `${API_BASE}/create-square-production-booking`
      : `${API_BASE}/create-unified-checkout-session`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        },
        rentalDates,
        items: items.map(({ id, kind, meta, quantity }) => ({
          id,
          kind,
          meta,
          quantity,
        })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Could not start checkout.");
    }

    if (data.bookingNumber) {
      window.sessionStorage.setItem(
        "asliceofg-pending-booking-number",
        data.bookingNumber
      );
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    throw new Error("Checkout did not return a destination.");
  } catch (error) {
    setCheckoutError(error.message || "Could not start checkout.");
    setCheckingOut(false);
  }
}
```

## 3. Change the rental payment explanation

Replace the current three bullets with wording equivalent to:

- **Booking deposit:** 50% of the rental total. Your Square invoice is sent
  after the rental agreement is attached.
- **Remaining balance:** the other 50%, due before pickup.
- **Refundable security deposit:** collected separately closer to pickup and
  released after return inspection, subject to the rental agreement.

## 4. Important production behavior

Purchase-only checkout still goes through the existing Stripe endpoint during
this migration.

Rental-only checkout goes through Square.

A mixed purchase + rental cart is blocked temporarily rather than charging the
wrong amounts. That restriction can be removed after purchase merchandise is
migrated to its own Square order/payment flow.
