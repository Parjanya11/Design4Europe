# Working on this repo

Read `README.md` first: architecture, local preview, and the runbook.

## Before every push

- `npm run check` and `npm run test:functions` in `tools/`, both green. Look at the screenshots in `tools/out/`. A passing check is not the same as a page that looks right.
- One commit per logical change, with a message that explains why.
- Work on a branch; `main` deploys to production. Show changes through the PR's deploy preview.

## Standing rules

- **No front-end dependencies, no build step, no new fonts.** Dependencies for checking and generating assets go in `tools/`, which is never deployed.
- **No em dashes in site copy.**
- **No euro figures anywhere** until the budget numbers are confirmed (`FP10.budget` stays `null`).
- **The sign-on form, its function, the signatory list logic and the letter PDF** change only when asked.
- **Diagram text never below 11px**, and no horizontal scroll at 360px. The check enforces both.
- Public names are inserted as text nodes, never `innerHTML`.
- Everything is served from our own domain; the CSP in `netlify.toml` enforces it.

## Who decides what

Parjanya is the designer and owns design decisions. Hilbrand and Jeroen are the client and own the campaign's content and copy. Engineering chores can go ahead. Design and copy changes are proposed, not made. For example, `COPY-PROPOSALS.md` is a proposal and nothing in it is live.

Waiting on the next design round:

- how institutional signatories are listed
- signature verification
- the contrast retone (19 issues in `tools/axe-baseline.json`)
- form focus rings
- section order
- signatory-section marquee spacing
