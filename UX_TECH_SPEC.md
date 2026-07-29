# Watcher Platform — UX & Tech Spec
**Phase 1: Fuel Price Watcher** | India + US | Extensible engine for all future watcher types

---

## UX Spec

### 1. Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — value prop + watcher card grid |
| `/fuel-price/india` | India national average + city list |
| `/fuel-price/india/[city]` | City detail — petrol + diesel, alert module |
| `/fuel-price/us` | US national average + state list |
| `/fuel-price/us/[state]` | State detail — gasoline + diesel, alert module |

**Route convention for extensibility:**
Pattern is `/{watcher-slug}/{country}/{region}`. Adding Phase 2 (Gold) is `/gold-price/india`, `/gold-price/us` — no structural change. `watcher-slug` maps to `watcher_type` in DB.

---

### 2. User Flows

#### 2.1 First Visit — Geo-Detection

1. User hits `/` or `/fuel-price`
2. Cloudflare Worker reads `CF-IPCountry` header → maps to country
3. India → serve `/fuel-price/india`; US → serve `/fuel-price/us`; anything else → default India
4. Detected country written to `localStorage['watcher_country']`
5. On re-visit, `localStorage` value takes precedence over geo-detection

#### 2.2 Country Switching

1. User clicks flag/dropdown in persistent header
2. Dropdown shows available countries (India, US). Future countries show greyed "Coming Soon" badge, no click target.
3. Selection updates `localStorage['watcher_country']` and navigates to equivalent page
4. If no equivalent page exists (e.g. switching from a city to a country with no matching region), redirect to country root (`/fuel-price/us`)

#### 2.3 Alert Signup — Email

1. User fills inline alert form: condition + threshold + email address
2. `POST /api/alerts` → inserts row with `status: pending`, generates `token`, sends confirmation email
3. User clicks confirmation link → `GET /api/alerts/confirm/[token]` → status set to `confirmed`
4. Alert cron matches confirmed alerts against latest rate → sends trigger email → sets `status: triggered`
5. Every email contains an unsubscribe link → `DELETE /api/alerts/unsubscribe/[token]` → sets `status: expired`

#### 2.4 Alert Signup — WhatsApp

1. Same form as email, but channel toggled to "WhatsApp"; phone field shown instead of email
2. `POST /api/alerts` → inserts row with `status: pending`, sends wa.me opt-in link in response
3. User taps wa.me link → opens WhatsApp, sends opt-in reply
4. WhatsApp Cloud API webhook → `POST /api/alerts/whatsapp-confirm` → status set to `confirmed`
5. On trigger: alert cron sends WhatsApp message via Cloud API
6. User replies "STOP" → webhook sets status to `expired`

#### 2.5 Error Recovery

- Confirmation not received → re-send link at `/alerts/resend?email=X`
- Confirmation already done → idempotent confirm endpoint returns 200 silently
- Unsubscribe already expired → endpoint returns 200 silently

---

### 3. Component Inventory

#### 3.1 Header
- Logo/wordmark (left)
- Country switcher: flag icon + country name + dropdown (right)
- Dropdown lists available countries with "Live" or "Coming Soon" badge
- Sticky on scroll; collapses to icon-only switcher on mobile

#### 3.2 Homepage Card Grid
- 2-col desktop, 1-col mobile
- **Fuel Price card (live):** current national average for detected country, trend arrow, "View prices →" CTA
- **Coming Soon cards (6 total):** watcher name, one-line description, greyed "Coming Soon" badge — no click target, no fake stats
- Cards ordered to match roadmap sequence from PRD

#### 3.3 Country/Region Hero
- Large current value (petrol or gasoline price)
- Sub-label: fuel type, unit (₹/L or $/gal), last-updated timestamp
- Trend indicator: up/down arrow + delta since previous fetch
- Secondary value below: diesel

#### 3.4 Regional Breakdown Table
- Columns: Region | Petrol/Gasoline | Diesel | Last Updated
- Sorted alphabetically; sticky header row
- Each row links to the region's detail page
- `overflow-x: auto` container; `font-variant-numeric: tabular-nums` on price columns
- India: city rows | US: state rows

