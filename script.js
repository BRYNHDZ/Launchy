/* ============================================
   BLAZTLY — ink star field & space animations
   hand-drawn cosmos on paper
   ============================================ */

// --- Ink Space Canvas ---
// Multiple parallax layers of ink dots, constellations, and shooting stars
(function initSpace() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h;
  let layers = [];         // parallax star layers
  let constellations = [];
  let shootingStars = [];
  let mouseX = 0, mouseY = 0;
  let running = true;      // paused when tab hidden

  function resize() {
    // Buffer matches CSS size — previously buffer was 3× innerHeight while
    // displayed at 100vh, which wasted ~66% of every clearRect/fill. Parallax
    // still works because stars wrap with modulo(h) on scroll.
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    canvas.style.height = '100vh';
    seed();
  }

  function seed() {
    layers = [];
    constellations = [];

    // 3 parallax layers — back (slow, small), mid, front (fast, bigger dots)
    // Counts reduced ~40% — at 0.03–0.15 opacity the difference is invisible
    // but cuts per-frame ctx.arc/fill work significantly on low-end GPUs.
    const layerConfigs = [
      { count: 110, sizeMin: 0.3, sizeMax: 1, opacityMin: 0.03, opacityMax: 0.07, speed: 0.1 },
      { count: 50,  sizeMin: 0.6, sizeMax: 1.8, opacityMin: 0.05, opacityMax: 0.12, speed: 0.25 },
      { count: 20,  sizeMin: 1.2, sizeMax: 3.5, opacityMin: 0.06, opacityMax: 0.15, speed: 0.45 },
    ];

    for (const cfg of layerConfigs) {
      const stars = [];
      for (let i = 0; i < cfg.count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
          baseOpacity: cfg.opacityMin + Math.random() * (cfg.opacityMax - cfg.opacityMin),
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinklePhase: Math.random() * Math.PI * 2,
          // some stars pulse bigger — like they're "breathing"
          pulseAmp: Math.random() > 0.85 ? 0.3 + Math.random() * 0.5 : 0,
        });
      }
      layers.push({ stars, speed: cfg.speed });
    }

    // Constellations — little groups connected by hair-thin ink lines
    const numConstellations = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numConstellations; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const numPts = 3 + Math.floor(Math.random() * 4);
      const points = [];
      for (let j = 0; j < numPts; j++) {
        points.push({
          x: cx + (Math.random() - 0.5) * 140,
          y: cy + (Math.random() - 0.5) * 140,
          r: 1 + Math.random() * 1.5,
        });
      }
      constellations.push({
        points,
        opacity: 0.03 + Math.random() * 0.04,
        layerSpeed: 0.15 + Math.random() * 0.15,
      });
    }
  }

  // Spawn a shooting star
  function spawnShootingStar() {
    const startX = Math.random() * w;
    const startY = Math.random() * h * 0.4;
    const angle = (Math.PI / 6) + Math.random() * (Math.PI / 4); // 30-75 degrees
    const speed = 6 + Math.random() * 8;
    shootingStars.push({
      x: startX,
      y: startY,
      angle,
      speed,
      length: 40 + Math.random() * 80,
      opacity: 0.15 + Math.random() * 0.1,
      life: 0,
      maxLife: 30 + Math.random() * 30,
    });
  }

  // Periodically spawn shooting stars
  setInterval(() => {
    if (shootingStars.length < 3 && Math.random() > 0.4) {
      spawnShootingStar();
    }
  }, 2000);

  let time = 0;
  function draw() {
    if (!running) return; // paused while tab is hidden — rAF loop will resume on visibility
    time += 0.008;
    ctx.clearRect(0, 0, w, h);

    const viewH = window.innerHeight;
    const scrollOffset = window.scrollY;

    // Mouse parallax offset (subtle)
    const mx = (mouseX - w / 2) * 0.01;
    const my = (mouseY - viewH / 2) * 0.01;

    // Draw constellations
    for (const c of constellations) {
      const offsetY = -scrollOffset * c.layerSpeed;
      ctx.strokeStyle = `rgba(26, 26, 26, ${c.opacity})`;
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 4]); // dashed lines — hand-drawn feel
      ctx.beginPath();
      for (let i = 0; i < c.points.length - 1; i++) {
        const p1 = c.points[i];
        const p2 = c.points[i + 1];
        ctx.moveTo(p1.x + mx * 2, p1.y + offsetY + my * 2);
        ctx.lineTo(p2.x + mx * 2, p2.y + offsetY + my * 2);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw constellation node dots
      for (const p of c.points) {
        ctx.beginPath();
        ctx.arc(p.x + mx * 2, p.y + offsetY + my * 2, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${c.opacity * 2.5})`;
        ctx.fill();
      }
    }

    // Draw star layers with parallax
    for (const layer of layers) {
      const offsetY = -scrollOffset * layer.speed;
      const pmx = mx * layer.speed * 3;
      const pmy = my * layer.speed * 3;

      for (const s of layer.stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseOpacity * (0.5 + twinkle * 0.5);
        const pulse = s.pulseAmp > 0 ? 1 + Math.sin(time * 1.5 + s.twinklePhase) * s.pulseAmp : 1;
        const r = s.r * pulse;

        const drawY = ((s.y + offsetY + pmy) % h + h) % h;
        const drawX = ((s.x + pmx) % w + w) % w;

        // Only draw if visible in viewport
        if (drawY > -20 && drawY < viewH + 20) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(26, 26, 26, ${alpha})`;
          ctx.fill();

          // Big stars get a faint cross/sparkle
          if (s.r > 2.5 && pulse > 1.1) {
            ctx.strokeStyle = `rgba(26, 26, 26, ${alpha * 0.3})`;
            ctx.lineWidth = 0.5;
            const cr = r * 2.5;
            ctx.beginPath();
            ctx.moveTo(drawX - cr, drawY);
            ctx.lineTo(drawX + cr, drawY);
            ctx.moveTo(drawX, drawY - cr);
            ctx.lineTo(drawX, drawY + cr);
            ctx.stroke();
          }
        }
      }
    }

    // Draw shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life++;

      const progress = ss.life / ss.maxLife;
      const fade = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
      const alpha = ss.opacity * Math.max(0, fade);

      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      // Offset for scroll
      const drawSY = ss.y - scrollOffset * 0.3;
      const drawTY = tailY - scrollOffset * 0.3;

      if (drawSY > -50 && drawSY < viewH + 50) {
        const grad = ctx.createLinearGradient(tailX, drawTY, ss.x, drawSY);
        grad.addColorStop(0, `rgba(26, 26, 26, 0)`);
        grad.addColorStop(1, `rgba(26, 26, 26, ${alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, drawTY);
        ctx.lineTo(ss.x, drawSY);
        ctx.stroke();

        // bright head dot
        ctx.beginPath();
        ctx.arc(ss.x, drawSY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 26, 26, ${alpha * 1.5})`;
        ctx.fill();
      }

      if (ss.life >= ss.maxLife) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  // Track mouse for parallax
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  resize();
  draw();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  });

  // Pause the draw loop while the tab is hidden — browsers throttle rAF to ~1fps
  // anyway, but this also skips any stutter on the frame when it resumes.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      requestAnimationFrame(draw);
    }
  });
})();

