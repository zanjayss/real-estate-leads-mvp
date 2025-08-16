CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  source text,
  city text,
  state text,
  created_at timestamptz DEFAULT now()
);
