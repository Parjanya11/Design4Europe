// =================================================================
//  Design for Europe (FP10) — small, dependency-free interactions.
// =================================================================

// --- Mobile nav toggle ---------------------------------------------------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// --- Signatory logos, second appearance -----------------------------------
// The logo list is written once, in the banner under the hero. Copy it into
// the Organisations tab as a grid rather than keeping a second hand-maintained
// list. Done before the marquee setup below, which clones the banner chips.
const logoGrid = document.getElementById('logoGrid');
if (logoGrid) {
  const sortKey = (img) => img.alt.toLowerCase().replace(/^the /, '');
  const logos = [...document.querySelectorAll('.logo-banner .logo-chip img')]
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b), 'en'));
  for (const img of logos) {
    const tile = document.createElement('div');
    tile.className = 'logo-tile';
    const copy = img.cloneNode(false);
    // Far down the page: no need to fetch until the reader gets there.
    copy.loading = 'lazy';
    tile.appendChild(copy);
    logoGrid.appendChild(tile);
  }
  document.getElementById('orgCount').textContent = logos.length;
}

// --- Signatory tabs -------------------------------------------------------
// WAI-ARIA tabs: click or arrow keys switch, only the selected tab is in the
// tab order, and the hidden panel is out of the accessibility tree.
const sigTabs = [...document.querySelectorAll('.sig-tab')];
const selectTab = (tab, focus) => {
  for (const t of sigTabs) {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  }
  if (focus) tab.focus();
};
sigTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab, false));
  tab.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) {
      e.preventDefault();
      selectTab(sigTabs[(i + step + sigTabs.length) % sigTabs.length], true);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      selectTab(sigTabs[e.key === 'Home' ? 0 : sigTabs.length - 1], true);
    }
  });
});

// --- Seamless logo marquee ----------------------------------------------
// Duplicate each row so the -50% keyframe loops without a visible jump.
// Clones are marked aria-hidden: they exist only to make the loop seamless,
// and without this a screen reader would announce every logo twice per row.
// Duration follows the row's length, so every row moves at the same speed
// however many logos it holds.
const MARQUEE_PX_PER_SECOND = 60;
document.querySelectorAll('.marquee-track').forEach((track) => {
  [...track.children].forEach((chip) => {
    const clone = chip.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  const loopWidth = track.scrollWidth / 2;
  track.style.animationDuration = (loopWidth / MARQUEE_PX_PER_SECOND).toFixed(1) + 's';
});

// --- Category "Other" free-text field -----------------------------------
// Visible and required only while "Other" is selected. Disabled otherwise,
// so browsers skip its validation and leave it out of the submission.
const categorySelect = document.getElementById('categorySelect');
const categoryOtherLabel = document.getElementById('categoryOtherLabel');
const categoryOtherInput = document.getElementById('categoryOtherInput');

categorySelect.addEventListener('change', () => {
  const isOther = categorySelect.value === 'Other';
  categoryOtherLabel.classList.toggle('hidden', !isOther);
  categoryOtherInput.disabled = !isOther;
  categoryOtherInput.required = isOther;
  if (isOther) categoryOtherInput.focus();
});

// --- Signing as: individual or institution -------------------------------
// An individual may genuinely have no institution, so forcing one only
// produces junk data. The logo question is institutional by nature, so it
// is hidden entirely for individuals rather than asked pointlessly.
const signingAs = document.getElementById('signingAs');
const organisationLabel = document.getElementById('organisationLabel');
const organisationInput = document.getElementById('organisationInput');
const logoPermissionBlock = document.getElementById('logoPermissionBlock');
const logoPermissionInput = document.getElementById('logoPermissionInput');

signingAs.addEventListener('change', () => {
  const isInstitution = signingAs.value === 'On behalf of an institution';

  organisationLabel.textContent = isInstitution ? 'Organisation' : 'Affiliation (optional)';
  organisationInput.required = isInstitution;
  organisationInput.placeholder = isInstitution
    ? 'University / company name'
    : 'University or company, if any';

  logoPermissionBlock.classList.toggle('hidden', !isInstitution);
  // Unchecked when hidden, so a hidden field can never submit a stale yes.
  if (!isInstitution) logoPermissionInput.checked = false;
});

// --- Sign-on form -------------------------------------------------------
// Posts to our own Netlify Function, which stores the signature and sends
// both the confirmation and the notification email.
// Success: hide the form, reveal the thank-you panel.
// Failure: show an inline error and keep everything the visitor typed.
const SIGNON_ENDPOINT = '/.netlify/functions/signon';
const form = document.getElementById('signonForm');
const thanks = document.getElementById('signThanks');
const errorMsg = document.getElementById('signError');
const signSub = document.getElementById('signSub');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('.btn-submit');
  errorMsg.classList.add('hidden');
  submitBtn.disabled = true;

  try {
    const response = await fetch(SIGNON_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Sign-on endpoint responded with status ' + response.status);
    }

    form.classList.add('hidden');
    // "sign on below" makes no sense once the form it refers to is gone.
    signSub.classList.add('hidden');
    thanks.classList.remove('hidden');
    thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    submitBtn.disabled = false;
    errorMsg.classList.remove('hidden');
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});


// --- Public signatory list ----------------------------------------------
// Fetched rather than baked in, so the list reflects new signatures without
// a redeploy. The endpoint returns only people who chose to be named, and
// only their name, organisation, country and category - never an email.
(async () => {
  const listEl = document.getElementById('rollList');
  if (!listEl) return;

  const ledeEl = document.getElementById('rollLede');
  const noteEl = document.getElementById('rollNote');
  const num = (n) => n.toLocaleString('en');

  // Built as DOM nodes, never an HTML string: these are names typed by the
  // public, and must not be parsed as markup.
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  try {
    const res = await fetch('/.netlify/functions/signatories', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('status ' + res.status);
    const data = await res.json();

    const people = data.signatories || [];
    document.getElementById('peopleCount').textContent = num(people.length);

    ledeEl.textContent = '';
    ledeEl.append(
      'Endorsed by ',
      el('strong', null, num(data.total)),
      ' signatories from across Europe.',
    );

    const frag = document.createDocumentFragment();
    for (const p of people) {
      const entry = el('div', 'roll-entry');
      entry.appendChild(el('div', 'roll-name', p.name));
      const meta = [p.organisation, p.country].filter(Boolean).join(', ');
      if (meta) entry.appendChild(el('div', 'roll-meta', meta));
      frag.appendChild(entry);
    }
    listEl.appendChild(frag);

    // Account for people who signed but asked not to be named, so the
    // headline total is not contradicted by a shorter list beneath it.
    if (data.unlisted > 0) {
      noteEl.textContent =
        'A further ' + num(data.unlisted) +
        ' signatories asked not to be listed publicly. They are included in the total above.';
      noteEl.hidden = false;
    }
  } catch (err) {
    ledeEl.textContent =
      'The list of signatories could not be loaded. Please refresh to try again.';
  }
})();
