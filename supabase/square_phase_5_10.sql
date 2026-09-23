-- EVENTS -> SQUARE MIGRATION, PHASE 5-10
--
-- Run AFTER square_phase_1_5.sql.
-- Additive only. Stripe remains intact until the Square migration is complete.
-- Safe to re-run.

alter table public.reservations
  add column if not exists square_invoice_id text,
  add column if not exists square_invoice_version integer,
  add column if not exists square_invoice_status text,
  add column if not exists square_invoice_url text,
  add column if not exists square_contract_id text,
  add column if not exists square_contract_attached boolean not null default false,
  add column if not exists square_signature_required boolean not null default false;

create unique index if not exists reservations_square_invoice_unique
  on public.reservations (square_invoice_id)
  where square_invoice_id is not null;

create index if not exists reservations_square_invoice_status_idx
  on public.reservations (square_invoice_status)
  where square_invoice_status is not null;

alter table public.customers
  add column if not exists square_primary_card_id text,
  add column if not exists square_card_on_file boolean not null default false;

comment on column public.reservations.square_contract_id is
  'Manual Square Dashboard reference only. Square does not expose a public Contracts API as of this migration.';
comment on column public.reservations.square_contract_attached is
  'Seller-confirmed flag that the rental contract is attached to the Square invoice.';
comment on column public.reservations.square_signature_required is
  'Seller-confirmed flag that Require unsigned contracts to be signed before payment was enabled in Square.';
comment on column public.customers.square_primary_card_id is
  'Enabled Square card-on-file ID discovered after the customer explicitly opts to save a payment method.';