// --- Scroll Animations (Intersection Observer) ---
const scrollElements = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);
scrollElements.forEach((el) => observer.observe(el));

// --- Ink divider draw-on when scrolled into view ---
const dividerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('drawn');
      }
    });
  },
  { threshold: 0.3 }
);
document.querySelectorAll('.ink-divider').forEach((el) => dividerObserver.observe(el));

// --- Consolidated scroll handler (rAF-throttled, passive) ---
// Handles nav state + decorative parallax in ONE coalesced frame.
// Caches all element lists once so we don't DOM-walk on every scroll event.
(function initScrollFx() {
  const nav = document.getElementById('nav');
  const splatters = document.querySelectorAll('.ink-splatter');
  const orbits = document.querySelectorAll('.orbit');
  const smudges = document.querySelectorAll('.ink-smudge');
  let ticking = false;

  function update() {
    const sy = window.scrollY;

    if (nav) nav.classList.toggle('scrolled', sy > 40);

    // translate3d pushes to GPU compositor layer — no layout, no paint
    splatters.forEach((el, i) => {
      const speed = 0.03 + i * 0.015;
      el.style.transform = `translate3d(0, ${(sy * speed).toFixed(1)}px, 0)`;
    });

    orbits.forEach((el, i) => {
      const skew = Math.sin(sy * 0.001 + i) * 2;
      const rot = sy * (i === 0 ? 0.02 : -0.015);
      el.style.transform = `rotate(${rot.toFixed(2)}deg) skew(${skew.toFixed(2)}deg)`;
    });

    smudges.forEach((el, i) => {
      const speed = 0.01 + (i % 3) * 0.008;
      const dir = i % 2 === 0 ? 1 : -1;
      el.style.transform = `translate3d(0, ${(sy * speed * dir).toFixed(1)}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update(); // initial paint
})();

// --- Mobile menu ---
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// --- FAQ Accordion ---
// Max-height transitions are jittery when CSS max-height is much larger than content:
// the browser times the full delta (0→600px) but only 0→80px is visible motion.
// Fix: measure real content height in JS and animate to exactly that value.
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');

  function closeItem(item) {
    const answer = item.querySelector('.faq-answer');
    if (!answer) return;
    // Set current height first so the browser has a concrete value to transition FROM
    answer.style.maxHeight = answer.scrollHeight + 'px';
    // Force a reflow so the browser commits that value before we change it
    void answer.offsetHeight;
    answer.style.maxHeight = '0px';
    item.classList.remove('open');
  }

  function openItem(item) {
    const answer = item.querySelector('.faq-answer');
    if (!answer) return;
    item.classList.add('open');
    // scrollHeight = exact content height including padding
    answer.style.maxHeight = answer.scrollHeight + 'px';
    // After the transition ends, clear the inline max-height so the answer
    // can grow if the viewport resizes and text rewraps
    const onEnd = (e) => {
      if (e.propertyName !== 'max-height') return;
      if (item.classList.contains('open')) {
        answer.style.maxHeight = 'none';
      }
      answer.removeEventListener('transitionend', onEnd);
    };
    answer.addEventListener('transitionend', onEnd);
  }

  items.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close every other open item (measured close, not class-swap)
      items.forEach((other) => {
        if (other !== item && other.classList.contains('open')) closeItem(other);
      });
      if (isOpen) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });
  });
})();

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// --- Mascot zero-gravity physics ---
// Smooth floating with proper delta time to avoid jitter on any device.
(function initMascotPhysics() {
  const mascot = document.querySelector('.mascot');
  if (!mascot) return;

  const isMobile = window.innerWidth <= 768;

  // State
  let x = 0, y = 0;
  let vx = 0, vy = 0;
  let mouseNX = 0, mouseNY = 0;
  let time = 0;
  let lastFrame = performance.now();

  // Physics — mobile gets bigger drift
  const SPRING = 0.006;
  const DAMPING = 0.98;
  const MOUSE_FORCE = 0.225;
  const MAX_OFFSET = 40;
  const IDLE_DRIFT_AMP = isMobile ? 32 : 24;

  // Smooth target for mouse (lerp to avoid jitter)
  let mouseTargetX = 0, mouseTargetY = 0;
  let mouseSmoothX = 0, mouseSmoothY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Touch support — treat touch position like mouse
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouseTargetX = (t.clientX / window.innerWidth - 0.5) * 2;
    mouseTargetY = (t.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouseTargetX = 0;
    mouseTargetY = 0;
  });

  function tick(now) {
    // Delta time in seconds, capped to avoid huge jumps on tab switch
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    time += dt;

    // Smooth mouse input (lerp — eliminates jitter from raw input)
    mouseSmoothX += (mouseTargetX - mouseSmoothX) * 0.08;
    mouseSmoothY += (mouseTargetY - mouseSmoothY) * 0.08;

    // Ambient drift — multiple sine waves for organic feel
    const driftX = Math.sin(time * 0.35) * IDLE_DRIFT_AMP * 0.4
                 + Math.sin(time * 0.7 + 2.0) * IDLE_DRIFT_AMP * 0.1;
    const driftY = Math.sin(time * 0.2 + 1.5) * IDLE_DRIFT_AMP
                 + Math.sin(time * 0.55 + 0.3) * IDLE_DRIFT_AMP * 0.15;
    const driftRot = Math.sin(time * 0.25 + 0.7) * 2.5;

    // Scale physics by dt (frame-rate independent)
    const dtScale = dt * 60; // normalized to 60fps

    // Mouse nudge
    vx += mouseSmoothX * MOUSE_FORCE * dtScale;
    vy += mouseSmoothY * MOUSE_FORCE * 0.5 * dtScale;

    // Spring
    vx -= x * SPRING * dtScale;
    vy -= y * SPRING * dtScale;

    // Damping
    const damp = Math.pow(DAMPING, dtScale);
    vx *= damp;
    vy *= damp;

    // Integrate
    x += vx * dtScale;
    y += vy * dtScale;

    // Clamp
    x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x));
    y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y));

    const finalX = x + driftX;
    const finalY = y + driftY;

    mascot.style.transform = `translate(${finalX.toFixed(1)}px, ${finalY.toFixed(1)}px) rotate(${driftRot.toFixed(2)}deg)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

// --- Number count-up animation ---
// Any .count-up element counts from 0 to data-count when scrolled into view.
// Elements with data-defer are skipped here (another controller runs them).
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
function animateCount(el, duration = 1500) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseFloat(el.dataset.count) || 0;
  const start = performance.now();
  const hasDecimal = target % 1 !== 0;
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const val = target * easeOut(p);
    el.textContent = hasDecimal
      ? val.toFixed(1)
      : Math.round(val).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

(function initCountUp() {
  const els = document.querySelectorAll('.count-up:not([data-defer])');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        animateCount(entry.target, 1400 + Math.random() * 400);
      }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
})();

// --- Word-by-word hero reveal ---
// Splits the hero h1 into words and staggers them in
(function initHeroReveal() {
  const h1 = document.querySelector('.hero-content h1');
  if (!h1) return;

  // Walk the h1 and wrap text nodes into word spans (preserve .ink-underline + <br>)
  function wrapWords(node) {
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part.length) {
            const span = document.createElement('span');
            span.className = 'word-reveal';
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        // wrap the contents of inline elements too (like .ink-underline)
        child.classList.add('word-reveal');
      }
    });
  }
  wrapWords(h1);

  const words = h1.querySelectorAll('.word-reveal');
  words.forEach((w, i) => {
    w.style.animationDelay = (0.1 + i * 0.08) + 's';
  });
  h1.classList.add('words-ready');
})();

// --- Magnetic buttons ---
// Big CTA buttons gently pull toward the cursor
(function initMagneticButtons() {
  if (window.innerWidth <= 768) return; // skip on touch
  const buttons = document.querySelectorAll('.btn-lg:not(.btn-wiggle), .btn-accent:not(.btn-wiggle)');
  buttons.forEach((btn) => {
    let rafId = null;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        const span = btn.querySelector('span');
        if (span) span.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
      });
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      const span = btn.querySelector('span');
      if (span) span.style.transform = '';
    });
  });
})();

