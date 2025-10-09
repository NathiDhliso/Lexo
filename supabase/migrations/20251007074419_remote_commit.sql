create type "public"."bar_association" as enum ('johannesburg', 'cape_town');

create type "public"."client_type" as enum ('individual', 'corporate', 'government', 'ngo');

create type "public"."fee_type" as enum ('hourly', 'fixed', 'contingency', 'hybrid');

create type "public"."invoice_status" as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

create type "public"."matter_status" as enum ('active', 'inactive', 'closed', 'on_hold');

create type "public"."proforma_request_status" as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'converted');

create type "public"."risk_level" as enum ('low', 'medium', 'high');

create type "public"."user_role" as enum ('junior_advocate', 'senior_advocate', 'chambers_admin');

create table "public"."advocates" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "email" text not null,
    "full_name" text not null,
    "initials" text not null,
    "practice_number" text not null,
    "bar" bar_association not null,
    "year_admitted" integer not null,
    "hourly_rate" numeric(10,2) not null default 0,
    "phone_number" text,
    "chambers_address" text,
    "postal_address" text,
    "user_role" user_role default 'junior_advocate'::user_role,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."advocates" enable row level security;

create table "public"."expenses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "matter_id" uuid not null,
    "advocate_id" uuid not null,
    "description" text not null,
    "amount" numeric(12,2) not null,
    "expense_date" date not null default CURRENT_DATE,
    "category" text,
    "is_billed" boolean default false,
    "invoice_id" uuid,
    "receipt_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."expenses" enable row level security;

create table "public"."invoices" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "invoice_number" text,
    "matter_id" uuid,
    "advocate_id" uuid not null,
    "invoice_date" date not null default CURRENT_DATE,
    "due_date" date not null,
    "fees_amount" numeric(12,2) default 0,
    "disbursements_amount" numeric(12,2) default 0,
    "vat_rate" numeric(5,4) default 0.15,
    "subtotal" numeric(12,2) generated always as ((fees_amount + disbursements_amount)) stored,
    "vat_amount" numeric(12,2) generated always as (((fees_amount + disbursements_amount) * vat_rate)) stored,
    "total_amount" numeric(12,2) generated always as (((fees_amount + disbursements_amount) * ((1)::numeric + vat_rate))) stored,
    "amount_paid" numeric(12,2) default 0,
    "balance_due" numeric(12,2) generated always as ((((fees_amount + disbursements_amount) * ((1)::numeric + vat_rate)) - amount_paid)) stored,
    "status" invoice_status default 'draft'::invoice_status,
    "is_pro_forma" boolean default false,
    "fee_narrative" text,
    "internal_notes" text,
    "source_proforma_id" uuid,
    "sent_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."invoices" enable row level security;

create table "public"."matters" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "reference_number" text,
    "title" text not null,
    "description" text,
    "matter_type" text,
    "court_case_number" text,
    "client_name" text not null,
    "client_email" text,
    "client_phone" text,
    "client_address" text,
    "client_type" client_type default 'individual'::client_type,
    "instructing_attorney" text not null,
    "instructing_attorney_email" text,
    "instructing_attorney_phone" text,
    "instructing_firm" text,
    "instructing_firm_ref" text,
    "fee_type" fee_type default 'hourly'::fee_type,
    "estimated_fee" numeric(12,2),
    "fee_cap" numeric(12,2),
    "risk_level" risk_level default 'medium'::risk_level,
    "settlement_probability" integer,
    "expected_completion_date" date,
    "status" matter_status default 'active'::matter_status,
    "wip_value" numeric(12,2) default 0,
    "advocate_id" uuid not null,
    "source_proforma_id" uuid,
    "is_prepopulated" boolean default false,
    "tags" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "closed_at" timestamp with time zone,
    "date_instructed" date not null default CURRENT_DATE
);


alter table "public"."matters" enable row level security;

create table "public"."payments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "invoice_id" uuid not null,
    "amount" numeric(12,2) not null,
    "payment_date" date not null default CURRENT_DATE,
    "payment_method" text,
    "reference_number" text,
    "notes" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."payments" enable row level security;

