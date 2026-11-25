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
  // Shown on the In detail page as "Updated ...".
  lastUpdated: '2026-11-23',

  // The building on page 1: roof and base labels.
  programme: { name: 'FP10', years: '2028\u20132034', status: 'Being negotiated now' },

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
    // Root-relative, so the link works from both pages.
    href: '/#sign',
  },

  // --- Trilogue: who settles the final text -----------------------------
  // Each institution arrives with a position already agreed. Officials'
  // names and photos from the deck are deliberately omitted.
  trilogue: {
    heading: 'Three institutions settle the final text',
    centre: { name: 'Trilogue', timing: 'Expected Dec 2026 – Jan 2027' },
    actors: [
      { name: 'European Commission', brings: 'Its original FP10 proposal', when: 'July 2025' },
      // Not "which names Design": the brief (section 5) says neither text
      // names Design as a discipline, and that gap is the campaign's point.
      { name: 'European Parliament', brings: 'Its compromise text', when: 'Plenary vote 23 Nov 2026' },
      { name: 'Council of the EU', brings: 'Its agreed FP10 position', when: 'June 2026' },
    ],
  },

  // --- The four pillars ------------------------------------------------
  // "design" marks where Design appears, using the keys of designLegend
  // below. Pillar II's windows carry the same keys as their "state".
  pillars: [
    {
      id: 'I',
      name: 'Excellent Science',
      summary: 'European Research Council, Marie Skłodowska-Curie Actions, Joint Research Centre',
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
      summary: 'Four Competitiveness windows, four Society windows, a Horizontal window and Fast Track to Innovation',
      expanded: true,
      // Its windows are FP10.pillarTwo.cells, below: one list for the
      // structure map, the building on page 1 and the map in section C.
      windowsFrom: 'pillarTwo',
      extra: [{ name: 'Fast Track to Innovation' }],
    },
    {
      id: 'III',
      name: 'Innovation',
      summary: 'European Innovation Council, EU innovation ecosystems',
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
      summary: 'Widening participation, research and technology infrastructures, reform of the R&I system',
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

  // Jeroen's legend, "Opportunities for design research": four ways
  // design appears in the structure. Order matters: it is the order of
  // the legend and of the colour strength on the map. Pillar II's windows
  // use the first two; 'unmarked' is the one window with neither.
  designLegendTitle: 'Opportunities for design research',
  designLegend: [
    { key: 'vertical', label: 'Design as a sector in its own right' },
    { key: 'horizontal', label: 'Design as a connector across other sectors' },
    { key: 'initiative', label: 'Design-related initiatives already running' },
    { key: 'grants', label: 'Personal grants open to design research' },
  ],
  unmarked: { key: 'unmarked', label: 'Not marked' },

  designNote:
    'Every box above is a route into FP10. The four Competitiveness Windows are mirrored by a separate fund, the European Competitiveness Fund.',

  // --- Design as transdisciplinary connector ---------------------------
  connections: [
    { n: 1, from: 'I', to: 'III', text: 'Between Pillars I, II and III: from science to innovation' },
    { n: 2, from: 'II', to: 'II', text: 'Between the Competitiveness and Society Windows within Pillar II' },
    { n: 3, from: 'II', to: 'II', text: 'Between Social Sciences, Humanities and the Arts in the pilot SSHA Sectoral Plan' },
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
      competitiveness: 'Biotechnology, Agriculture, Health & Sustainable Transition',
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

  // --- Pillar II, window by window --------------------------------------
  // One entry per window. Both the building on page 1 and the map in
  // section C of the In detail page are drawn from this list, so the two
  // pictures can never disagree.
  //
  //   pillarGroup  'competitiveness' | 'society' | 'horizontal'
  //   row          'I'..'IV' for the paired windows; null for horizontal
  //   name         window name as in the Specific Programme (SP)
  //   short        the name as it fits in a map cell
  //   state        'vertical' | 'horizontal' | 'unmarked' (Jeroen's legend)
  //   detail       a line under the name in the structure map (section A)
  //   note         what the panel says when there is no quote
  //   hint         a few words shown in the cell, taken from its quotes
  //   topic        the SP topic the quotes sit under, where there is one
  //   quotes       exact text and reference (brief, section 6)
  //
  // States follow Jeroen's latest deck (25 Nov): red 'vertical' where design
  // is a sector in itself, blue 'horizontal' where it crosses over into
  // another sector, and the Metrology Partnership alone unmarked. The
  // quotes are the text evidence; a window can be 'horizontal' with no
  // design wording in the text yet.
  pillarTwo: {
    cells: [
      { id: 'comp-1', pillarGroup: 'competitiveness', row: 'I', state: 'horizontal',
        name: 'Clean Energy and Industrial Decarbonisation',
        short: 'Clean Energy & Industrial Decarbonisation',
        quotes: [] },
      { id: 'soc-1', pillarGroup: 'society', row: 'I', state: 'horizontal',
        name: 'Just Green Transition',
        short: 'Just Green Transition',
        hint: 'circular product design',
        quotes: [
          { text: 'circular product design', ref: 'Specific Programme, Art. 11e, p. 23' },
        ] },
      { id: 'comp-2', pillarGroup: 'competitiveness', row: 'II', state: 'vertical',
        name: 'Biotechnology, Agriculture, Health, and Sustainable Transition',
        short: 'Biotechnology, Agriculture, Health & Sustainable Transition',
        hint: 'Cultural and Creative Industries',
        topic: 'Cultural and Creative Industries',
        quotes: [
          { text: 'Creative and design methods may also be developed and tested as inputs to industrial innovation, where they contribute to product differentiation.', ref: 'Specific Programme, Art. 11b, p. 18' },
          { text: '…include design from the early stages of the innovation journey, while promoting cultural diversity and socio-cultural value.', ref: 'Specific Programme, Art. 11b, p. 18' },
          { text: '[T]he tools, technologies and methods on which European cultural and creative sectors, organisations, creators and businesses can build. This includes artistic research methodologies and non-commercial forms of cultural and artistic creation.', ref: 'Specific Programme, Art. 11b, p. 18' },
          { text: 'Activities may address production, capture, rendering, translation and distribution technologies across audiovisual and games production, publishing, music, design, architecture, fashion and craft…', ref: 'Specific Programme, Art. 11b, p. 18' },
        ] },
      { id: 'soc-2', pillarGroup: 'society', row: 'II', state: 'vertical',
        name: 'Sustainable, Inclusive and Healthy Societies',
        short: 'Sustainable, Inclusive & Healthy Societies',
        hint: 'Culture and creative sectors',
        topic: 'Culture, Cultural Heritage, including the Cultural Heritage Cloud and Creative Sectors',
        quotes: [
          { text: 'support the vitality of its cultural and creative sectors', ref: 'Specific Programme, Art. 11f, p. 26' },
          { text: 'the economic and social contribution of the cultural and creative sectors in Europe', ref: 'Specific Programme, Art. 11f, p. 26' },
          { text: 'New models for public health care should prioritise human-centred design', ref: 'Specific Programme, Art. 11f (Health Care Systems), p. 24' },
          { text: 'the planning and design of urban spaces', ref: 'Specific Programme, Art. 11f (Communities and Cities), p. 25–26' },
        ] },
      { id: 'comp-3', pillarGroup: 'competitiveness', row: 'III', state: 'horizontal',
        name: 'Digital Leadership',
        short: 'Digital Leadership',
        hint: 'only chip design',
        note: 'In the text, design appears only as chip design.',
        quotes: [] },
      { id: 'soc-3', pillarGroup: 'society', row: 'III', state: 'horizontal',
        name: 'Inclusive Digital Societies',
        short: 'Inclusive Digital Societies',
        hint: 'human-centred digital environments',
        topic: 'Human-centred Digital Environments, including Social Media and Addictive Algorithmic Design Patterns',
        quotes: [
          // The broadline's title. No page: the brief does not give one.
          { text: 'Human-centred Digital Environments, including Social Media and Addictive Algorithmic Design Patterns', ref: 'Specific Programme, Art. 11g' },
        ] },
      { id: 'comp-4', pillarGroup: 'competitiveness', row: 'IV', state: 'horizontal',
        name: 'Critical Raw Materials, Security and Space',
        short: 'Critical Raw Materials, Security & Space',
        hint: 'design for recovery',
        quotes: [
          // No page: the brief does not give one for this passage.
          { text: 'design for recovery', ref: 'Specific Programme, Art. 11d' },
        ] },
      { id: 'soc-4', pillarGroup: 'society', row: 'IV', state: 'horizontal',
        name: 'Resilient Societies',
        short: 'Resilient Societies',
        quotes: [] },
      { id: 'missions', pillarGroup: 'horizontal', row: null, state: 'horizontal',
        name: 'Missions',
        short: 'Missions',
        detail: 'Adaptation to Climate Change; Cancer; Restore our Ocean and Waters; 100 Climate-neutral and Smart Cities; A Soil Deal for Europe',
        quotes: [] },
      { id: 'neb', pillarGroup: 'horizontal', row: null, state: 'vertical',
        name: 'New European Bauhaus (NEB) Facility',
        short: 'New European Bauhaus',
        quotes: [
          { text: 'the transformation of neighbourhoods into sustainable, inclusive and beautiful places', ref: 'Specific Programme, Art. 11i(b), p. 29' },
          { text: 'through sustainable, innovative, creative and inclusive design', ref: 'Regulation, Recital 12, p. 8' },
        ] },
      { id: 'metrology', pillarGroup: 'horizontal', row: null, state: 'unmarked',
        name: 'Metrology Partnership',
        short: 'Metrology Partnership',
        quotes: [] },
      { id: 'ssha', pillarGroup: 'horizontal', row: null, state: 'vertical',
        name: 'Pilot for an SSHA Sectoral Plan',
        short: 'SSHA Sectoral Plan pilot',
        detail: 'Social Sciences, Humanities and the Arts',
        quotes: [
          { text: 'in form of a SSHA Sectoral Plan', ref: 'Specific Programme, Art. 11k, p. 30–31; Regulation, Art. 15d' },
        ] },
    ],
    // Example themes between each Competitiveness and Society pair. These
    // are the campaign's own examples, not EU text, and always say so.
    bridges: {
      I: ['Circular design', 'Transition design'],
      II: ['Healthy lifestyles', 'Smart and inclusive mobility'],
      III: ['eHealth', 'Inclusive responsible AI'],
      IV: ['Smart materials', 'Community design'],
    },
  },

  // --- Evidence: section D of the In detail page ------------------------
  // Exact quotes and references (brief, section 6).
  evidence: {
    quotes: [
      { text: '…include design from the early stages of the innovation journey, while promoting cultural diversity and socio-cultural value.', ref: 'Specific Programme, Art. 11b, p. 18' },
      { text: '…provide for the integration of social sciences, humanities and the arts (SSHA) across all components under the Programme', ref: 'Regulation, Art. 5(a), p. 27' },
      { text: '…promote co-creation and co-design through the engagement of citizens and civil society', ref: 'Regulation, Art. 5(cb), p. 28' },
    ],
    gap: 'Neither document names Design as a discipline of its own. That is what we ask Parliament, Council and Commission to add.',
    // TODO: titles and years for the statistics' sources.
    sources: [
      'Regulation establishing Horizon Europe 2028–2034, 2025/0543 (COD), Parliament’s compromise text',
      'Specific Programme implementing Horizon Europe, 2025/0544 (CNS), Parliament’s compromise text',
      'McKinsey Design Index: revenue growth and shareholder returns of design-led companies (title and year to add)',
      'European Commission: the cultural and creative industries’ share of EU GDP value added and of employment (title and year to add)',
      'European Commission, 2009: the link between the use of design and national competitiveness (title to add)',
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
  const timelineSteps = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const steps = FP10.timeline.map((s) => {
      const end = new Date(s.ends || s.date);
      end.setHours(23, 59, 59, 999);
      return { ...s, passed: end < today };
    });
    return { steps, nowIndex: steps.findIndex((s) => !s.passed) };
  };

  function renderTimeline() {
    const host = document.getElementById('fp10Timeline');
    if (!host) return;

    const { steps, nowIndex } = timelineSteps();

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

  // --- 3. Structure map (In detail, section A) ---------------------------
  // The four pillars side by side, each entry coded with Jeroen's four
  // categories (FP10.designLegend). Pillar II's windows come from
  // FP10.pillarTwo.cells, the same list as the section C map. The ECF sits
  // beside Pillar II, drawn dashed: a separate fund, not a fifth pillar.
  // Each pillar is a <details>, so on narrow screens it collapses to its
  // heading; on wide screens all are open.
  function renderStructure() {
    const host = document.getElementById('fp10Structure');
    if (!host) return;

    const legendLabel = {};
    FP10.designLegend.forEach((l) => { legendLabel[l.key] = l.label; });

    // The colour is the only visible carrier of the category, so each
    // coded box also states it in text for screen readers.
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

    // Pillar II's windows, as structure entries.
    const windowEntry = (c) => ({
      name: c.row ? c.row + ' ‘' + c.name + '’' : c.name,
      design: legendLabel[c.state] ? c.state : null,
      note: c.state === 'vertical' ? (c.topic || c.detail) : c.detail,
    });
    const pillarTwoGroups = [
      ['Competitiveness Windows', 'competitiveness'],
      ['Society Windows', 'society'],
      ['Horizontal Window', 'horizontal'],
    ];

    const grid = el('div', 'sm-grid');
    const panels = [];

    FP10.pillars.forEach((p) => {
      const key = p.windowsFrom === 'pillarTwo';
      const d = el('details', 'sm-pillar' + (key ? ' sm-key' : ''));

      const sum = el('summary', 'sm-summary');
      sum.appendChild(el('span', 'sm-pillar-id', 'Pillar ' + p.id));
      sum.appendChild(el('span', 'sm-pillar-name', p.name));
      d.appendChild(sum);

      const body = el('div', 'sm-body');
      if (p.items) body.appendChild(boxList(p.items));
      if (key) {
        pillarTwoGroups.forEach(([label, group]) => {
          body.appendChild(el('div', 'sm-group-name', label));
          const cells = group === 'horizontal' ? cellsFor('horizontal') : pairedCells().filter((c) => c.pillarGroup === group);
          body.appendChild(boxList(cells.map(windowEntry)));
        });
      }
      if (p.extra) body.appendChild(boxList(p.extra));
      if (key) {
        const zoom = el('a', 'sm-zoom', 'Zoom into Pillar II ↓');
        zoom.href = '#c';
        body.appendChild(zoom);
      }

      d.appendChild(body);
      grid.appendChild(d);
      panels.push({ node: d, expanded: !!p.expanded });

      if (key) {
        const ecf = el('div', 'sm-ecf');
        ecf.appendChild(el('span', 'sm-ecf-tag', 'Separate fund'));
        ecf.appendChild(el('span', 'sm-ecf-name', FP10.ecf.name));
        ecf.appendChild(el('span', 'sm-ecf-note', FP10.ecf.note));
        grid.appendChild(ecf);
      }
    });

    const legend = el('div', 'sm-legend-wrap');
    legend.appendChild(el('p', 'sm-legend-title', FP10.designLegendTitle));
    const ul = el('ul', 'sm-legend');
    FP10.designLegend.forEach((l) => {
      const li = el('li', 'sm-legend-item');
      li.appendChild(el('span', `sm-swatch sm-${l.key}`));
      li.appendChild(el('span', null, l.label));
      ul.appendChild(li);
    });
    legend.appendChild(ul);

    host.textContent = '';
    host.appendChild(grid);
    host.appendChild(legend);
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

  // --- 5. "Now" line (page 1) ------------------------------------------
  // The current step of the timeline, so the line moves on by itself.
  function renderNow() {
    const host = document.getElementById('fp10Now');
    if (!host) return;
    const { steps, nowIndex } = timelineSteps();
    const now = steps[nowIndex];
    if (!now) { host.closest('.now-line').hidden = true; return; }
    host.textContent = now.step + ', ' + now.label;
  }

  // --- 6. The building (page 1) ----------------------------------------
  // FP10 drawn as a building: roof, four pillars, base. Pillar II holds
  // its windows as small cells, coloured by state. The figure is one
  // image to assistive tech, described by a generated aria-label.
  const cellsFor = (group) => FP10.pillarTwo.cells.filter((c) => c.pillarGroup === group);
  // A window's state label, from Jeroen's legend.
  const stateLabel = (key) => (FP10.designLegend.find((l) => l.key === key) || FP10.unmarked).label;
  const pairedCells = () => {
    // Reading order of the map: row I Competitiveness, row I Society, ...
    const out = [];
    ['I', 'II', 'III', 'IV'].forEach((row) => {
      ['competitiveness', 'society'].forEach((g) => {
        const c = FP10.pillarTwo.cells.find((x) => x.row === row && x.pillarGroup === g);
        if (c) out.push(c);
      });
    });
    return out;
  };

  function renderBuilding() {
    const host = document.getElementById('fp10Building');
    if (!host) return;
    const P = FP10.programme;
    const count = (k) => FP10.pillarTwo.cells.filter((c) => c.state === k).length;
    const total = FP10.pillarTwo.cells.length;

    host.setAttribute('role', 'img');
    host.setAttribute('aria-label',
      'FP10 drawn as a building: a roof marked ' + P.years.replace('–', ' to ') +
      ', four pillars with Pillar II, Competitiveness and Society, widest and highlighted, and a base reading ' +
      P.status.toLowerCase() + '. Inside Pillar II are its ' + total + ' windows: ' + count('vertical') +
      ' are red, where design is a sector in its own right, and ' + count('horizontal') +
      ' are blue, where design crosses over into other sectors.');

    const roof = el('div', 'bd-roof');
    roof.appendChild(el('span', 'bd-roof-name', P.name));
    roof.appendChild(el('span', 'bd-roof-years', P.years));

    const pillars = el('div', 'bd-pillars');
    FP10.pillars.forEach((p) => {
      const col = el('div', 'bd-pillar' + (p.id === 'II' ? ' bd-key' : ''));
      col.appendChild(el('b', 'bd-id', p.id));
      if (p.id === 'II') {
        const pairs = el('div', 'bd-cells');
        pairedCells().forEach((c) => pairs.appendChild(el('span', 'bd-cell bd-' + c.state)));
        const horiz = el('div', 'bd-cells bd-cells-h');
        cellsFor('horizontal').forEach((c) => horiz.appendChild(el('span', 'bd-cell bd-' + c.state)));
        col.appendChild(pairs);
        col.appendChild(horiz);
      }
      col.appendChild(el('span', 'bd-name', p.name));
      pillars.appendChild(col);
    });

    const base = el('div', 'bd-base');
    base.appendChild(el('span', 'bd-base-dot'));
    base.appendChild(document.createTextNode(P.status));

    host.textContent = '';
    host.append(roof, el('div', 'bd-beam'), pillars, base);
  }

  // --- 8. Pillar II map (In detail, section C) ----------------------------
  // Competitiveness | Society in rows I-IV, bridge chips between each pair,
  // then the Horizontal window as a row. Each cell is a button
  // that opens its quotes in a panel directly below its row. One open at
  // a time; opening another closes the first.
  const groupLabel = { competitiveness: 'Competitiveness', society: 'Society', horizontal: 'Horizontal window' };
  const cellTitle = (c) => (c.row ? groupLabel[c.pillarGroup] + ' ' + c.row : groupLabel.horizontal) + ': ' + c.name;

  const quoteList = (c) => {
    const frag = document.createDocumentFragment();
    if (!c.quotes.length) {
      frag.appendChild(el('p', 'mp-empty', c.note || 'No design wording in the text yet.'));
      return frag;
    }
    c.quotes.forEach((q) => {
      const fig = el('figure', 'mp-quote');
      fig.appendChild(el('blockquote', 'mp-quote-text', '“' + q.text + '”'));
      fig.appendChild(el('figcaption', 'mp-quote-ref', q.ref));
      frag.appendChild(fig);
    });
    return frag;
  };

  function renderMap() {
    const host = document.getElementById('fp10Map');
    if (!host) return;
    const buttons = [];
    const panels = [];

    const cellButton = (c, panelId) => {
      const b = el('button', 'mp-cell mp-' + c.state);
      b.type = 'button';
      b.id = 'cell-' + c.id;
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-controls', panelId);
      if (c.row) {
        b.appendChild(el('span', 'u-sr', groupLabel[c.pillarGroup] + ' window '));
        b.appendChild(el('span', 'mp-cell-row', c.row));
      }
      b.appendChild(el('span', 'mp-cell-name', c.short));
      if (c.hint) b.appendChild(el('span', 'mp-cell-hint', c.hint));
      b.appendChild(el('span', 'u-sr', '(' + stateLabel(c.state) + ')'));
      b.addEventListener('click', () => toggle(c, b));
      buttons.push(b);
      return b;
    };

    const panel = (id) => {
      const p = el('div', 'mp-panel');
      p.id = id;
      p.hidden = true;
      panels.push(p);
      return p;
    };

    const toggle = (c, b) => {
      const wasOpen = b.getAttribute('aria-expanded') === 'true';
      buttons.forEach((x) => x.setAttribute('aria-expanded', 'false'));
      panels.forEach((p) => { p.hidden = true; p.textContent = ''; });
      if (wasOpen) return;
      const p = document.getElementById(b.getAttribute('aria-controls'));
      p.className = 'mp-panel mp-panel-' + c.state;
      p.appendChild(el('p', 'mp-panel-head', cellTitle(c) + (c.topic ? ' · ' + c.topic : '')));
      p.appendChild(quoteList(c));
      p.hidden = false;
      b.setAttribute('aria-expanded', 'true');
    };

    const map = el('div', 'mp');
    map.setAttribute('role', 'group');
    map.setAttribute('aria-label', 'Map of Pillar II windows');

    const heads = el('div', 'mp-heads');
    heads.setAttribute('aria-hidden', 'true');
    heads.append(el('span', null, groupLabel.competitiveness), el('span', null, groupLabel.society));
    map.appendChild(heads);

    ['I', 'II', 'III', 'IV'].forEach((row) => {
      const panelId = 'mp-panel-' + row;
      const r = el('div', 'mp-row');
      ['competitiveness', 'society'].forEach((g) => {
        const c = FP10.pillarTwo.cells.find((x) => x.row === row && x.pillarGroup === g);
        r.appendChild(cellButton(c, panelId));
      });
      map.appendChild(r);
      map.appendChild(panel(panelId));
      const chips = el('ul', 'mp-bridges');
      chips.setAttribute('aria-label', 'Our example themes for this pair, not EU text');
      FP10.pillarTwo.bridges[row].forEach((t) => chips.appendChild(el('li', 'mp-chip', t)));
      map.appendChild(chips);
    });

    map.appendChild(el('p', 'mp-head-h', groupLabel.horizontal));
    const h = el('div', 'mp-row mp-row-h');
    cellsFor('horizontal').forEach((c) => h.appendChild(cellButton(c, 'mp-panel-h')));
    map.appendChild(h);
    map.appendChild(panel('mp-panel-h'));
    const extra = FP10.pillars.find((p) => p.id === 'II').extra || [];
    if (extra.length) map.appendChild(el('p', 'mp-also', 'Pillar II also includes ' + extra.map((x) => x.name).join(', ') + '.'));

    host.textContent = '';
    host.appendChild(map);
  }

  // Legend for the map: the two states Pillar II's windows use, the one
  // unmarked window, and the bridge chips.
  function renderLegend() {
    const host = document.getElementById('fp10Legend');
    if (!host) return;
    const ul = el('ul', 'mp-legend');
    const item = (swatch, ...text) => {
      const li = el('li', 'mp-legend-item');
      li.appendChild(swatch);
      const t = el('span');
      t.append(...text);
      li.appendChild(t);
      ul.appendChild(li);
    };
    ['vertical', 'horizontal'].forEach((k) => item(el('span', 'mp-swatch mp-' + k), stateLabel(k)));
    const unmarked = FP10.pillarTwo.cells.filter((c) => c.state === 'unmarked').map((c) => c.name);
    if (unmarked.length) item(el('span', 'mp-swatch mp-unmarked'), FP10.unmarked.label + ': ' + unmarked.join(', '));
    item(el('span', 'mp-chip mp-chip-key', 'theme'), 'Between a pair: ', el('strong', null, 'our examples'), ', not EU text');
    host.textContent = '';
    host.appendChild(ul);
  }

  // "All quotes, window by window": everything the map holds, as a list.
  function renderAllQuotes() {
    const host = document.getElementById('fp10AllQuotes');
    if (!host) return;
    const order = pairedCells().concat(cellsFor('horizontal'));
    const count = document.getElementById('fp10AllQuotesCount');
    if (count) count.textContent = String(order.length);
    const list = el('ol', 'aq-list');
    order.forEach((c) => {
      const li = el('li', 'aq-item');
      const head = el('p', 'aq-head');
      head.append(el('span', 'mp-swatch mp-' + c.state), cellTitle(c));
      li.appendChild(head);
      li.appendChild(el('p', 'aq-state', stateLabel(c.state) + (c.topic ? ' · ' + c.topic : '')));
      li.appendChild(quoteList(c));
      list.appendChild(li);
    });
    host.textContent = '';
    host.appendChild(list);
  }

  // --- 9. Evidence (In detail, section D) --------------------------------
  function renderEvidence() {
    const host = document.getElementById('fp10Evidence');
    if (!host) return;
    const E = FP10.evidence;
    host.textContent = '';
    E.quotes.forEach((q) => {
      const fig = el('figure', 'ev-quote');
      fig.appendChild(el('blockquote', 'ev-quote-text', '“' + q.text + '”'));
      fig.appendChild(el('figcaption', 'ev-quote-ref', q.ref));
      host.appendChild(fig);
    });
    const gap = el('p', 'ev-gap');
    gap.append(el('strong', null, 'What the text does not yet say: '), E.gap);
    host.appendChild(gap);
    host.appendChild(el('h3', 'ev-sources-head', 'Sources'));
    const ul = el('ul', 'ev-sources');
    E.sources.forEach((s) => ul.appendChild(el('li', null, s)));
    host.appendChild(ul);
  }

  function renderUpdated() {
    const host = document.getElementById('fp10Updated');
    if (!host) return;
    const d = new Date(FP10.lastUpdated + 'T12:00:00');
    host.textContent = 'Updated ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const start = () => {
    renderTimeline();
    renderTrilogue();
    renderConnectors();
    renderStructure();
    renderThemes();
    renderNow();
    renderBuilding();
    renderLegend();
    renderMap();
    renderAllQuotes();
    renderEvidence();
    renderUpdated();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
