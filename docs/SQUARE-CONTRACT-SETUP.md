# Square rental contract setup

## Important limitation

Square Contracts is available in Square Dashboard and Square Invoices, but
Square does **not** expose a public Contracts API. The Events backend therefore
cannot programmatically create, attach, or inspect a Square Contract.

That means Steps 7 and 8 are a one-time Square Dashboard configuration plus a
per-booking attachment step.

## One-time template setup

In Square Dashboard:

1. Go to **Orders & payments / Invoices & Payments / Payments > Contracts**.
2. Create a custom contract based on **Service agreement**.
3. Name it something clear, such as:
   **A Slice of G Rental Agreement**
4. Add the rental clauses you want every client to accept.
5. Add initials/signature fields where required.
6. Save it as the reusable rental contract template.

The contract should eventually cover the finalized business rules for:

- booking deposit
- payment deadline
- pickup and return
- late return
- cleaning
- damage and missing items
- security deposit
- replacement charges
- cancellation/refund policy
- prohibited use
- authorization/consent

Do not improvise the legal wording inside application code. Keep the canonical
agreement in Square.

## Per-booking workflow

After `/api/create-square-invoice-draft` creates the invoice:

1. Open the draft invoice in Square Dashboard.
2. In **Square Contracts**, attach a new contract using the saved rental
   agreement template.
3. Confirm the customer and booking details are correct.
4. If your Square plan includes the feature, enable:
   **Require unsigned contracts to be signed before payment**
5. Save the invoice.
6. Publish it either in Square Dashboard or through
   `/api/publish-square-invoice`.

The publish endpoint deliberately requires:

```json
{
  "reservationId": 123,
  "contractAttachedConfirmed": true,
  "signatureRequiredConfirmed": true
}
```

This is a seller confirmation, not an API verification. Square does not provide
an API endpoint for Events to independently verify the attached contract.

## Why the invoice stays DRAFT first

If Events published it immediately, Square could email the payment page before
you had attached the rental agreement. Keeping the invoice draft creates this
safe order:

Square Order
-> Square Invoice DRAFT
-> attach contract
-> require signature before payment
-> publish
-> customer signs
-> customer pays 50% deposit

That matches the intended booking workflow far better than publishing first and
trying to repair the paperwork afterwards.