create table "public"."proforma_requests" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "quote_number" text not null,
    "instructing_attorney_name" text not null,
    "instructing_attorney_email" text,
    "instructing_attorney_phone" text,
    "instructing_firm" text,
    "work_title" text not null,
    "work_description" text,
    "estimated_amount" numeric(12,2),
    "urgency" text,
    "status" proforma_request_status default 'draft'::proforma_request_status,
    "advocate_id" uuid not null,
    "converted_matter_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "sent_at" timestamp with time zone,
    "responded_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."proforma_requests" enable row level security;

create table "public"."time_entries" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "matter_id" uuid not null,
    "advocate_id" uuid not null,
    "description" text not null,
    "hours" numeric(5,2) not null,
    "hourly_rate" numeric(10,2) not null,
    "amount" numeric(12,2) generated always as ((hours * hourly_rate)) stored,
    "entry_date" date not null default CURRENT_DATE,
    "is_billed" boolean default false,
    "invoice_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."time_entries" enable row level security;

create table "public"."user_preferences" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "theme" text default 'light'::text,
    "notifications_enabled" boolean default true,
    "email_notifications" boolean default true,
    "preferences" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_preferences" enable row level security;

CREATE UNIQUE INDEX advocates_email_key ON public.advocates USING btree (email);

CREATE UNIQUE INDEX advocates_pkey ON public.advocates USING btree (id);

CREATE UNIQUE INDEX advocates_practice_number_key ON public.advocates USING btree (practice_number);

CREATE UNIQUE INDEX expenses_pkey ON public.expenses USING btree (id);

CREATE INDEX idx_expenses_advocate ON public.expenses USING btree (advocate_id);

CREATE INDEX idx_expenses_billed ON public.expenses USING btree (is_billed);

CREATE INDEX idx_expenses_date ON public.expenses USING btree (expense_date DESC);

CREATE INDEX idx_expenses_invoice ON public.expenses USING btree (invoice_id);

CREATE INDEX idx_expenses_matter ON public.expenses USING btree (matter_id);

CREATE INDEX idx_invoices_advocate ON public.invoices USING btree (advocate_id);

CREATE INDEX idx_invoices_date ON public.invoices USING btree (invoice_date DESC);

CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (due_date);

CREATE INDEX idx_invoices_matter ON public.invoices USING btree (matter_id);

CREATE INDEX idx_invoices_number ON public.invoices USING btree (invoice_number);

CREATE INDEX idx_invoices_source_proforma ON public.invoices USING btree (source_proforma_id);

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

CREATE INDEX idx_matters_advocate ON public.matters USING btree (advocate_id);

CREATE INDEX idx_matters_client_name ON public.matters USING btree (client_name);

CREATE INDEX idx_matters_created_at ON public.matters USING btree (created_at DESC);

CREATE INDEX idx_matters_date_instructed ON public.matters USING btree (date_instructed);

CREATE INDEX idx_matters_reference ON public.matters USING btree (reference_number);

CREATE INDEX idx_matters_source_proforma ON public.matters USING btree (source_proforma_id);

CREATE INDEX idx_matters_status ON public.matters USING btree (status);

CREATE INDEX idx_payments_date ON public.payments USING btree (payment_date DESC);

CREATE INDEX idx_payments_invoice ON public.payments USING btree (invoice_id);

CREATE INDEX idx_proforma_requests_advocate ON public.proforma_requests USING btree (advocate_id);

CREATE INDEX idx_proforma_requests_converted_matter ON public.proforma_requests USING btree (converted_matter_id);

CREATE INDEX idx_proforma_requests_created_at ON public.proforma_requests USING btree (created_at DESC);

CREATE INDEX idx_proforma_requests_quote_number ON public.proforma_requests USING btree (quote_number);

CREATE INDEX idx_proforma_requests_status ON public.proforma_requests USING btree (status);

CREATE INDEX idx_time_entries_advocate ON public.time_entries USING btree (advocate_id);

CREATE INDEX idx_time_entries_billed ON public.time_entries USING btree (is_billed);

CREATE INDEX idx_time_entries_date ON public.time_entries USING btree (entry_date DESC);

CREATE INDEX idx_time_entries_invoice ON public.time_entries USING btree (invoice_id);

CREATE INDEX idx_time_entries_matter ON public.time_entries USING btree (matter_id);

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX matters_pkey ON public.matters USING btree (id);

