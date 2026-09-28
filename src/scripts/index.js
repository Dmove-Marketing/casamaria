import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import 'flatpickr/dist/flatpickr.min.css';
import './forms.ts';

// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => obs.observe(el));

// Flatpickr — data do evento
flatpickr('#f-data', {
  locale: Portuguese,
  dateFormat: 'd/m/Y',
  minDate: 'today',
  disableMobile: true,
});

// Máscara de telefone
const telInput = document.getElementById('f-tel');
if (telInput) {
  telInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 10) {
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    e.target.value = v;
  });
}

// Galeria — carrossel infinito com setas e bolinhas (visível só no mobile)
// Um clone da última foto vai no início e um da primeira no fim; ao parar
// num clone, o scroll salta sem animação para a foto real correspondente.
const galStrip = document.querySelector('.galeria-strip');
const galDots = document.querySelector('.gal-dots');
if (galStrip && galDots) {
  const items = [...galStrip.children];
  const total = items.length;
  const makeClone = (el) => {
    const c = el.cloneNode(true);
    c.classList.add('gal-clone');
    c.setAttribute('aria-hidden', 'true');
    return c;
  };

  const step = () => items[1].offsetLeft - items[0].offsetLeft;
  const position = () => Math.round(galStrip.scrollLeft / step());
  const jumpTo = (pos) => {
    galStrip.style.scrollBehavior = 'auto';
    galStrip.scrollLeft = pos * step();
    galStrip.style.scrollBehavior = '';
  };
  const goTo = (pos) => galStrip.scrollTo({ left: pos * step(), behavior: 'smooth' });

  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', () => goTo(i + 1));
    galDots.appendChild(dot);
  });

  document.querySelector('.gal-prev')?.addEventListener('click', () => goTo(position() - 1));
  document.querySelector('.gal-next')?.addEventListener('click', () => goTo(position() + 1));

  const updateDots = () => {
    const current = (position() - 1 + total) % total;
    [...galDots.children].forEach((d, i) => d.classList.toggle('active', i === current));
  };

  let settleTimer;
  galStrip.addEventListener('scroll', () => {
    updateDots();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const pos = position();
      if (pos === 0) jumpTo(total);
      else if (pos === total + 1) jumpTo(1);
    }, 150);
  }, { passive: true });

  // Clones só existem no mobile: no desktop alterariam o mosaico (nth-child)
  const mobile = window.matchMedia('(max-width: 900px)');
  const init = () => {
    galStrip.querySelectorAll('.gal-clone').forEach((c) => c.remove());
    if (mobile.matches) {
      galStrip.prepend(makeClone(items[total - 1]));
      galStrip.append(makeClone(items[0]));
      jumpTo(1);
    }
    updateDots();
  };
  init();
  mobile.addEventListener('change', init);
}
