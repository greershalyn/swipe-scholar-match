

# QR Code Points System with Scan Limits and Badge Integration

## Overview
Build a QR code system where admins create QR codes with point values, configurable scan frequency limits, and optional badge rewards tied to scan milestones.

## Database

**New table: `qr_codes`**
- `id` (uuid, PK), `code` (text, unique) — random string for QR
- `name` (text) — admin label
- `points_value` (integer) — points per scan
- `max_total_redemptions` (integer, nullable) — global cap
- `current_redemptions` (integer, default 0)
- `redemption_limit_type` (text, default 'once') — `'once'`, `'daily'`, `'weekly'`, `'monthly'`, `'unlimited'`, `'lifetime_limit'`
- `redemption_limit_count` (integer, default 1) — used with `lifetime_limit`
- `badge_id` (uuid, nullable, FK → badges) — optional badge awarded after hitting scan threshold
- `badge_scan_threshold` (integer, nullable) — number of scans needed to earn the badge
- `is_active` (boolean, default true)
- `expires_at` (timestamptz, nullable)
- `created_at`, `updated_at`

**New table: `qr_code_redemptions`**
- `id` (uuid, PK)
- `qr_code_id` (uuid, FK → qr_codes)
- `user_id` (uuid)
- `points_awarded` (integer)
- `created_at` (timestamptz)

RLS: service_role full access; super_admins manage `qr_codes`; users read own redemptions.

## Edge Function: `redeem-qr-code`

1. Authenticate user, verify student status
2. Validate QR code (exists, active, not expired, global cap not hit)
3. Check per-user frequency based on `redemption_limit_type`:
   - `once` — zero prior redemptions
   - `daily` — none in last 24 hours
   - `weekly` — none in last 7 days
   - `monthly` — none in last 30 days
   - `lifetime_limit` — fewer than `redemption_limit_count` total
   - `unlimited` — always allowed
4. Insert redemption, increment `current_redemptions`, award points (same pattern as promo codes)
5. **Badge check**: If `badge_id` is set, count user's total redemptions for this QR code. If count equals `badge_scan_threshold`, award the badge (insert into `user_badges`, award badge points, send notification) — same logic as `check-badges`
6. Send points notification

## Admin UI: QR Codes Tab

New tab in Admin page (super_admins only):
- **Create form**: name, points value, limit type dropdown, limit count (for lifetime_limit), max total redemptions, expiration, badge dropdown (populated from existing badges), badge scan threshold
- Auto-generates unique code, renders QR image via `qrcode.react` encoding URL `https://swipe-scholar-match.lovable.app/qr/{code}`
- List of existing QR codes with status, redemption count, download/copy QR image, toggle active

## Student Scan Flow

- New route `/qr/:code` → `QRRedeem.tsx`
- Checks auth + verification, calls `redeem-qr-code` edge function
- Shows success (points + badge if earned) or error message
- Students scan with phone camera which opens the URL

## Dependencies

- Install `qrcode.react` npm package

## Files to Create/Modify

1. **Migration** — `qr_codes` and `qr_code_redemptions` tables with RLS
2. **`supabase/functions/redeem-qr-code/index.ts`** — redemption + badge logic
3. **`src/components/admin/QRCodesTab.tsx`** — admin UI
4. **`src/pages/Admin.tsx`** — add QR Codes tab
5. **`src/pages/QRRedeem.tsx`** — student redemption page
6. **`src/App.tsx`** — add `/qr/:code` route