CREATE UNIQUE INDEX matters_reference_number_key ON public.matters USING btree (reference_number);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX proforma_requests_pkey ON public.proforma_requests USING btree (id);

CREATE UNIQUE INDEX proforma_requests_quote_number_key ON public.proforma_requests USING btree (quote_number);

CREATE UNIQUE INDEX time_entries_pkey ON public.time_entries USING btree (id);

CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (id);

CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id);

alter table "public"."advocates" add constraint "advocates_pkey" PRIMARY KEY using index "advocates_pkey";

alter table "public"."expenses" add constraint "expenses_pkey" PRIMARY KEY using index "expenses_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."matters" add constraint "matters_pkey" PRIMARY KEY using index "matters_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."proforma_requests" add constraint "proforma_requests_pkey" PRIMARY KEY using index "proforma_requests_pkey";

alter table "public"."time_entries" add constraint "time_entries_pkey" PRIMARY KEY using index "time_entries_pkey";

alter table "public"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "public"."advocates" add constraint "advocates_email_key" UNIQUE using index "advocates_email_key";

alter table "public"."advocates" add constraint "advocates_practice_number_key" UNIQUE using index "advocates_practice_number_key";

alter table "public"."expenses" add constraint "expenses_advocate_id_fkey" FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE not valid;

alter table "public"."expenses" validate constraint "expenses_advocate_id_fkey";

alter table "public"."expenses" add constraint "expenses_amount_check" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."expenses" validate constraint "expenses_amount_check";

alter table "public"."expenses" add constraint "expenses_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE not valid;

alter table "public"."expenses" validate constraint "expenses_matter_id_fkey";

alter table "public"."invoices" add constraint "invoices_advocate_id_fkey" FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_advocate_id_fkey";

alter table "public"."invoices" add constraint "invoices_invoice_number_key" UNIQUE using index "invoices_invoice_number_key";

alter table "public"."invoices" add constraint "invoices_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE SET NULL not valid;

alter table "public"."invoices" validate constraint "invoices_matter_id_fkey";

alter table "public"."invoices" add constraint "invoices_source_proforma_id_fkey" FOREIGN KEY (source_proforma_id) REFERENCES proforma_requests(id) ON DELETE SET NULL not valid;

alter table "public"."invoices" validate constraint "invoices_source_proforma_id_fkey";

alter table "public"."matters" add constraint "matters_advocate_id_fkey" FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE not valid;

alter table "public"."matters" validate constraint "matters_advocate_id_fkey";

alter table "public"."matters" add constraint "matters_reference_number_key" UNIQUE using index "matters_reference_number_key";

alter table "public"."matters" add constraint "matters_settlement_probability_check" CHECK (((settlement_probability >= 0) AND (settlement_probability <= 100))) not valid;

alter table "public"."matters" validate constraint "matters_settlement_probability_check";

alter table "public"."matters" add constraint "matters_source_proforma_id_fkey" FOREIGN KEY (source_proforma_id) REFERENCES proforma_requests(id) ON DELETE SET NULL not valid;

alter table "public"."matters" validate constraint "matters_source_proforma_id_fkey";

alter table "public"."payments" add constraint "payments_amount_check" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."payments" validate constraint "payments_amount_check";

alter table "public"."payments" add constraint "payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_invoice_id_fkey";

alter table "public"."proforma_requests" add constraint "proforma_requests_advocate_id_fkey" FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE not valid;

alter table "public"."proforma_requests" validate constraint "proforma_requests_advocate_id_fkey";

alter table "public"."proforma_requests" add constraint "proforma_requests_quote_number_key" UNIQUE using index "proforma_requests_quote_number_key";