#### 3.5 Alert Module (Inline)
- Position: below hero, above regional table
- No modal — fully inline on page
- Fields:
  - Condition selector: "Price goes above" / "Price drops below" / "Price changes by more than X%"
  - Threshold input: number field with unit label (₹/L, $/gal, or %)
  - Channel toggle: Email / WhatsApp
  - Email field (when Email selected) or Phone field (when WhatsApp selected)
  - Submit: "Notify me"
- Success: inline confirmation message, no page reload
- Error: inline field-level validation messages

#### 3.6 Ad Slots
- **Slot A:** Below hero, above alert module — leaderboard (728×90 desktop, 320×50 mobile)
- **Slot B:** Between alert module and regional table — responsive in-content unit
- **Slot C:** Below regional table — leaderboard or large rectangle
- All slots visually separated from content; "Advertisement" label per AdSense policy

#### 3.7 SEO Content Block
- Static, written once per page — not daily content
- H2 "About [City/State] Fuel Prices" — 2–3 short paragraphs for dwell time + search intent
- Links to related regions

---

### 4. Empty & Error States

| State | Behavior |
|-------|----------|
| Data fetch failed | Hero shows "—" + last-known timestamp + "Data temporarily unavailable" badge |
| No regional data | Table shows single empty-state row: "No regional data available" |
| Alert form — invalid email | Inline error below field; submit blocked |
| Alert form — invalid threshold | Inline error below threshold input; submit blocked |
| Alert form — duplicate active alert | Message: "You already have an active alert for this condition." with manage link |
| Region page not found | Redirect to country root; no 404 page needed in Phase 1 |

---

## Tech Spec

### 1. DB Schema

Two tables serve every watcher type. Adding a new watcher is new rows and a new fetcher — never a schema change.

```sql
CREATE TABLE rates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watcher_type TEXT        NOT NULL,  -- 'fuel' | 'gold' | 'currency' | ...
  country      TEXT        NOT NULL,  -- ISO 2-letter: 'IN', 'US'
  region       TEXT,                  -- city/state slug; NULL = national average
  subtype      TEXT,                  -- fuel_type: 'petrol'|'diesel'|'gasoline'; metal: 'gold'|'silver'
  value        NUMERIC(10,2) NOT NULL,
  unit         TEXT        NOT NULL,  -- '₹/L', '$/gal', '₹/10g', ...
  source       TEXT        NOT NULL,  -- 'iocl', 'eia', 'mcx', ...
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rates_lookup
  ON rates (watcher_type, country, region, subtype, fetched_at DESC);


CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT,                  -- NULL if WhatsApp channel
  phone        TEXT,                  -- NULL if email channel; E.164 format
  channel      TEXT        NOT NULL,  -- 'email' | 'whatsapp'
  watcher_type TEXT        NOT NULL,
  country      TEXT        NOT NULL,
  region       TEXT,                  -- NULL = national average
  subtype      TEXT,                  -- matches rates.subtype ('petrol', 'gasoline', ...)
  operator     TEXT        NOT NULL,  -- 'above' | 'below' | 'change_pct'
  threshold    NUMERIC(10,2) NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending',
                                     -- pending | confirmed | triggered | expired
  token        TEXT        NOT NULL UNIQUE,
  last_value   NUMERIC(10,2),        -- rate value at last check (for change_pct logic)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_check
  ON alerts (watcher_type, country, region, subtype, status);
```

---

### 2. API Routes

#### `GET /api/rates`

Returns the latest cached rate(s). Reads a `DISTINCT ON` query — only the most recent row per combination.

Query params: `watcher_type`, `country`, `region?`, `subtype?`

```ts
// Response 200
{
  watcher_type: string
  country: string
  region: string | null
  rates: Array<{
    subtype: string          // 'petrol' | 'diesel' | 'gasoline' | ...
    value: number
    unit: string
    fetched_at: string       // ISO 8601
    trend: 'up' | 'down' | 'flat'
    delta: number            // absolute change since previous fetch
  }>
}
```

