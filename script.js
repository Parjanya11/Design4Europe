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

// --- Sign-on form -------------------------------------------------------
// The site is STATIC, so there is no server to receive this by default.
// This handler swaps the form for the "thank you" panel (matching the
// original design). To collect real submissions:
//   • Deploy on Netlify — Netlify Forms picks it up via the data-netlify
//     attribute. Then DELETE the e.preventDefault() line below so the
//     form submits normally, OR keep it and read submissions in Netlify.
//   • Or use Formspree — see README.md.
const form = document.getElementById('signonForm');
const thanks = document.getElementById('signThanks');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // remove this line once a real backend is connected
  form.classList.add('hidden');
  thanks.classList.remove('hidden');
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
