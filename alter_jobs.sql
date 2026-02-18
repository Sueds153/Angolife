-- Add application_email column to jobs table
alter table public.jobs
add column if not exists application_email text;