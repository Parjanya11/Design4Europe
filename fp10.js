// =====================================================================
//  FP10 DATA  —  edit this object, the page updates itself.
//
//  Everything the FP10 sections display lives in FP10 below. Nothing in
//  this file needs programming knowledge to change: the text between
//  quotes is what appears on the page.
//
//  Rendering code starts further down, under "RENDERING".
// =====================================================================

const FP10 = {
  // Shown under the timeline as "Last updated: ...".
  lastUpdated: '2026-11-10',

  // TODO: confirm with Jeroen. Deck says €154B but the pillar sum is €175B
  // (44.1 + 75.8 + 38.8 + 16.3). Deliberately NOT rendered anywhere until
  // the figures are reconciled.
  budget: {
    headline: null,
    pillars: null,
  },

  // --- Legislative timeline -------------------------------------------
  // "date" is the sort/compare key. "ends" is optional, for steps that
  // span days. Status (past / now / future) is computed from today.
  timeline: [
    { date: '2025-07-01', label: 'Jul 2025', step: 'Commission publishes FP10 proposal', actor: 'European Commission' },
    { date: '2026-06-01', label: 'Jun 2026', step: 'Council agrees its FP10 position', actor: 'Council of the EU' },
    { date: '2026-11-10', label: '10 Nov 2026', step: 'ITRE committee votes on compromise amendment', actor: 'European Parliament' },
    { date: '2026-11-23', label: '23 Nov 2026', step: 'Parliament plenary vote', actor: 'European Parliament' },
    { date: '2026-11-26', ends: '2026-11-27', label: '26–27 Nov 2026', step: 'EU heads of government meet', actor: 'European Council' },
    { date: '2026-12-01', ends: '2027-01-31', label: 'Expected Dec 2026 – Jan 2027', step: 'Trilogue negotiations', actor: 'Commission + Parliament + Council' },
    // TODO: confirm trilogue timing with Jeroen. The deck says only
    // "(dec-jan)", which is an expectation - trilogue dates are agreed
    // between the institutions after the plenary vote, not fixed now.
  ],

  timelineCta: {
    text: 'Trilogue is expected in December. Sign before the text is locked.',
    linkText: 'Add your signature',
    href: '#sign',
  },

  // --- Trilogue: who settles the final text -----------------------------
  // Each institution arrives with a position already agreed. Officials'
  // names and photos from the deck are deliberately omitted.
  trilogue: {
    heading: 'Three institutions settle the final text',
    centre: { name: 'Trilogue', timing: 'Expected Dec 2026 – Jan 2027' },
    actors: [
      { name: 'European Commission', brings: 'Its original FP10 proposal', when: 'July 2025' },
      { name: 'European Parliament', brings: 'Its compromise amendment, which names Design', when: 'Plenary vote 23 Nov 2026' },
      { name: 'Council of the EU', brings: 'Its agreed FP10 position', when: 'June 2026' },
    ],
  },

  // --- The four pillars ------------------------------------------------
  // "design" marks where Design appears:
  //   'vertical'   = Design as a sector in its own right
  //   'horizontal' = Design as a connector across other sectors
  pillars: [
    {
      id: 'I',
      name: 'Excellent Science',
      items: [
        { name: 'European Research Council (ERC)', design: 'grants' },
        { name: 'Marie Skłodowska-Curie Actions (MSCA)', design: 'grants' },
        { name: 'Joint Research Centre / Science for Policy' },
        { name: 'EU Policy Lab', design: 'initiative', sub: true },
        { name: 'European support for Researchers at Risk' },
        { name: 'Fast Track to Excellence' },
      ],
    },
    {
      id: 'II',
      name: 'Competitiveness and Society',
      expanded: true,
      groups: [
        {
          name: 'Competitiveness Windows',
          windows: [
            { name: "I 'Clean Energy and Industrial Decarbonisation'", design: 'horizontal' },
            { name: "II 'Biotechnology, Agro, Health, and Sustainable Transition'", design: 'vertical', note: 'Cultural and Creative Industries' },
            { name: "III 'Digital Leadership'", design: 'horizontal' },
            { name: "IV 'Critical Raw Materials, Security and Space'", design: 'horizontal' },
          ],
        },
        {
          name: 'Society Windows',
          windows: [
            { name: "I 'Just Green Transition'", design: 'horizontal' },
            { name: "II 'Sustainable, Inclusive and Healthy Societies'", design: 'vertical', note: 'Culture, Cultural Heritage, including the Cultural Heritage Cloud and Creative Sectors' },
            { name: "III 'Inclusive Digital Societies'", design: 'horizontal' },
            { name: "IV 'Resilient Societies'", design: 'horizontal' },
          ],
        },
        {
          name: 'Horizontal Window',
          windows: [
            { name: 'Missions', design: 'horizontal', note: 'Adaptation to Climate Change; Cancer; Restore our Ocean and Waters; 100 Climate-neutral and Smart Cities; A Soil Deal for Europe' },
            { name: 'New European Bauhaus (NEB) Facility', design: 'vertical' },
            { name: 'Pilot: Sectoral Plan for the SSH-A sector', design: 'vertical', note: 'Social Sciences, Humanities and Arts' },
          ],
        },
      ],
      extra: [{ name: 'Fast Track to Innovation' }],
    },
    {
      id: 'III',
      name: 'Innovation',
      items: [
        { name: 'European Innovation Council (EIC)' },
        { name: 'EU Innovation Ecosystems' },
        // TODO: confirm with Jeroen. The deck writes this with a question
        // mark, i.e. expected rather than settled.
        { name: 'EIT Culture & Creativity', design: 'initiative', sub: true, note: 'Expected, not yet named in the draft text' },
      ],
    },
    {
      id: 'IV',
      name: 'European Research Area',
      items: [
        { name: 'Widening participation and ERA integration' },
        { name: 'Research and technology infrastructures' },
        { name: 'Reforming and enhancing the European R&I system' },
      ],
    },
  ],

  // Linked to FP10 but a separate fund. Never draw as a fifth pillar.
  ecf: {
    name: 'European Competitiveness Fund (ECF)',
    note: 'A separate fund, mirroring the four Competitiveness Windows.',
  },

  // Four ways design appears in the structure. Order matters: it is the
  // order of the legend and of the colour strength on the map.
  designLegend: [
    { key: 'vertical', label: 'Design as a sector in its own right' },
    { key: 'horizontal', label: 'Design as a connector across other sectors' },
    { key: 'initiative', label: 'Design-related initiatives already running' },
    { key: 'grants', label: 'Personal grants open to design research' },
  ],

  designNote:
    'Every box above is a route into FP10. The four Competitiveness Windows are mirrored by a separate fund, the European Competitiveness Fund.',

  // --- Design as transdisciplinary connector ---------------------------
  connections: [
    { n: 1, from: 'I', to: 'III', text: 'Between Pillars I, II and III: from science to innovation' },
    { n: 2, from: 'II', to: 'II', text: 'Between the Competitiveness and Society Windows within Pillar II' },
    { n: 3, from: 'II', to: 'II', text: 'Between Social Sciences, Humanities and the Arts in the pilot SSH-A Sector Plan' },
    { n: 4, from: 'II', to: 'ECF', text: 'Between Pillar II and the ECF: from innovation to business' },
  ],

  // --- Example research themes, per window pair ------------------------
  themePairs: [
    {
      competitiveness: 'Clean Energy & Industrial Decarbonisation',
      society: 'Just Green Transition',
      themes: ['Circular Design', 'Transition Design'],
    },
    {
      competitiveness: 'Biotech, Agro, Health & Sustainable Transition',
      society: 'Sustainable, Inclusive & Healthy Societies',
      themes: ['Smart & Inclusive Mobility', 'Healthy Lifestyles'],
    },
    {
      competitiveness: 'Digital Leadership',
      society: 'Inclusive Digital Societies',
      themes: ['eHealth', 'Inclusive Responsible AI'],
    },
    {
      competitiveness: 'Critical Raw Materials, Security & Space',
      society: 'Resilient Societies',
      themes: ['Smart Materials', 'Community Design'],
    },
  ],

  // --- Verbatim quotes from the draft text -----------------------------
  // TODO: confirm exact source article/recital with Jeroen
  quotes: {
    lead: "Parliament's draft text already names Design.",
    attribution: 'European Parliament compromise amendment on FP10 (draft)',
    items: [
      'Creative and design methods may also be developed and tested as inputs to industrial innovation, where they contribute to product differentiation.',
      '…include design from the early stages of the innovation journey, while promoting cultural diversity and socio-cultural value.',
      'Tools, technologies and methods on which European cultural and creative sectors, organisations, creators and businesses can build. This includes artistic research methodologies.',
    ],
  },
};

