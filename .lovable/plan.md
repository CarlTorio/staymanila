## Goal
I-fix ang Vercel 404 issue sa pamamagitan ng paglipat mula Cloudflare Worker build → SPA (static) build na kaya basahin ng Vercel.

## Mga Babaguhin

### 1. `vite.config.ts`
I-disable ang Cloudflare plugin at i-enable ang SPA mode ng TanStack Start:
```ts
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
```

### 2. `vercel.json` (bagong file sa root)
Ituro kay Vercel ang tamang output folder at maglagay ng SPA fallback rewrite:
```json
{
  "outputDirectory": "dist/client",
  "rewrites": [
    { "source": "/(.*)", "destination": "/_shell.html" }
  ]
}
```

### 3. Build verification
Patakbuhin ang `bun run build` para kumpirmahing:
- Walang Cloudflare Worker bundle na nag-generate
- May `dist/client/_shell.html` na lumalabas

## Mga HINDI ko gagalawin
- `wrangler.jsonc` — iiwan, harmless naman kung hindi tumatakbo ang Cloudflare plugin (pwedeng tanggalin later kung gusto mo)
- `src/server.ts` at error-handling wrapper — iiwan; sa SPA mode hindi siya ginagamit pero hindi rin sumisira
- Lahat ng `createServerFn` / admin auth code — gumagana pa rin sa client (Supabase JS naman ang auth)
- Existing routes, components, at styling

## Trade-off na dapat malaman
- **Walang SSR na** → client-side rendering lang. SEO meta tags pa rin gumagana dahil sa static `_shell.html`, pero hindi pre-rendered ang dynamic content.
- OK ito sa case mo kasi Supabase JS client (browser-side) ang auth, hindi server functions.

## Next steps pagkatapos
1. I-push sa GitHub (auto-sync sa Lovable ↔ GitHub)
2. Mag-redeploy sa Vercel
3. I-test ang `/admin/login`, `/`, at refresh sa anumang route — dapat walang 404 na

Sabihan mo lang ako kung sige na para i-implement ko.