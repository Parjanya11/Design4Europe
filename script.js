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

// --- Seamless logo marquee ----------------------------------------------
// Duplicate the row so the -50% keyframe loops without a visible jump.
const track = document.getElementById('marqueeTrack');
if (track) track.innerHTML += track.innerHTML;

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

// --- Sign-on form -------------------------------------------------------
// Posts to our own Netlify Function, which stores the signature and sends
// both the confirmation and the notification email.
// Success: hide the form, reveal the thank-you panel.
// Failure: show an inline error and keep everything the visitor typed.
const SIGNON_ENDPOINT = '/.netlify/functions/signon';
const form = document.getElementById('signonForm');
const thanks = document.getElementById('signThanks');
const errorMsg = document.getElementById('signError');

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
    thanks.classList.remove('hidden');
    thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    submitBtn.disabled = false;
    errorMsg.classList.remove('hidden');
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
