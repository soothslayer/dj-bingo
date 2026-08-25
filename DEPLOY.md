# Deploying DJ Bingo

The site is static — HTML, JS, and a song list, no server and no build step. It's
hosted on **Cloudflare Pages** at **djbingo.hanlonmiller.com**, with access limited
to an email allowlist via **Cloudflare Access**.

Cost: $0. Both the Pages free tier and the Zero Trust free tier (up to 50 users)
cover this comfortably.

---

## Why Cloudflare

`hanlonmiller.com` already uses Cloudflare nameservers (`ian.ns.cloudflare.com`,
`amalia.ns.cloudflare.com`), so the subdomain is a single automatic DNS record and
there's no nameserver migration.

The alternatives cost money for the one feature we need: Netlify and Vercel both
put site-wide password protection behind their paid tiers (~$19–20/month). GitHub
Pages is free but offers no access control at all on a public repo.

---

## One-time setup

### 1. Create an API token

Deploys run from the command line, so wrangler needs a token rather than an
interactive browser login.

Go to **dash.cloudflare.com → My Profile → API Tokens → Create Token → Create Custom
Token**, and grant exactly one permission:

- Permissions: `Account` → `Cloudflare Pages` → `Edit`
- Account resources: `Include` → your account

Nothing else is needed. (The "Edit Cloudflare Workers" template also works, but it
grants far more than deploying a static site requires.)

Then put it in your shell (`~/.zshrc`), along with your account ID, which is on the
right-hand sidebar of any domain's overview page:

```bash
export CLOUDFLARE_API_TOKEN="…"
export CLOUDFLARE_ACCOUNT_ID="…"
```

> Keep the token out of the repo. It grants deploy rights to your whole account.

### 2. First deploy

From the repo root:

```bash
./deploy.sh
```

This creates the `dj-bingo` project and prints a `*.pages.dev` URL. Confirm the site
loads there before wiring up the custom domain.

### 3. Point the subdomain at it

In **dash.cloudflare.com → Workers & Pages → dj-bingo → Custom domains → Set up a
custom domain**, enter `djbingo.hanlonmiller.com`.

Because the domain is already on Cloudflare, the CNAME is created automatically and
the certificate issues within a few minutes.

### 4. Lock it to your testers

This is the part that limits access, and it has to be done in the dashboard.

Go to **Zero Trust → Access → Applications → Add an application → Self-hosted**.

- **Application name:** DJ Bingo
- **Session duration:** 1 week — long enough that testers don't re-auth constantly
- **Public hostname:** `djbingo.hanlonmiller.com`

Then add a policy:

- **Policy name:** Testers
- **Action:** Allow
- **Include:** `Emails` → paste your testers' addresses
  (or `Emails ending in` → `@yourcompany.com` if they share a domain)

Leave **One-time PIN** enabled under login methods. A tester visits the URL, types
their email, receives a 6-digit code, and is in. Nothing to install, no shared
password to leak, and you can revoke one person by deleting their address.

> On first use, Zero Trust asks you to pick a plan. Choose **Free** (50 users). It
> may ask for a payment method to complete signup even though the charge is $0.

### 5. Close the preview-deployment back door

**Don't skip this.** Every Pages deploy also publishes an unguessable-but-public URL
like `abc123.dj-bingo.pages.dev`. The Access policy above only covers
`djbingo.hanlonmiller.com`, so those preview URLs would stay wide open.

In **Workers & Pages → dj-bingo → Settings → General → Access policy**, enable
protection for preview deployments and point it at the same tester policy.

For belt and braces, add a second Access application covering `dj-bingo.pages.dev`
and `*.dj-bingo.pages.dev` with the same Testers policy.

---

## Deploying again

After the one-time setup, shipping a change is one command:

```bash
./deploy.sh
```

Each deploy is versioned, and you can roll back to any previous one from the Pages
dashboard.

If you'd rather have pushes deploy themselves, connect the GitHub repo under
**Settings → Builds & deployments**. That path needs a one-time GitHub OAuth grant
in the dashboard, which is why the default here is direct upload. Note that Git
integration deploys the repo root, so you'd get the scaffolding files discussed
below unless you also set a build command that stages them out.

---

## What gets published

`deploy.sh` copies exactly six files into a temporary `.deploy/` directory and
uploads only those:

```
index.html  cards.html  dj.html  show.html  data/songs.js  js/bingo.js
```

This matters more than it looks. `wrangler pages deploy` uploads **everything** in
the directory you point it at, skipping only a hardcoded list (`.git`,
`node_modules`, `.DS_Store`, `.wrangler`). It does **not** read `.gitignore`, and it
does **not** read `.assetsignore` — that file is a Workers static-assets feature and
is silently ignored on the Pages upload path. Deploying the repo root directly would
therefore publish `README.md`, this file, `wrangler.toml`, `test/`, and `.claude/`.

None of those contain secrets, so this is tidiness rather than a security hole — but
it's the reason for the staging step rather than a bare `wrangler pages deploy`.

**No music is ever uploaded.** `audio/` isn't in the staged list at all, `.gitignore`
already excludes `audio/*`, snippets stream from Apple's public 30-second preview
URLs, and any local files a DJ loads are read in the browser and never leave their
machine. The deployment stays clear of copyrighted audio.

> Keep your API token in the environment, never in `wrangler.toml` — that file is
> committed to the repo.

---

## Testing checklist

Worth walking once yourself before sending the link out:

1. Open `djbingo.hanlonmiller.com` in a private window — you should hit the Access
   login, not the site.
2. Complete the email code flow and land on the DJ Bingo home page.
3. Open the card generator, produce cards for a few guests, print to PDF.
4. Open the DJ console and play a song — confirms iTunes previews work over HTTPS.
5. Paste a preview `*.pages.dev` URL into a private window and confirm it *also*
   prompts for login. If it doesn't, step 5 of setup didn't take.