// =====================================================================
//  RENDERING  —  below here is code. Editing the data above is enough
//  for normal updates.
// =====================================================================

(() => {
  'use strict';

  // Text nodes only, never innerHTML: all of this is policy text that
  // should never be parsed as markup.
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // --- 1. Timeline -----------------------------------------------------
  // "now" is the first step whose end date has not fully passed.
  function renderTimeline() {
    const host = document.getElementById('fp10Timeline');
    if (!host) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const steps = FP10.timeline.map((s) => {
      const end = new Date(s.ends || s.date);
      end.setHours(23, 59, 59, 999);
      return { ...s, passed: end < today };
    });
    const nowIndex = steps.findIndex((s) => !s.passed);

    const list = el('ol', 'tl-track');
    steps.forEach((s, i) => {
      const state = i === nowIndex ? 'now' : s.passed ? 'past' : 'future';
      const li = el('li', `tl-step tl-${state}`);

      li.appendChild(el('span', 'tl-dot'));
      if (state === 'now') {
        const flag = el('span', 'tl-here', 'We are here');
        li.appendChild(flag);
      }
      li.appendChild(el('span', 'tl-date', s.label));
      li.appendChild(el('span', 'tl-step-name', s.step));
      li.appendChild(el('span', 'tl-actor', s.actor));
      if (state === 'past') li.appendChild(el('span', 'u-sr', '(completed)'));
      list.appendChild(li);
    });

    host.textContent = '';
    host.appendChild(list);


    const cta = document.getElementById('fp10TimelineCta');
    if (cta) {
      cta.textContent = '';
      cta.append(FP10.timelineCta.text + ' ');
      const a = el('a', 'tl-cta-link', FP10.timelineCta.linkText + ' →');
      a.href = FP10.timelineCta.href;
      cta.appendChild(a);
    }
  }

  // --- 1b. Trilogue diagram --------------------------------------------
  // Three actors converging on one node. The connectors are children of
  // the centre node and extend outwards into the grid gaps, so they stay
  // attached to it at any width - a fixed-coordinate SVG stretched over
  // the grid does not. Decorative, so hidden from assistive tech: the
  // relationship is already carried by the text and reading order.
  function renderTrilogue() {
    const host = document.getElementById('fp10Trilogue');
    if (!host) return;
    const t = FP10.trilogue;

    host.textContent = '';
    host.appendChild(el('h3', 'tg-heading', t.heading));

    const stage = el('div', 'tg-stage');

    t.actors.forEach((a, i) => {
      const card = el('div', 'tg-actor tg-actor-' + (i + 1));
      card.appendChild(el('span', 'tg-actor-name', a.name));
      card.appendChild(el('span', 'tg-actor-brings', a.brings));
      card.appendChild(el('span', 'tg-actor-when', a.when));
      stage.appendChild(card);
    });

    const centre = el('div', 'tg-centre');
    ['top', 'left', 'right'].forEach((dir) => {
      const link = el('span', 'tg-link tg-link-' + dir);
      link.setAttribute('aria-hidden', 'true');
      centre.appendChild(link);
    });
    centre.appendChild(el('span', 'tg-centre-name', t.centre.name));
    centre.appendChild(el('span', 'tg-centre-when', t.centre.timing));
    stage.appendChild(centre);

    host.appendChild(stage);
  }

  // --- 2. Connector diagram -------------------------------------------
  function renderConnectors() {
    const host = document.getElementById('fp10Connectors');
    if (!host) return;

    const map = el('div', 'cx-map');
    FP10.pillars.forEach((p) => {
      const box = el('div', 'cx-pillar');
      box.appendChild(el('span', 'cx-pillar-id', 'Pillar ' + p.id));
      box.appendChild(el('span', 'cx-pillar-name', p.name));
      map.appendChild(box);
    });

    const fp10Box = el('div', 'cx-fp10');
    fp10Box.appendChild(el('span', 'cx-boundary-label', 'FP10'));
    fp10Box.appendChild(map);

    const ecf = el('div', 'cx-ecf');
    ecf.appendChild(el('span', 'cx-ecf-name', FP10.ecf.name));
    ecf.appendChild(el('span', 'cx-ecf-note', FP10.ecf.note));

    const wrap = el('div', 'cx-wrap');
    wrap.appendChild(fp10Box);
    wrap.appendChild(ecf);

    const caption = el('ol', 'cx-list');
    FP10.connections.forEach((c) => {
      const li = el('li');
      li.appendChild(el('span', 'cx-num', String(c.n)));
      li.appendChild(el('span', 'cx-text', c.text));
      caption.appendChild(li);
    });

    host.textContent = '';
    host.appendChild(wrap);
    host.appendChild(el('p', 'cx-caption-head', 'Design connects, in four ways:'));
    host.appendChild(caption);
  }

  // --- 3. Structure map ------------------------------------------------
  // All four pillars sit in one row, as in the source deck. Each pillar is
  // a <details> so that on narrow screens it collapses to its heading - an
  // accordion that is keyboard-operable with no JS. On wide screens every
  // pillar is open, because the whole point of the map is seeing the four
  // side by side.
  function renderStructure() {
    const host = document.getElementById('fp10Structure');
    if (!host) return;

    const legend = el('ul', 'sm-legend');
    FP10.designLegend.forEach((l) => {
      const li = el('li', 'sm-legend-item');
      li.appendChild(el('span', `sm-swatch sm-${l.key}`));
      li.appendChild(el('span', null, l.label));
      legend.appendChild(li);
    });

    const legendLabel = {};
    FP10.designLegend.forEach((l) => { legendLabel[l.key] = l.label; });

    // One box per entry, so the colour coding reads the same whether the
    // entry is a window inside Pillar II or a line in another pillar.
    // The colour is the only visible carrier of the category, so each
    // coded box also states its category in text for screen readers.
    const box = (entry) => {
      const li = el('li', 'sm-window'
        + (entry.design ? ' sm-' + entry.design : '')
        + (entry.sub ? ' sm-sub' : ''));
      li.appendChild(el('span', 'sm-window-name', entry.name));
      if (entry.design && legendLabel[entry.design]) {
        li.appendChild(el('span', 'u-sr', '(' + legendLabel[entry.design] + ')'));
      }
      if (entry.note) li.appendChild(el('span', 'sm-window-note', entry.note));
      return li;
    };

    const boxList = (entries) => {
      const ul = el('ul', 'sm-windows');
      entries.forEach((e) => ul.appendChild(box(e)));
      return ul;
    };

    const grid = el('div', 'sm-grid');
    const panels = [];

    FP10.pillars.forEach((p) => {
      const d = el('details', 'sm-pillar');

      const sum = el('summary', 'sm-summary');
      sum.appendChild(el('span', 'sm-pillar-id', 'Pillar ' + p.id));
      sum.appendChild(el('span', 'sm-pillar-name', p.name));
      d.appendChild(sum);

      const body = el('div', 'sm-body');
      if (p.items) body.appendChild(boxList(p.items));
      if (p.groups) {
        p.groups.forEach((g) => {
          body.appendChild(el('div', 'sm-group-name', g.name));
          body.appendChild(boxList(g.windows));
        });
      }
      if (p.extra) body.appendChild(boxList(p.extra));

      d.appendChild(body);
      grid.appendChild(d);
      panels.push({ node: d, expanded: !!p.expanded });
    });

    host.textContent = '';
    host.appendChild(legend);
    host.appendChild(grid);
    host.appendChild(el('p', 'sm-note', FP10.designNote));

    // Open everything on wide screens, collapse to the key pillar on narrow
    // ones. Re-run only when the breakpoint is actually crossed, so a reader
    // who has opened a pillar by hand keeps it open while they scroll.
    const wide = window.matchMedia('(min-width: 761px)');
    const sync = () => panels.forEach((x) => { x.node.open = wide.matches || x.expanded; });
    sync();
    wide.addEventListener('change', sync);
  }

  // --- 4. Theme cards --------------------------------------------------
  function renderThemes() {
    const host = document.getElementById('fp10Themes');
    if (!host) return;

    const grid = el('div', 'tc-grid');
    FP10.themePairs.forEach((p) => {
      const card = el('article', 'tc-card');

      const pair = el('div', 'tc-pair');
      const c = el('div', 'tc-window');
      c.appendChild(el('span', 'tc-window-kind', 'Competitiveness'));
      c.appendChild(el('span', 'tc-window-name', p.competitiveness));
      const s = el('div', 'tc-window');
      s.appendChild(el('span', 'tc-window-kind', 'Society'));
      s.appendChild(el('span', 'tc-window-name', p.society));
      pair.appendChild(c);
      pair.appendChild(s);
      card.appendChild(pair);

      const chips = el('div', 'tc-chips');
      p.themes.forEach((t) => chips.appendChild(el('span', 'tc-chip', t)));
      card.appendChild(chips);

      const foot = el('a', 'tc-link', 'Your field is here. Add your signature →');
      foot.href = '#sign';
      card.appendChild(foot);

      grid.appendChild(card);
    });

    host.textContent = '';
    host.appendChild(grid);
  }

  // --- 5. Quotes -------------------------------------------------------
  function renderQuotes() {
    const host = document.getElementById('fp10Quotes');
    if (!host) return;

    host.textContent = '';
    host.appendChild(el('p', 'q-lead', FP10.quotes.lead));

    const list = el('div', 'q-list');
    FP10.quotes.items.forEach((t) => {
      const fig = el('figure', 'q-item');
      fig.appendChild(el('blockquote', 'q-text', '“' + t + '”'));
      list.appendChild(fig);
    });
    host.appendChild(list);
    host.appendChild(el('p', 'q-attrib', FP10.quotes.attribution));
  }

  const start = () => {
    renderTimeline();
    renderTrilogue();
    renderConnectors();
    renderStructure();
    renderThemes();
    renderQuotes();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
