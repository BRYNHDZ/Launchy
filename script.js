/* ============================================
   LAUNCHY — ink star field & space animations
   hand-drawn cosmos on paper
   ============================================ */

// --- Ink Space Canvas ---
// Multiple parallax layers of ink dots, constellations, and shooting stars
(function initSpace() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let w, h;
  let layers = [];         // parallax star layers
  let constellations = [];
  let shootingStars = [];
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight * 3; // tall canvas for scroll
    canvas.style.height = '100vh';
    seed();
  }

  function seed() {
    layers = [];
    constellations = [];

    // 3 parallax layers — back (slow, small), mid, front (fast, bigger dots)
    const layerConfigs = [
      { count: 180, sizeMin: 0.3, sizeMax: 1, opacityMin: 0.03, opacityMax: 0.07, speed: 0.1 },
      { count: 80,  sizeMin: 0.6, sizeMax: 1.8, opacityMin: 0.05, opacityMax: 0.12, speed: 0.25 },
      { count: 30,  sizeMin: 1.2, sizeMax: 3.5, opacityMin: 0.06, opacityMax: 0.15, speed: 0.45 },
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
    time += 0.008;
    ctx.clearRect(0, 0, w, h);

    const viewH = window.innerHeight;
    const scrollOffset = scrollY;

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

      for (const s of layers === layer ? layer.stars : layer.stars) {
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

  // Track scroll
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  resize();
  draw();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
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

// --- Navbar scroll ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

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
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

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

// --- Parallax on scroll for decorative elements ---
window.addEventListener('scroll', () => {
  const sy = window.scrollY;

  // Ink splatters drift
  document.querySelectorAll('.ink-splatter').forEach((el, i) => {
    const speed = 0.03 + i * 0.015;
    el.style.transform = `translateY(${sy * speed}px)`;
  });

  // Orbit rings respond to scroll
  document.querySelectorAll('.orbit').forEach((el, i) => {
    const skew = Math.sin(sy * 0.001 + i) * 2;
    el.style.transform = `rotate(${sy * (i === 0 ? 0.02 : -0.015)}deg) skew(${skew}deg)`;
  });

  // Ink smudges drift with scroll (subtle parallax)
  document.querySelectorAll('.ink-smudge').forEach((el, i) => {
    const speed = 0.01 + (i % 3) * 0.008;
    const dir = i % 2 === 0 ? 1 : -1;
    el.style.marginTop = `${sy * speed * dir}px`;
  });
});

// --- Countdown timer to April 30, 2026 ---
(function initCountdown() {
  const deadline = new Date('2026-04-30T23:59:59').getTime();
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  function pad(n) { return n < 10 ? '0' + n : n; }

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, deadline - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent = pad(mins);
    secsEl.textContent = pad(secs);

    if (diff > 0) requestAnimationFrame(tick);
  }

  tick();
})();
