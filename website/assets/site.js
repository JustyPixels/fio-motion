const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const savingData = !!navigator.connection?.saveData;
document.documentElement.classList.toggle('data-saving', savingData);
const hero = document.querySelector('#hero-video');
const toggle = document.querySelector('.film-toggle');
const observesVisibility = 'IntersectionObserver' in window;
let inView = false, manuallyPaused = false;
function updateButton() {
  if (!hero || !toggle) return;
  const label = hero.paused ? 'Play introduction' : 'Pause introduction';
  toggle.removeAttribute('aria-label');
  toggle.textContent = label;
}
function updateMotion() {
  document.documentElement.classList.toggle('js-motion', observesVisibility && !reduced.matches && !savingData);
  if (!hero) return;
  if (reduced.matches || savingData || !inView || document.hidden || manuallyPaused) hero.pause();
  else hero.play().catch(updateButton);
}
if (observesVisibility) {
  document.documentElement.classList.toggle('js-motion', !reduced.matches && !savingData);
  const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }, {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
if (hero && toggle) {
  hero.controls = false;
  toggle.hidden = false;
  hero.addEventListener('play', updateButton); hero.addEventListener('pause', updateButton);
  toggle.addEventListener('click', () => { if (hero.paused) { manuallyPaused=false;hero.play().catch(updateButton); } else { manuallyPaused=true;hero.pause(); } });
  if (observesVisibility) new IntersectionObserver(entries => {inView=entries[0].isIntersecting;updateMotion();},{threshold:.12}).observe(hero);
  updateButton();
}
for (const video of document.querySelectorAll('video:not(#hero-video)')) {
  if (observesVisibility) new IntersectionObserver(entries => {if(!entries[0].isIntersecting)video.pause();},{threshold:.05}).observe(video);
}
document.addEventListener('visibilitychange', () => {updateMotion();if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());});
reduced.addEventListener('change', updateMotion);
