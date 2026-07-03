# Migration: Lovable Cloud → your own Supabase

New project: **https://zevnxsyivjfhyrffzfqz.supabase.co** (ref `zevnxsyivjfhyrffzfqz`)

Ang code changes ay TAPOS NA. Ito na lang ang manu-manong hakbang mo sa Supabase dashboard.

---

## ✅ Step 1 — Config files (DONE na, ako gumawa)
- `.env` → bagong URL + anon key
- `supabase/config.toml` → bagong project_id
- Admin login → totoong Supabase Auth na (email + password), hindi na `"ADMIN"` password
- RLS → **public read, authenticated-only write** (secure na)

## ▶️ Step 2 — I-apply ang schema (i-paste sa SQL Editor)
1. Buksan: https://supabase.com/dashboard/project/zevnxsyivjfhyrffzfqz/sql/new
2. Buksan ang file `supabase/SETUP_NEW_PROJECT.sql`, kopyahin LAHAT.
3. I-paste sa SQL Editor → pindutin **Run**.
4. Dapat "Success". Ginawa nito: lahat ng tables, secure RLS, storage bucket, at ang default menu/gallery/settings.

## ▶️ Step 3 — Gumawa ng admin login user
1. Punta sa: https://supabase.com/dashboard/project/zevnxsyivjfhyrffzfqz/auth/users
2. **Add user → Create new user**.
3. Ilagay ang email + password na gusto mong gamitin sa `/admin/login`.
4. I-check ang **"Auto Confirm User"** (para hindi na kailangan ng email verification).
5. Ito na ang gagamitin mo sa staff login.

> Optional pero recommended: sa **Authentication → Providers → Email**, i-OFF ang
> "Enable sign-ups" para walang ibang makakagawa ng account. Ikaw lang (admin)
> ang manu-manong nagdadagdag ng user.

## ▶️ Step 4 — Test locally
```
bun install
bun run dev
```
- Buksan ang `/` → dapat may menu na (galing sa seed).
- Buksan ang `/admin/login` → mag-login gamit ang email+password sa Step 3.
- Subukang mag-edit ng dish → dapat mag-save (dahil authenticated ka na).
- I-logout, tapos subukang i-edit habang naka-logout → dapat MABIGO (RLS working).

## ▶️ Step 5 — I-update ang Vercel env vars
Sa Vercel project settings → Environment Variables, palitan ng bago:
- `VITE_SUPABASE_URL` = `https://zevnxsyivjfhyrffzfqz.supabase.co`
- `VITE_SUPABASE_PROJECT_ID` = `zevnxsyivjfhyrffzfqz`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = (bagong anon key, nasa `.env`)
- `SUPABASE_URL` at `SUPABASE_PUBLISHABLE_KEY` = same values

Tapos **Redeploy**. Tapos na!

---

## Mga tandaan
- **Walang data na inilipat** — fresh seed lang (pinili mo ito). Kung may lumang
  data ka pala sa Lovable na gusto mong ibalik, sabihin mo lang.
- **Storage images**: kung may na-upload ka nang larawan sa lumang bucket, hindi
  sila lumipat. Ang seed ay Unsplash URLs lang (external, gagana pa rin). Mga
  bagong upload → papunta na sa bagong bucket.
- **Old Lovable/Supabase project** (`gyzehlakqntuisyzasds`) — pwede mo nang
  i-pause o burahin kapag kumpirmado mong OK na ang bago. Wag munang burahin
  hangga't hindi na-test ang Step 4.
- `.env` ay **hindi** naka-gitignore, pero anon/publishable key lang ang laman
  (public by design, safe) kaya OK lang. **Wag na wag maglagay ng
  `service_role` key sa `.env`** — kung kailanganin man iyon, `.env.local` (na
  naka-ignore) ang lagayan.
