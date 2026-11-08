# Frontend notes

This app is pinned to **Next.js 15.5.29** so it can be built with
`@cloudflare/next-on-pages` for the existing Cloudflare Pages project.

Next.js 16 is not compatible with `@cloudflare/next-on-pages`; a future upgrade
would require migrating the deployment to `@opennextjs/cloudflare` on
Cloudflare Workers.

Before changing framework-level behavior, check the docs for the installed
Next.js version under `node_modules/next/dist/docs/`.
