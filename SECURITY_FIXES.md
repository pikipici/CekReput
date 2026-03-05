# Security & Production Readiness Fixes

This document summarizes all fixes applied to address the production readiness audit findings.

## P0 - Critical (Must Fix Before Production)

### 1. Schema Migration Drift ✅
**Issue:** Schema uses `reputation_score` and `badges` columns, but migrations didn't include them.

**Fix:**
- Created migration `0006_add_reputation_fields.sql` to add missing columns
- Updated migration snapshot and journal files
- Fresh DB deployments will now work correctly

**Files:**
- `apps/api/src/db/migrations/0006_add_reputation_fields.sql`
- `apps/api/src/db/migrations/meta/0006_snapshot.json`
- `apps/api/src/db/migrations/meta/_journal.json`

---

### 2. Environment Template Sync ✅
**Issue:** `.env.example` files were missing critical variables.

**Fix:**
- Created comprehensive `apps/api/.env.example` with:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `R2_*` (Cloudflare R2 storage)
  - `REDIS_URL`
  - `TURNSTILE_SECRET_KEY`
  - `GOOGLE_CLIENT_ID`
  
- Created comprehensive `apps/web/.env.example` with:
  - `VITE_API_URL`
  - `VITE_GOOGLE_CLIENT_ID`
  - `VITE_TURNSTILE_SITE_KEY`

**Files:**
- `apps/api/.env.example`
- `apps/web/.env.example`

---

### 3. Security Defaults - JWT Secrets ✅
**Issue:** JWT secrets had hardcoded fallbacks, dangerous in production.

**Fix:**
- Added validation to throw error in production if secrets are missing
- Kept development fallback for local development convenience
- Centralized secret management with helper functions

**Files:**
- `apps/api/src/middleware/auth.ts`

---

### 4. Security Defaults - Turnstile ✅
**Issue:** Turnstile auto-bypassed when secret not set.

**Fix:**
- Now fails securely in production (returns `false`)
- Only bypasses in non-production environments
- Added clear error logging for production misconfigurations

**Files:**
- `apps/api/src/utils/turnstile.ts`

---

### 5. Google OAuth Audience Validation ✅
**Issue:** Google login didn't validate `aud` (audience) claim.

**Fix:**
- Added `aud` validation against `GOOGLE_CLIENT_ID` env var
- Added `iss` (issuer) validation
- Prevents token spoofing from other Google apps

**Files:**
- `apps/api/src/routes/auth.ts`
- `apps/api/.env.example` (added `GOOGLE_CLIENT_ID`)

---

### 6. Data Exposure - Public Reports ✅
**Issue:** Public endpoints returned non-verified reports despite comments saying "verified only".

**Fix:**
- Fixed `/api/perpetrators/:id/reports` to filter by `status = 'verified'`
- Fixed `/api/perpetrators/:id/timeline` to filter by `status = 'verified'`
- Fixed `/api/check` to only return perpetrators with verified reports

**Files:**
- `apps/api/src/routes/perpetrators.ts`
- `apps/api/src/routes/check.ts`

---

### 7. SSRF Protection - Evidence Download ✅
**Issue:** Admin proxy endpoint could fetch any URL, enabling SSRF attacks.

**Fix:**
- Added `safeFetchUrl()` function with:
  - HTTPS-only enforcement
  - Private IP blocking (10.x, 172.16-31.x, 192.168.x, 127.x, etc.)
  - IPv6 private range blocking
  - Blocked hostnames (localhost, metadata services, etc.)
- Returns 403 for blocked requests

**Files:**
- `apps/api/src/routes/moderation.ts`

---

## P1 - High Priority

### 8. Rate Limiter - Redis + IP Headers ✅
**Issue:** In-memory rate limiting + trusting all IP headers (spoofable).

**Fix:**
- Implemented Redis-based rate limiting with in-memory fallback
- Only trusts specific headers in priority order:
  1. `CF-Connecting-IP` (Cloudflare)
  2. `X-Real-IP` (nginx)
  3. First IP from `X-Forwarded-For`
- Prevents header spoofing attacks

**Files:**
- `apps/api/src/middleware/rate-limit.ts`

