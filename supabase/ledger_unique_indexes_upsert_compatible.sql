-- supabase-js upsert({ onConflict }) sends ON CONFLICT (cols) with no index
-- predicate, and Postgres cannot infer a PARTIAL unique index from that, so
-- every one of these upserts was failing with 42P10 ("there is no unique or
-- exclusion constraint matching the ON CONFLICT specification"). Callers did
-- not check the error, so ledger writes were being dropped silently.
--
-- A plain unique index keeps the same guarantee (NULLs never conflict with
-- each other in a Postgres unique index) while being usable as an ON CONFLICT
-- arbiter. Applied via Supabase MCP; kept here as a reference copy.

drop index if exists public.square_transactions_payment_unique;
create unique index square_transactions_payment_unique
  on public.square_transactions (square_payment_id);

drop index if exists public.square_transactions_invoice_request_unique;
create unique index square_transactions_invoice_request_unique
  on public.square_transactions (square_invoice_id, square_payment_request_uid);

drop index if exists public.stripe_transactions_invoice_unique;
create unique index stripe_transactions_invoice_unique
  on public.stripe_transactions (stripe_invoice_id);

drop index if exists public.stripe_transactions_checkout_kind_unique;
create unique index stripe_transactions_checkout_kind_unique
  on public.stripe_transactions (stripe_checkout_session_id, kind);
