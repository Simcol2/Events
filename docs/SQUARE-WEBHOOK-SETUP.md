# Square webhook setup

## Endpoint

After deploying this phase, configure this exact HTTPS URL in the Square
Developer Console:

```text
https://YOUR-EVENTS-DOMAIN/api/square-webhook
```

The **exact same URL** must be stored in the Events environment variable:

```text
SQUARE_WEBHOOK_NOTIFICATION_URL=https://YOUR-EVENTS-DOMAIN/api/square-webhook
```

Also copy the webhook subscription signature key into:

```text
SQUARE_WEBHOOK_SIGNATURE_KEY=...
```

Do not put either secret in GitHub source.

## Subscribe to these events

At minimum:

```text
invoice.created
invoice.published
invoice.updated
invoice.payment_made
invoice.refunded
invoice.scheduled_charge_failed
invoice.canceled

payment.created
payment.updated

refund.created
refund.updated
```

## Why the event table exists

Square can deliver an event more than once.

Every event includes an `event_id`. `square_webhook_events.event_id` is the
primary key, so a duplicate delivery is acknowledged but not applied twice.

That matters rather a lot when the event is "money happened."

## Signature validation

The endpoint validates Square's:

```text
x-square-hmacsha256-signature
```

against:

```text
signature key + exact notification URL + raw request body
```

using a constant-time comparison.

If the request cannot be validated, it receives HTTP 403 and does not touch
Supabase.