Cache: `Cache-Control: s-maxage=1800, stale-while-revalidate=3600`

#### `GET /api/rates/table`

Returns all regions for a given watcher+country (for the regional breakdown table).

Query params: `watcher_type`, `country`

```ts
// Response 200
{
  watcher_type: string
  country: string
  regions: Array<{
    region: string
    slug: string
    rates: Array<{
      subtype: string
      value: number
      unit: string
      fetched_at: string
    }>
  }>
}
```

#### `POST /api/alerts`

Creates a new alert. Idempotent on (email/phone + watcher_type + country + region + subtype + operator + threshold).

```ts
// Request body
{
  channel:      'email' | 'whatsapp'
  email?:       string   // required if channel = 'email'
  phone?:       string   // required if channel = 'whatsapp', E.164 format
  watcher_type: string
  country:      string
  region?:      string
  subtype:      string
  operator:     'above' | 'below' | 'change_pct'
  threshold:    number
}

// Response 201
{ message: 'Confirmation sent' }

// Response 409 — duplicate active alert
{ message: 'Alert already active', alert_id: string }
```

#### `GET /api/alerts/confirm/[token]`

Sets `status: pending` → `confirmed`. Idempotent. Returns an HTML confirmation page (not JSON).

#### `DELETE /api/alerts/unsubscribe/[token]`

Sets `status` → `expired`. Idempotent. Returns an HTML unsubscribe confirmation page.

#### `POST /api/alerts/whatsapp-confirm`

Webhook from WhatsApp Cloud API. Verifies HMAC signature, finds pending alert by phone, sets `status: confirmed`.

---

### 3. Fetcher Design

One Cloudflare Workers Cron Trigger per `watcher_type + country`. Each fetcher is a standalone function conforming to a shared interface.

**Shared fetcher interface (extensibility):**

```ts
interface FetcherConfig {
  watcher_type: string
  country:      string
  cron:         string                         // cron expression
  fetch:        () => Promise<RateRow[]>       // returns parsed rows; throws on unrecoverable error
}

interface RateRow {
  country:  string
  region:   string | null
  subtype:  string
  value:    number
  unit:     string
  source:   string
}

// Phase 2 example (Gold India):
// { watcher_type: 'gold', country: 'IN', cron: '*/15 9-15 * * 1-5', fetch: fetchMCXGold }
```

#### India Fuel Fetcher (IOCL/BPCL/HPCL) — daily

```
CRON: 0 6 * * *   # 06:00 UTC = 11:30 IST — after daily revision

for each city in INDIA_CITIES_CONFIG:
  response = fetch(city_source_url)
  if fetch fails:
    log_structured_error({ city, url, error })
    continue  # don't abort the whole run on one city

  { petrol, diesel } = parse_html(response.body)

  db.insert('rates', [
    { watcher_type: 'fuel', country: 'IN', region: city.slug,
      subtype: 'petrol', value: petrol, unit: '₹/L', source: 'iocl' },
    { watcher_type: 'fuel', country: 'IN', region: city.slug,
      subtype: 'diesel', value: diesel, unit: '₹/L', source: 'iocl' },
  ])

# After all cities: compute and store national average
avg_petrol = mean(all_city_petrol_values)
avg_diesel = mean(all_city_diesel_values)
db.insert('rates', [
  { watcher_type: 'fuel', country: 'IN', region: null,
    subtype: 'petrol', value: avg_petrol, unit: '₹/L', source: 'computed' },
  { watcher_type: 'fuel', country: 'IN', region: null,
    subtype: 'diesel', value: avg_diesel, unit: '₹/L', source: 'computed' },
])
```

#### US Fuel Fetcher (EIA API) — weekly

