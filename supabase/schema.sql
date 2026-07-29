-- Watcher Platform — DB Schema
-- Two tables serve every watcher type. Adding a new watcher type (Phase 2, 3...) is
-- new rows + a new fetcher script — never a schema change.

CREATE TABLE rates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watcher_type TEXT          NOT NULL,  -- 'fuel' | 'gold' | 'currency' | 'loan' | 'fd' | 'stock'
  country      TEXT          NOT NULL,  -- ISO 2-letter: 'IN', 'US'
  region       TEXT,                    -- city/state slug; NULL = national average
  subtype      TEXT,                    -- 'petrol' | 'diesel' | 'gasoline' | 'gold_22k' | ...
  value        NUMERIC(10,2) NOT NULL,
  unit         TEXT          NOT NULL,  -- '₹/L', '$/gal', '₹/10g', ...
  source       TEXT          NOT NULL,  -- 'iocl', 'eia', 'mcx', 'computed'
  fetched_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rates_lookup
  ON rates (watcher_type, country, region, subtype, fetched_at DESC);

-- Separate index to quickly get the latest entry per combination
CREATE INDEX idx_rates_latest
  ON rates (watcher_type, country, region, subtype)
  INCLUDE (value, unit, fetched_at);


CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT,                    -- NULL if WhatsApp channel
  phone        TEXT,                    -- NULL if email; E.164 format
  channel      TEXT          NOT NULL,  -- 'email' | 'whatsapp'
  watcher_type TEXT          NOT NULL,
  country      TEXT          NOT NULL,
  region       TEXT,                    -- NULL = national average
  subtype      TEXT,                    -- matches rates.subtype
  operator     TEXT          NOT NULL,  -- 'above' | 'below' | 'change_pct'
  threshold    NUMERIC(10,2) NOT NULL,
  status       TEXT          NOT NULL DEFAULT 'pending',
                                       -- pending | confirmed | triggered | expired
  token        TEXT          NOT NULL UNIQUE,
  last_value   NUMERIC(10,2),          -- rate value at last check (for change_pct logic)
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  triggered_at TIMESTAMPTZ,

  CONSTRAINT alerts_contact_check CHECK (
    (channel = 'email' AND email IS NOT NULL AND phone IS NULL) OR
    (channel = 'whatsapp' AND phone IS NOT NULL AND email IS NULL)
  )
);

CREATE INDEX idx_alerts_check
  ON alerts (watcher_type, country, region, subtype, status)
  WHERE status = 'confirmed';

CREATE INDEX idx_alerts_token ON alerts (token);
CREATE INDEX idx_alerts_email ON alerts (email) WHERE email IS NOT NULL;
CREATE INDEX idx_alerts_phone ON alerts (phone) WHERE phone IS NOT NULL;
