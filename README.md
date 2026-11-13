# Design for Europe

The campaign site at **[design4europe.eu](https://design4europe.eu)**: an open letter asking the European Commission to give Design a structural role in FP10, with a sign-on form and a public list of signatories.

## How it fits together

| Part | Where | What it does |
|---|---|---|
| Page | `index.html`, `styles.css`, `script.js` | Static, no build step, no front-end dependencies. |
| FP10 visuals | `fp10.js` | Timeline, trilogue, structure map, theme cards and quotes. **All their content is the `FP10` object at the top of the file**; editing it needs no code. |
| Sign-on | `netlify/functions/signon.js` | Stores each signature in Netlify Blobs, then emails the signatory and the campaign mailbox. Storing comes first, so a mail outage never loses a signature. |
| Public list | `netlify/functions/signatories.js` | Names of people who chose to be listed. Never returns an email address. Served from a cached index (`netlify/lib/signature-index.js`). |
| Export | `netlify/functions/export.js` | The full list, including emails. Token-protected. |
| Delete | `netlify/functions/admin-delete.js` | Removes named records. Token-protected, dry run by default. |
| Tools | `tools/` | Local preview, checks, logo and share-image scripts. **Never deployed.** |

Hosting is Netlify, deploying `main` to production. Every pull request gets a preview link.

## Working on it

The repo lives at `C:\dev\design4europe`, **not** in OneDrive. Syncing a `.git` folder corrupts it.

```
cd tools
npm install                 # once
npm run serve               # site on http://localhost:8000, with fake signatories
npm run check               # screenshots + layout, accessibility, CSP checks
npm run test:functions      # the sign-on, list and export functions, offline
```

The local preview answers the functions with **fake data** from `tools/fixtures/`. It never touches the live signature store.

`npm run check` fails on horizontal scroll at any of 360/768/1280/1600px, text under 11px, failed requests, console errors, any third-party request, or a new accessibility issue. Screenshots go to `tools/out/`. Known issues waiting on a design decision are listed in `tools/axe-baseline.json`. After fixing some, run `npm run check:update-baseline` to drop them.

GitHub runs both checks on every pull request.

### Previews are safe to click

On a deploy preview, the form writes to a separate `signatures-preview` store and sends **no email**. Anyone can test it. The preview's signatory list shows only preview signatures. Export and delete do not work on previews, because `EXPORT_TOKEN` is set for production only.

## Runbook

### Export the signatory list

```
https://design4europe.eu/.netlify/functions/export?token=YOUR_EXPORT_TOKEN
```

Downloads a CSV. Add `&format=json` to read it in the browser; the `count` at the top is the total. The file contains email addresses: keep it off shared drives, and never paste the full link (it contains the token) into chat or email.

### Delete signatures (test data, or a GDPR erasure request)

1. Find the record's `key` in the JSON export.
2. Dry run, which shows whose records these are and deletes nothing:
   ```
   curl -X POST "https://design4europe.eu/.netlify/functions/admin-delete?token=YOUR_EXPORT_TOKEN" \
        -H "content-type: application/json" -d '{"keys":["KEY1","KEY2"]}'
   ```
3. If they're right, repeat with `"confirm": true` in the body.

The public list catches up within about five minutes.

### Rotate the export token

`EXPORT_TOKEN` is a Netlify secret: once saved, **it cannot be read back**. Store it in a password manager first.

1. Generate one: `-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | % {[char]$_})` in PowerShell.
2. Netlify, then Site configuration, then Environment variables, then `EXPORT_TOKEN`. Choose **Options**, then **Edit**, and replace the **Production** value.
3. **Redeploy** (Deploys, then Trigger deploy). Functions only see new values after a deploy.

### Add a signatory logo

1. Put the original file in `assets/source/logos/` with a readable name, for example `danish-design-center.png`.
2. Run `node logos.mjs` in `tools/`. It writes a resized WebP to `assets/logos/`.
3. Add a chip to the **banner** in `index.html` (there is only one list; the signatories section copies it):
   ```html
   <div class="logo-chip"><img src="assets/logos/NAME.webp" alt="Organisation name" /></div>
   ```
   Use `class="logo-chip wide"` for long wordmarks.

### Update FP10 content

Edit the `FP10` object at the top of `fp10.js`: dates, window names, quotes, themes. Timeline status (past / now / next) is worked out from today's date. Euro figures are deliberately `null` until the budget numbers are confirmed.

### Update the share image

Edit `tools/social/card.html`, then run `npm run social` in `tools/`. That writes `assets/social-preview.png`. LinkedIn caches previews, so use its Post Inspector to refresh one.

## Environment variables (Netlify, production)

| Name | Used for |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Sending confirmation and notification emails |
| `NOTIFY_TO` | The campaign mailbox that receives notifications and replies |
| `EXPORT_TOKEN` | Export and delete |

No secrets live in this repo.

## Security and privacy

- A Content Security Policy in `netlify.toml` allows only this domain. Fonts are self-hosted, so no visitor data goes to a third party. The local preview applies the same headers, so `npm run check` catches anything the policy would block.
- Names typed by the public are inserted as text, never as HTML. Email content is escaped.
- People who chose to stay private are counted in the totals but never named.

## Branches

`main` is production. Work happens on short-lived branches, reviewed through the preview, then merged. Old branches were archived as tags (`archive/pdf`, `archive/table`) before deletion.