alter table "public"."proforma_requests" add constraint "proforma_requests_urgency_check" CHECK ((urgency = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."proforma_requests" validate constraint "proforma_requests_urgency_check";

alter table "public"."proforma_requests" add constraint "valid_email" CHECK (((instructing_attorney_email IS NULL) OR (instructing_attorney_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))) not valid;

alter table "public"."proforma_requests" validate constraint "valid_email";

alter table "public"."time_entries" add constraint "time_entries_advocate_id_fkey" FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE not valid;

alter table "public"."time_entries" validate constraint "time_entries_advocate_id_fkey";

alter table "public"."time_entries" add constraint "time_entries_hours_check" CHECK ((hours > (0)::numeric)) not valid;

alter table "public"."time_entries" validate constraint "time_entries_hours_check";

alter table "public"."time_entries" add constraint "time_entries_matter_id_fkey" FOREIGN KEY (matter_id) REFERENCES matters(id) ON DELETE CASCADE not valid;

alter table "public"."time_entries" validate constraint "time_entries_matter_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES advocates(id) ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_key" UNIQUE using index "user_preferences_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  inv_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%'
  AND is_pro_forma = false;
  
  inv_num := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN inv_num;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_matter_reference(p_bar bar_association)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  bar_prefix TEXT;
  year_part TEXT;
  sequence_num INTEGER;
  ref_num TEXT;
BEGIN
  bar_prefix := CASE p_bar 
    WHEN 'johannesburg' THEN 'JHB'
    WHEN 'cape_town' THEN 'CPT'
  END;
  
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d{4}/(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM matters
  WHERE reference_number LIKE bar_prefix || '/' || year_part || '/%';
  
  ref_num := bar_prefix || '/' || year_part || '/' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN ref_num;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_quote_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  quote_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(quote_number FROM 'PF-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM proforma_requests
  WHERE quote_number LIKE 'PF-' || year_part || '-%';
  
  quote_num := 'PF-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN quote_num;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_metadata JSONB;
  practice_num TEXT;
BEGIN
  -- Get user metadata from the auth.users table
  user_metadata := NEW.raw_user_meta_data;
  
  -- Generate a practice number if not provided
  practice_num := COALESCE(
    user_metadata->>'practice_number',
    'TEMP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Insert into advocates table
  INSERT INTO public.advocates (
    id,
    email,
    full_name,
    initials,
    practice_number,
    bar,
    year_admitted,
    hourly_rate,
    user_role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(user_metadata->>'full_name', 'New Advocate'),
    COALESCE(
      user_metadata->>'initials',
      UPPER(LEFT(SPLIT_PART(COALESCE(user_metadata->>'full_name', 'N A'), ' ', 1), 1)) || 
      UPPER(LEFT(SPLIT_PART(COALESCE(user_metadata->>'full_name', 'N A'), ' ', 2), 1))
    ),
    practice_num,
    CASE 
      WHEN user_metadata->>'bar' = 'cape_town' THEN 'cape_town'::bar_association
      ELSE 'johannesburg'::bar_association
    END,
    COALESCE((user_metadata->>'year_admitted')::INTEGER, EXTRACT(YEAR FROM NOW())::INTEGER),
    COALESCE((user_metadata->>'hourly_rate')::DECIMAL, 1500.00),
    CASE 
      WHEN user_metadata->>'user_type' = 'senior' THEN 'senior_advocate'::user_role
      ELSE 'junior_advocate'::user_role
    END,
    true,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create advocate record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.link_converted_matter_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE proforma_requests
  SET converted_matter_id = NEW.id,
      status = 'converted'
  WHERE id = NEW.source_proforma_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_invoice_number_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.invoice_number := generate_invoice_number();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_matter_reference_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.reference_number := generate_matter_reference(
    (SELECT bar FROM advocates WHERE id = NEW.advocate_id)
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_quote_number_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.quote_number := generate_quote_number();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_matter_wip()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE matters
  SET wip_value = (
    SELECT COALESCE(SUM(amount), 0)
    FROM time_entries
    WHERE matter_id = NEW.matter_id
    AND is_billed = false
  ) + (
    SELECT COALESCE(SUM(amount), 0)
    FROM expenses
    WHERE matter_id = NEW.matter_id
    AND is_billed = false
  )
  WHERE id = NEW.matter_id;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

create policy "Users can create their own profile"
on "public"."advocates"
as permissive
for insert
to public
with check ((id = auth.uid()));


create policy "Users can update their own profile"
on "public"."advocates"
as permissive
for update
to public
using ((id = auth.uid()));


create policy "Users can view their own profile"
on "public"."advocates"
as permissive
for select
to public
using ((id = auth.uid()));


create policy "Users can create expenses"
on "public"."expenses"
as permissive
for insert
to public
with check ((advocate_id = auth.uid()));


create policy "Users can delete their own unbilled expenses"
on "public"."expenses"
as permissive
for delete
to public
using (((advocate_id = auth.uid()) AND (is_billed = false)));


create policy "Users can update their own expenses"
on "public"."expenses"
as permissive
for update
to public
using ((advocate_id = auth.uid()));


create policy "Users can view their own expenses"
on "public"."expenses"
as permissive
for select
to public
using ((advocate_id = auth.uid()));


create policy "Users can create invoices"
on "public"."invoices"
as permissive
for insert
to public
with check ((advocate_id = auth.uid()));


create policy "Users can update their own invoices"
on "public"."invoices"
as permissive
for update
to public
using ((advocate_id = auth.uid()));


create policy "Users can view their own invoices"
on "public"."invoices"
as permissive
for select
to public
using ((advocate_id = auth.uid()));


create policy "Users can create matters"
on "public"."matters"
as permissive
for insert
to public
with check ((advocate_id = auth.uid()));


create policy "Users can update their own matters"
on "public"."matters"
as permissive
for update
to public
using ((advocate_id = auth.uid()));


create policy "Users can view their own matters"
on "public"."matters"
as permissive
for select
to public
using ((advocate_id = auth.uid()));


create policy "Users can create payments for their invoices"
on "public"."payments"
as permissive
for insert
to public
with check ((invoice_id IN ( SELECT invoices.id
   FROM invoices
  WHERE (invoices.advocate_id = auth.uid()))));


create policy "Users can view payments for their invoices"
on "public"."payments"
as permissive
for select
to public
using ((invoice_id IN ( SELECT invoices.id
   FROM invoices
  WHERE (invoices.advocate_id = auth.uid()))));


create policy "Users can create proforma requests"
on "public"."proforma_requests"
as permissive
for insert
to public
with check ((advocate_id = auth.uid()));


create policy "Users can delete their own draft proforma requests"
on "public"."proforma_requests"
as permissive
for delete
to public
using (((advocate_id = auth.uid()) AND (status = 'draft'::proforma_request_status)));


create policy "Users can update their own proforma requests"
on "public"."proforma_requests"
as permissive
for update
to public
using ((advocate_id = auth.uid()));


create policy "Users can view their own proforma requests"
on "public"."proforma_requests"
as permissive
for select
to public
using ((advocate_id = auth.uid()));


create policy "Users can create time entries"
on "public"."time_entries"
as permissive
for insert
to public
with check ((advocate_id = auth.uid()));


create policy "Users can delete their own unbilled time entries"
on "public"."time_entries"
as permissive
for delete
to public
using (((advocate_id = auth.uid()) AND (is_billed = false)));


create policy "Users can update their own time entries"
on "public"."time_entries"
as permissive
for update
to public
using ((advocate_id = auth.uid()));


create policy "Users can view their own time entries"
on "public"."time_entries"
as permissive
for select
to public
using ((advocate_id = auth.uid()));


create policy "Users can insert their own preferences"
on "public"."user_preferences"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can update their own preferences"
on "public"."user_preferences"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view their own preferences"
on "public"."user_preferences"
as permissive
for select
to public
using ((user_id = auth.uid()));


CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matter_wip_on_expense AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_matter_wip();

CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW WHEN (((new.invoice_number IS NULL) AND (new.is_pro_forma = false))) EXECUTE FUNCTION set_invoice_number_trigger();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER link_converted_matter AFTER INSERT ON public.matters FOR EACH ROW WHEN ((new.source_proforma_id IS NOT NULL)) EXECUTE FUNCTION link_converted_matter_trigger();

CREATE TRIGGER set_matter_reference BEFORE INSERT ON public.matters FOR EACH ROW WHEN ((new.reference_number IS NULL)) EXECUTE FUNCTION set_matter_reference_trigger();

CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON public.matters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_proforma_quote_number BEFORE INSERT ON public.proforma_requests FOR EACH ROW WHEN ((new.quote_number IS NULL)) EXECUTE FUNCTION set_quote_number_trigger();

CREATE TRIGGER update_proforma_requests_updated_at BEFORE UPDATE ON public.proforma_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_matter_wip_on_time_entry AFTER INSERT OR DELETE OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_matter_wip();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


