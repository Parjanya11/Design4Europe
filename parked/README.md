# Parked

Markup taken off the live page but kept for later. Nothing in `parked/` is
served or linked. The CSS, `fp10.js` renderers and data these sections use
are still in place, so each file is the only piece that is missing.

## fp10-visuals/ (parked 2026-11-17, from 08b8f7b)

- `01-where-fp10-stands.html`: timeline + trilogue diagram. Replaced by the "FP10 is being scoped now" divider.
- `02-structure-map.html`: "Where Design belongs in FP10" map inside The ask.
- `03-connector-diagram.html`: connector diagram in The stakes. Replaced by `assets/visual-design-ecosystem.svg`.
- `04-opportunities.html`: "Where design research fits" theme cards.

The draft-text quotes in The case were kept live.

## Putting a section back

1. Read the top comment of its file: it says where the markup sat and what replaced it.
2. Paste the markup below the comment back into `index.html` at that spot, removing the replacement if there is one.
3. Run `npm run check` in `tools/` and look at the screenshots; `fp10.js` renders the section on its own.