// --- Service card 3D tilt ---
(function initCardTilt() {
  if (window.innerWidth <= 968) return;
  const cards = document.querySelectorAll('.service-card');
  cards.forEach((card) => {
    const baseWobble = getComputedStyle(card).getPropertyValue('--wobble') || '0deg';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// --- Multi-step form controller ---
(function initLaunchForm() {
  const form = document.getElementById('launchForm');
  if (!form) return;

  const steps = form.querySelectorAll('.form-step');
  const dots = form.querySelectorAll('.form-step-dot');
  const progressFill = document.getElementById('formProgressFill');
  const prevBtn = document.getElementById('formPrev');
  const nextBtn = document.getElementById('formNext');
  const submitBtn = document.getElementById('formSubmit');
  const successBox = document.getElementById('formSuccess');
  const totalSteps = steps.length;
  let current = 1;

  function validateStep(n) {
    const required = form.querySelectorAll(`[data-step-field="${n}"][required]`);
    let ok = true;
    required.forEach((field) => {
      if (field.type === 'radio') {
        const group = form.querySelectorAll(`[name="${field.name}"]`);
        const checked = Array.from(group).some((r) => r.checked);
        if (!checked) {
          ok = false;
          group.forEach((r) => r.closest('.vibe-card, .color-swatch')?.classList.add('error'));
        } else {
          group.forEach((r) => r.closest('.vibe-card, .color-swatch')?.classList.remove('error'));
        }
      } else if (!field.value.trim()) {
        ok = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    if (!ok) {
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
    }
    return ok;
  }

  function goToStep(n, skipValidate = false) {
    if (n > current && !skipValidate && !validateStep(current)) return;
    current = Math.max(1, Math.min(totalSteps, n));

    steps.forEach((s) => {
      const sn = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', sn === current);
    });
    dots.forEach((d) => {
      const sn = parseInt(d.dataset.step, 10);
      d.classList.toggle('active', sn <= current);
      d.classList.toggle('current', sn === current);
    });

    progressFill.style.width = ((current - 1) / (totalSteps - 1)) * 100 + '%';

    prevBtn.disabled = current === 1;
    if (current === totalSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = '';
    } else {
      nextBtn.style.display = '';
      submitBtn.style.display = 'none';
    }

    // Focus the first field of the new step — but ONLY on desktop.
    // On mobile, focusing a field opens the keyboard, which resizes the viewport
    // and reads as an unexpected "scroll up" jump. Let the user tap when ready.
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) {
      setTimeout(() => {
        const firstInput = steps[current - 1].querySelector('input:not([type=radio]):not([type=hidden]), textarea, select');
        if (firstInput) firstInput.focus({ preventScroll: true });
      }, 350);
    }
  }

  nextBtn.addEventListener('click', () => goToStep(current + 1));
  prevBtn.addEventListener('click', () => goToStep(current - 1, true));

  // Enter key advances (unless in textarea)
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      if (current < totalSteps) {
        e.preventDefault();
        goToStep(current + 1);
      }
    }
  });

  // Live ROI calculator
  const avgInput = document.getElementById('avgCustomerValue');
  const cpmInput = document.getElementById('customersPerMonth');
  const roiText = document.getElementById('roiText');
  const roiBox = document.getElementById('roiBox');

  function updateROI() {
    const avg = parseFloat(avgInput.value) || 0;
    if (avg <= 0) {
      roiBox.classList.remove('active');
      roiText.innerHTML = 'enter your numbers above and watch the magic →';
      return;
    }
    roiBox.classList.add('active');

    const setupCost = 400;
    const monthlyCost = 39;
    const clientsForSetup = Math.max(1, Math.ceil(setupCost / avg));
    const clientsForMonthly = Math.max(1, Math.ceil(monthlyCost / avg));

    let html = `if your new site brings in just <strong>${clientsForSetup} new customer${clientsForSetup > 1 ? 's' : ''}</strong>, it pays for itself. `;
    html += `<strong>${clientsForMonthly} customer${clientsForMonthly > 1 ? 's' : ''} a month</strong> covers hosting forever.`;

    const cpm = parseFloat(cpmInput.value) || 0;
    if (cpm > 0) {
      const newCustomers = Math.max(1, Math.round(cpm * 0.1));
      const extraRevenue = newCustomers * avg;
      html += `<br/><br/>and here's the fun part: if your site brings you just <strong>10% more customers</strong>, that's <strong>${newCustomers} extra ${newCustomers > 1 ? 'people' : 'person'} a month</strong>. at $${avg.toLocaleString()} each, that's an extra <strong>$${extraRevenue.toLocaleString()}/mo</strong> in your pocket.`;
    }
    roiText.innerHTML = html;
  }

  if (avgInput) avgInput.addEventListener('input', updateROI);
  if (cpmInput) cpmInput.addEventListener('input', updateROI);

  // Vibe/color card clicks animate
  form.querySelectorAll('.vibe-card input, .color-swatch input').forEach((input) => {
    input.addEventListener('change', () => {
      const parent = input.closest('.vibe-card, .color-swatch');
      parent.classList.remove('pop');
      void parent.offsetWidth;
      parent.classList.add('pop');
    });
  });

  // Submit via fetch so we can show a success state without leaving the page
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(current)) return;

    const formData = new FormData(form);
    const body = new URLSearchParams();
    formData.forEach((v, k) => body.append(k, v));

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'launching...';

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      form.style.display = 'none';
      successBox.classList.add('visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'send it →';
      alert('something went wrong — please try again or email us directly.');
    }
  });

  // init
  goToStep(1, true);
})();