```
CRON: 0 18 * * 1  # 18:00 UTC Monday — EIA releases ~1pm ET

response = fetch('https://api.eia.gov/v2/petroleum/pri/gnd/data/', {
  params: {
    api_key: EIA_API_KEY,
    frequency: 'weekly',
    'facets[product]': ['EPM0', 'EPD2D'],  # gasoline + diesel
    'facets[duoarea]': STATE_CODES,
  }
})

for each row in response.data:
  db.insert('rates', {
    watcher_type: 'fuel', country: 'US',
    region: state_slug(row.duoarea),
    subtype: product_to_subtype(row.product),  # 'gasoline' | 'diesel'
    value: row.value,
    unit: '$/gal',
    source: 'eia',
  })

# National average row is included in EIA response (duoarea = 'NUS')
```

---

### 4. Alert Check Logic

Runs as a separate cron, scheduled 30 min after each fetcher to ensure fresh data is available.

```
CRON: 30 6 * * *    # Daily — 30 min after India fetcher
CRON: 30 18 * * 1   # Weekly — 30 min after US fetcher

confirmed_alerts = db.query(
  "SELECT * FROM alerts WHERE status = 'confirmed'"
)

for each alert in confirmed_alerts:
  latest_rate = db.query("""
    SELECT value FROM rates
    WHERE watcher_type = $1 AND country = $2
      AND region IS NOT DISTINCT FROM $3
      AND subtype = $4
    ORDER BY fetched_at DESC LIMIT 1
  """, [alert.watcher_type, alert.country, alert.region, alert.subtype])

  should_trigger = false

  if alert.operator == 'above':
    should_trigger = latest_rate.value > alert.threshold

  elif alert.operator == 'below':
    should_trigger = latest_rate.value < alert.threshold

  elif alert.operator == 'change_pct' and alert.last_value is not null:
    pct_change = abs(latest_rate.value - alert.last_value) / alert.last_value * 100
    should_trigger = pct_change > alert.threshold

  db.update('alerts', { last_value: latest_rate.value }, { id: alert.id })

  if should_trigger:
    send_alert(alert, latest_rate)
    db.update('alerts', {
      status: 'triggered',
      triggered_at: NOW()
    }, { id: alert.id })
    # Phase 1: single-fire. Phase 2+: consider resetting to 'confirmed' for recurring alerts.
```

**Email template (trigger):**
Subject: `⛽ Alert: {City} petrol is now ₹{value}/L`
Body: current value, condition that triggered, timestamp, unsubscribe link.

**WhatsApp message (trigger):**
`⛽ {City} petrol is ₹{value}/L — your alert triggered (you set: {condition}). Reply STOP to unsubscribe.`

---

### 5. Caching Strategy

| Layer | Strategy |
|-------|----------|
| Page HTML (known regions) | SSG at build time; ISR `revalidate = 3600` |
| `/api/rates` | `Cache-Control: s-maxage=1800, stale-while-revalidate=3600`; Cloudflare edge caches |
| `/api/rates/table` | Same cache headers as `/api/rates` |
| Geo-detection | Cloudflare Worker reads `CF-IPCountry` header — no external API call on Cloudflare |
| Alert endpoints | No caching — always hits origin |

All visitors for the same country+region share a single cached response. Cost scales with fetcher poll frequency, not traffic.

---

### 6. Infra Setup Order

1. Register domain at Porkbun → point nameservers to Cloudflare
2. Create Supabase project → run schema SQL → note `DATABASE_URL`
3. Set up Cloudflare Pages → connect repo → configure Next.js build → set `DATABASE_URL` env var
4. Deploy India fetcher (Cloudflare Workers Cron) → verify rows appear in DB
5. Register EIA API key (free at eia.gov) → deploy US fetcher → verify
6. Configure transactional email (Resend / Postmark free tier) → set `EMAIL_API_KEY`
7. Set up WhatsApp Cloud API (Meta for Developers → Business Account → phone number) → set `WHATSAPP_TOKEN`
8. Deploy alert check cron → run end-to-end alert test (email + WhatsApp)
9. Apply for Google AdSense → add ad slot code → verify policy compliance
10. Submit sitemap to Google Search Console → monitor indexing

---

*Next: engineering task breakdown and sprint plan once this spec is signed off.*