---

### 9. Database Indexes ✅
**Issue:** No indexes on search columns (account/phone/name).

**Fix:**
- Created migration `0007_add_search_indexes.sql` with indexes for:
  - Perpetrators: `account_number`, `phone_number`, `entity_name`
  - Reports: `status`, `perpetrator_id`, `reporter_id`, `created_at`
  - Users: `email`, `google_id`
  - Evidence files, comments, clarifications: join columns
  - Composite index for common query patterns

**Files:**
- `apps/api/src/db/migrations/0007_add_search_indexes.sql`
- `apps/api/src/db/migrations/meta/_journal.json`

---

### 10. Lint Quality ✅
**Issue:** High technical debt from lint issues.

**Fix:**
- Added ESLint config for API
- Fixed `any` type usage:
  - `turnstile.ts`: Typed Turnstile response
  - `check.ts`: Proper type casting for matchedChronology
  - `moderation.ts`: Used `$inferSelect` for schema types
- Added lint scripts to package.json

**Files:**
- `apps/api/.eslintrc.json`
- `apps/api/package.json`
- `apps/api/src/utils/turnstile.ts`
- `apps/api/src/routes/check.ts`
- `apps/api/src/routes/moderation.ts`

---

### 11. Dependency Updates ✅
**Issue:** Hono/@hono/node-server had security advisories.

**Fix:**
- Updated `hono` to `^4.8.0`
- Updated `@hono/node-server` to `^1.14.0`
- Added ESLint dependencies for linting

**Files:**
- `apps/api/package.json`

---

## Deployment Checklist

### Before Production Deploy:

1. **Environment Variables:**
   - [ ] Set strong `JWT_ACCESS_SECRET` (min 32 chars)
   - [ ] Set strong `JWT_REFRESH_SECRET` (min 32 chars)
   - [ ] Configure `R2_*` variables for file storage
   - [ ] Set `REDIS_URL` for production rate limiting
   - [ ] Configure `TURNSTILE_SECRET_KEY`
   - [ ] Set `GOOGLE_CLIENT_ID` for OAuth validation

2. **Database:**
   - [ ] Run `npm run db:migrate` to apply all migrations
   - [ ] Verify indexes are created (check with `\di` in psql)

3. **Security:**
   - [ ] Ensure `NODE_ENV=production` is set
   - [ ] Verify HTTPS is enforced at load balancer/reverse proxy
   - [ ] Test rate limiting with Redis
   - [ ] Test Google OAuth with your actual client ID

4. **Monitoring:**
   - [ ] Set up error logging for security events
   - [ ] Monitor Redis connection health
   - [ ] Watch for 429 (rate limit) responses

---

## Testing Recommendations

1. **Fresh Database Test:**
   ```bash
   # Create fresh DB and run migrations
   npm run db:migrate
   # Verify no errors about missing columns
   ```

2. **Security Tests:**
   - Test JWT auth without secrets (should fail in production)
   - Test Turnstile without secret (should reject in production)
   - Test Google OAuth with wrong audience (should reject)
   - Test SSRF endpoint with internal URLs (should block)
   - Test rate limiting with rapid requests

3. **Performance Tests:**
   - Test search with large dataset (verify indexes work)
   - Monitor Redis memory usage under load

---

## Status Summary

| Issue | Priority | Status |
|-------|----------|--------|
| Schema migration drift | P0 | ✅ Fixed |
| Environment template sync | P0 | ✅ Fixed |
| JWT secret hardcoded fallback | P0 | ✅ Fixed |
| Turnstile auto-bypass | P0 | ✅ Fixed |
| Google OAuth audience validation | P0 | ✅ Fixed |
| Data exposure in public endpoints | P0 | ✅ Fixed |
| SSRF in proxy download | P0 | ✅ Fixed |
| Rate limiter (in-memory + IP) | P1 | ✅ Fixed |
| Missing DB indexes | P1 | ✅ Fixed |
| Lint quality debt | P1 | ✅ Fixed |
| Dependency security advisory | P1 | ✅ Fixed |

**All P0 and P1 issues resolved.** ✅
