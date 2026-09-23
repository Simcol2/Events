# STEP 20: controlled production test plan

You are testing in production, so use tiny, intentional transactions and refund
them where appropriate. Square production payments are real payments.

## Before testing

Confirm these production environment variables exist in the Events Vercel
project:

```text
SQUARE_ACCESS_TOKEN
SQUARE_LOCATION_ID
SQUARE_ENVIRONMENT=production

SQUARE_WEBHOOK_SIGNATURE_KEY
SQUARE_WEBHOOK_NOTIFICATION_URL

VITE_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

ADMIN_PASSCODE
CRON_SECRET
```

Also confirm the Square webhook is configured to the exact production URL.

## Test 1: create a real rental booking

Use a low-value rental test item.

Expected:

1. Supabase customer created/reused.
2. Square customer reused/created.
3. reservation created with `payment_provider = square`.
4. Square Order created.
5. Square Invoice created as DRAFT.
6. customer sees the local booking confirmation page.

## Test 2: contract + publish

In Square Dashboard:

1. open the DRAFT invoice;
2. attach the A Slice of G Rental Agreement;
3. enable signature-before-payment if available on your Square plan;
4. publish the invoice.

Expected:

- customer gets the Square invoice email;
- Square public invoice URL is populated after webhook/refresh.

## Test 3: real booking deposit

Have the tester sign and pay the 50% deposit.

Use the Square buyer option to save the card if you are testing auto-payment.

Expected:

- `invoice.payment_made` webhook received;
- `square_webhook_events` row inserted;
- `square_transactions` booking-deposit row becomes paid;
- reservation leaves `checkout_pending`;
- portal displays deposit paid.

## Test 4: saved card

Run the existing card-status endpoint.

Expected:

```text
square_card_on_file = true
square_primary_card_id = ...
```

Then configure balance autopay.

Expected:

```text
square_balance_autopay = true
```

## Test 5: security deposit

For production testing, use the smallest practical security-deposit amount.

Trigger the admin/server charge only after the tester understands it is a real
charge.

Expected:

- Square payment succeeds;
- reservation stores `square_security_payment_id`;
- webhook records `security_deposit` as paid.

## Test 6: return + refund

Use the admin return panel/endpoint.

For a full-refund test:

```text
condition = normal_wear
refund = full security deposit
```

Expected:

- inspection row exists;
- Square refund exists;
- refund webhook arrives;
- reservation shows security deposit released.

## Test 7: portal

Tester signs into `/client`.

Confirm:

- booking visible;
- Square invoice link opens;
- deposit paid status is correct;
- contract status is correct after manual bridge update;
- balance status correct;
- security-deposit status correct;
- refund status correct.

## Test 8: timing logic

Exact 24-hour and 12-hour behavior only works when `pickup_at` is populated.

Create a controlled test booking with an exact `pickup_at`.

Confirm the hourly cron calculates:

```text
balance_due_at = pickup_at - 24 hours
auto_cancel_at = pickup_at - 12 hours
```

At the 12-hour threshold an unpaid reservation becomes:

```text
payment_overdue
```

It is deliberately not hard-cancelled, preserving your manual/cash exception.

## Rollback

Do not delete Stripe yet.

If the Square rental path fails:

1. revert the `UnifiedCartModal` provider routing;
2. rental checkout returns to `/api/create-unified-checkout-session`;
3. Square rows remain historical/audit data;
4. no database rollback is required because the migrations are additive.

Only remove Stripe after multiple complete production test bookings have passed.
