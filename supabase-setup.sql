-- Run this in Supabase SQL Editor

-- Users table (extends Supabase auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  plan text default 'free',
  plan_expires_at timestamp with time zone,
  razorpay_payment_id text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: users can only see their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run above function on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bots table
create table if not exists public.bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text,
  company text,
  color text default '#5b5ef4',
  tone text default 'friendly',
  biz_desc text,
  faqs text,
  quick_replies text,
  languages text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table public.bots enable row level security;

create policy "Users can manage own bots"
  on public.bots for all
  using (auth.uid() = user_id);


-- Leads table (chat leads captured by widget)
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  bot_id uuid references public.bots(id) on delete cascade,
  name text,
  email text,
  rating integer,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table public.leads enable row level security;

create policy "Bot owners can view their leads"
  on public.leads for all
  using (
    auth.uid() = (select user_id from public.bots where id = bot_id)
  );

-- Allow widget to insert leads (no auth needed)
create policy "Anyone can insert leads"
  on public.leads for insert
  with check (true);
