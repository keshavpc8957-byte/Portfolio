/* ============================================================
   GLOBAL STATE
============================================================ */
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;
const trailPoints = [];

/* ============================================================
   PAGE LOADER
============================================================ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.body.style.overflow = '';
  }, 1800);
  document.body.style.overflow = 'hidden';
});

/* ============================================================
   CUSTOM CURSOR
============================================================ */
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
const trailCanvas = document.getElementById('cursor-trail');
const tCtx = trailCanvas.getContext('2d');
trailCanvas.width = window.innerWidth;
trailCanvas.height = window.innerHeight;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  trailPoints.push({ x: mouseX, y: mouseY, life: 1 });
  if (trailPoints.length > 30) trailPoints.shift();
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';

  // Trail
  tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  for (let i = 0; i < trailPoints.length; i++) {
    const p = trailPoints[i];
    p.life -= 0.04;
    if (p.life <= 0) continue;
    tCtx.beginPath();
    tCtx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
    tCtx.fillStyle = `rgba(0,212,255,${p.life * 0.4})`;
    tCtx.fill();
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a,button,.btn,.project-card,.filter-btn,.service-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(1.5)';
    cursor.style.background = 'rgba(0,212,255,0.3)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursorRing.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.background = 'var(--neon-cyan)';
  });
});

window.addEventListener('resize', () => {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
});

/* ============================================================
   THREE.JS HERO SCENE
============================================================ */
(function initThree() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Torus knot
  const torusGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true, opacity: 0.25
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(3.5, 0, -2);
  scene.add(torus);

  // Icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(0.8, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x7b2ff7, wireframe: true, transparent: true, opacity: 0.3 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-3.5, 1, -1);
  scene.add(ico);

  // Ring
  const ringGeo = new THREE.TorusGeometry(1, 0.04, 8, 60);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.position.set(-2, -1.5, 0);
  ring1.rotation.x = 1;
  scene.add(ring1);

  // Point cloud
  const pts = [];
  for (let i = 0; i < 600; i++) {
    pts.push((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const ptMat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.04, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(ptGeo, ptMat));

  let targetRotX = 0, targetRotY = 0;
  document.getElementById('hero').addEventListener('mousemove', e => {
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.4;
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.4;
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    torus.rotation.x += 0.005; torus.rotation.y += 0.007;
    ico.rotation.x += 0.008; ico.rotation.z += 0.006;
    ring1.rotation.z += 0.01;
    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRotY - camera.rotation.y) * 0.05;
    scene.position.y = Math.sin(t * 0.5) * 0.15;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================
   PARTICLES CANVAS
============================================================ */
(function initParticles() {
  const c = document.getElementById('particles-canvas');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;

  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    o: Math.random() * 0.5 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${p.o})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
      if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
    });
    // Lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.06 * (1 - d / 100)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => { c.width = window.innerWidth; c.height = window.innerHeight; });
})();

/* ============================================================
   TYPING EFFECT
============================================================ */
const typingRoles = ['Full-Stack Developer', 'UI/UX Designer', 'WebGL Architect', '3D Experience Creator', 'Open Source Contributor'];
let tIdx = 0, cIdx = 0, deleting = false;
const typedEl = document.getElementById('typed-text');

function type() {
  const word = typingRoles[tIdx];
  if (!deleting) {
    typedEl.textContent = word.slice(0, ++cIdx);
    if (cIdx === word.length) { deleting = true; setTimeout(type, 1800); return; }
  } else {
    typedEl.textContent = word.slice(0, --cIdx);
    if (cIdx === 0) { deleting = false; tIdx = (tIdx + 1) % typingRoles.length; }
  }
  setTimeout(type, deleting ? 60 : 100);
}
setTimeout(type, 2800);

/* ============================================================
   NAVBAR
============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
  // Back to top
  document.getElementById('back-top').classList.toggle('visible', window.scrollY > 400);
  // Progress bar
  const prog = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('scroll-progress').style.width = prog + '%';
});

// Hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('active');
});
function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('active'); }

/* ============================================================
   SCROLL REVEAL (IntersectionObserver)
============================================================ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Animate skill bars
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Also observe skill bars globally
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

/* ============================================================
   COUNTER ANIMATION
============================================================ */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.counter').forEach(c => {
      const target = +c.dataset.target;
      let start = 0;
      const dur = 1800;
      const step = timestamp => {
        if (!start) start = timestamp;
        const prog = Math.min((timestamp - start) / dur, 1);
        c.textContent = Math.floor(prog * target * (1 - Math.pow(1 - prog, 3)));
        if (prog < 1) requestAnimationFrame(step);
        else c.textContent = target;
      };
      requestAnimationFrame(step);
    });
    counterObs.unobserve(e.target);
  });
}, { threshold: 0.3 });
document.querySelectorAll('#about, #stats').forEach(s => counterObs.observe(s));

/* ============================================================
   PROJECTS DATA & GRID
============================================================ */
const projectsData = [
  { id:1, cat:'web', title:'HyperDash Analytics', desc:'Real-time analytics platform processing 1M+ events/day with stunning data visualizations.', tags:['React','Node.js','D3.js','Redis'], emoji:'\u{1F4CA}', color:'#00d4ff' },
  { id:2, cat:'ai', title:'NeuralCanvas', desc:'AI-powered generative art platform that creates unique digital artworks from text prompts.', tags:['Python','TensorFlow','React','AWS'], emoji:'\u{1F916}', color:'#7b2ff7' },
  { id:3, cat:'3d', title:'VoidScape Explorer', desc:'Immersive WebGL space exploration experience with procedurally generated galaxies.', tags:['Three.js','GLSL','WebGL','GSAP'], emoji:'\u{1F30C}', color:'#00ffff' },
  { id:4, cat:'mobile', title:'Zenith Finance', desc:'Cross-platform fintech app managing $50M+ in transactions with biometric security.', tags:['React Native','Node.js','Plaid','Stripe'], emoji:'\u{1F4B0}', color:'#00d4ff' },
  { id:5, cat:'web', title:'QuantumCMS', desc:'Headless CMS with AI-assisted content generation and multi-language support for enterprise.', tags:['Next.js','PostgreSQL','GraphQL','GCP'], emoji:'\u{1F4DD}', color:'#7b2ff7' },
  { id:6, cat:'3d', title:'Hologram UI Kit', desc:'Open-source 3D UI component library for React with holographic and glassmorphism effects.', tags:['React','CSS','Three.js','TypeScript'], emoji:'\u{1F4A0}', color:'#00ffff' },
];

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  const filtered = filter === 'all' ? projectsData : projectsData.filter(p => p.cat === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="project-card reveal" onclick="openModal(${p.id})" data-cat="${p.cat}">
      <div class="project-thumb" style="background:linear-gradient(135deg,rgba(${hexToRgb(p.color)},0.12),rgba(123,47,247,0.12))">
        <div class="project-thumb-emoji">${p.emoji}</div>
        <div class="project-thumb-overlay">
          <a href="mailto:keshavpc8957@gmail.com" class="btn btn-primary" style="font-size:0.65rem;padding:10px 18px" onclick="event.stopPropagation()">Live Demo</a>
          <a href="#" class="btn btn-secondary" style="font-size:0.65rem;padding:10px 18px" onclick="event.stopPropagation()">GitHub</a>
        </div>
      </div>
      <div class="project-body">
        <div class="project-cat">${p.cat.toUpperCase()}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.desc}</div>
        <div class="project-tags">${p.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
  // Re-observe new cards
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  setTimeout(() => grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 100);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

renderProjects();

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.filter);
  });
});

// Modal
function openModal(id) {
  const p = projectsData.find(x => x.id === id);
  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:3.5rem;margin-bottom:16px;filter:drop-shadow(0 0 20px rgba(0,212,255,0.5))">${p.emoji}</div>
    <div style="font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.2em;color:var(--neon-purple);text-transform:uppercase;margin-bottom:8px">${p.cat}</div>
    <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:900;color:#fff;margin-bottom:16px">${p.title}</h2>
    <p style="color:var(--text-muted);line-height:1.7;margin-bottom:24px">${p.desc}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:32px">${p.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>
    <div style="display:flex;gap:12px">
      <a href="mailto:keshavpc8957@gmail.com" class="btn btn-primary" style="font-size:0.72rem">&rarr; Live Demo</a>
      <a href="#" class="btn btn-secondary" style="font-size:0.72rem">&lt;/&gt; View Code</a>
    </div>
  `;
  document.getElementById('project-modal').classList.add('active');
}
document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('project-modal').classList.remove('active');
});
document.getElementById('project-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('project-modal'))
    document.getElementById('project-modal').classList.remove('active');
});

/* ============================================================
   STATS CHART
============================================================ */
const chartObs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  chartObs.disconnect();
  const ctx = document.getElementById('statsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: 'Projects Delivered',
        data: [3,5,4,7,6,8,5,9,7,10,8,12],
        backgroundColor: 'rgba(0,212,255,0.15)',
        borderColor: '#00d4ff',
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(0,212,255,0.05)' }, ticks: { color: '#5a8fa8', font: { family: 'JetBrains Mono' } } },
        y: { grid: { color: 'rgba(0,212,255,0.05)' }, ticks: { color: '#5a8fa8', font: { family: 'JetBrains Mono' } } }
      }
    }
  });
}, { threshold: 0.3 });
document.getElementById('statsChart') && chartObs.observe(document.getElementById('statsChart').parentElement);

/* ============================================================
   TERMINAL ANIMATION
============================================================ */
const termLines = [
  { cmd: 'whoami', out: '&rarr; Keshav Kumar &mdash; Senior Full-Stack Engineer' },
  { cmd: 'ls skills/', out: '&rarr; react  nodejs  typescript  python  webgl  figma  aws' },
  { cmd: 'git log --oneline -3', out: '&rarr; a1b2c3d feat: ship VoidScape v2.0\n  e4f5g6h fix: neural canvas perf\n  h7i8j9k init: quantum CMS' },
  { cmd: 'echo $STATUS', out: '&rarr; Available for exciting opportunities &#128640;' },
];

const termBody = document.getElementById('terminalBody');
const termCmdEl = document.getElementById('termCmd');
let termIdx = 0, termCharIdx = 0;

function typeTermLine() {
  const line = termLines[termIdx % termLines.length];
  if (termCharIdx < line.cmd.length) {
    termCmdEl.textContent += line.cmd[termCharIdx++];
    setTimeout(typeTermLine, 80);
  } else {
    setTimeout(() => {
      const outDiv = document.createElement('div');
      outDiv.className = 't-output';
      outDiv.innerHTML = line.out.replace(/&rarr;/g, '<span class="t-highlight">&rarr;</span>');
      termBody.insertBefore(outDiv, termBody.lastElementChild.nextSibling);
      const newLine = document.createElement('div');
      newLine.className = 't-line';
      newLine.innerHTML = `<span class="t-prompt">Keshav@portfolio:~$</span><span class="t-cmd" id="termCmd"></span>`;
      termBody.appendChild(newLine);
      termIdx++; termCharIdx = 0;
      const newCmd = document.getElementById('termCmd');
      if (termIdx < termLines.length) {
        setTimeout(() => { termCmdEl.id = ''; typeTermLine2(newCmd, termLines[termIdx]); }, 600);
      }
    }, 300);
  }
}

function typeTermLine2(cmdEl, line) {
  let i = 0;
  function step() {
    if (i < line.cmd.length) {
      cmdEl.textContent += line.cmd[i++];
      setTimeout(step, 80);
    } else {
      setTimeout(() => {
        const outDiv = document.createElement('div');
        outDiv.className = 't-output';
        outDiv.innerHTML = line.out.replace(/&rarr;/g, '<span class="t-highlight">&rarr;</span>');
        termBody.insertBefore(outDiv, cmdEl.parentElement.nextSibling);
        termIdx++;
        if (termIdx < termLines.length) {
          const newLine = document.createElement('div');
          newLine.className = 't-line';
          newLine.innerHTML = `<span class="t-prompt">Keshav@portfolio:~$</span><span class="t-cmd"></span>`;
          termBody.appendChild(newLine);
          const nc = newLine.querySelector('.t-cmd');
          setTimeout(() => typeTermLine2(nc, termLines[termIdx]), 600);
        }
      }, 300);
    }
  }
  step();
}

const termObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { termObs.disconnect(); setTimeout(typeTermLine, 800); }
}, { threshold: 0.3 });
termObs.observe(document.getElementById('terminal-section'));

/* ============================================================
   TESTIMONIALS
============================================================ */
const testimonials = [
  { name:'Sarah Chen', role:'CTO, DataStream Inc.', init:'SC', text:'Alex delivered beyond expectations. The WebGL dashboard he built reduced our load time by 60% while looking absolutely stunning. Pure engineering artistry.' },
  { name:'Marcus Webb', role:'Product Manager, Nexora', init:'MW', text:'Working with Alex was transformative. He doesn\'t just write code - he crafts experiences. Our conversion rate jumped 40% after his redesign.' },
  { name:'Priya Nair', role:'Founder, PixelFlow', init:'PN', text:'Exceptional technical depth combined with a designer\'s eye. The 3D product showcase he built for us became our best marketing asset.' },
  { name:'Jake Torres', role:'Lead Engineer, Synth Labs', init:'JT', text:'Alex\'s performance optimization work saved us $80k/month in infra costs. His knowledge of modern web architecture is second to none.' },
  { name:'Amelia Ross', role:'Director, CreativeForge', init:'AR', text:'From concept to deployment in 3 weeks. Alex\'s speed without sacrificing quality is remarkable. The interactive installation he built went viral.' },
];

const tInner = document.getElementById('testimonialInner');
const allTestimonials = [...testimonials, ...testimonials]; // Doubled for infinite loop
tInner.innerHTML = allTestimonials.map(t => `
  <div class="testimonial-card">
    <div class="test-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    <div class="test-text">"${t.text}"</div>
    <div class="test-author">
      <div class="test-avatar">${t.init}</div>
      <div><div class="test-name">${t.name}</div><div class="test-role">${t.role}</div></div>
    </div>
  </div>
`).join('');

/* ============================================================
   CONTACT FORM
============================================================ */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = e.target[0].value;
  const email = e.target[1].value;
  const subject = e.target[2].value || 'Portfolio Contact';
  const msg = e.target[3].value;
  const mailtoLink = `mailto:keshavpc8957@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`)}`;
  window.location.href = mailtoLink;
});

/* ============================================================
   MUSIC TOGGLE (Web Audio API ambient tone)
============================================================ */
let audioCtx = null, oscillator = null, gainNode = null;
let isPlaying = false;
document.getElementById('music-btn').addEventListener('click', () => {
  const btn = document.getElementById('music-btn');
  if (!isPlaying) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.04;
      gainNode.connect(audioCtx.destination);
      // Pad-like ambient chord
      [110, 165, 220, 330].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        g.gain.value = [0.3, 0.2, 0.15, 0.1][i];
        osc.connect(g); g.connect(gainNode);
        osc.start();
      });
    } else {
      gainNode.gain.setTargetAtTime(0.04, audioCtx.currentTime, 0.5);
    }
    btn.innerHTML = '&#9835;'; btn.classList.add('playing');
    isPlaying = true;
  } else {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
    btn.innerHTML = '&#9834;'; btn.classList.remove('playing');
    isPlaying = false;
  }
});

/* ============================================================
   EASTER EGG - Konami Code
============================================================ */
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.key === konami[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konami.length) {
      document.getElementById('easter-egg').classList.add('show');
      konamiIdx = 0;
    }
  } else { konamiIdx = 0; }
});

/* ============================================================
   FOOTER YEAR
============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============================================================
   GSAP SCROLL ANIMATIONS
============================================================ */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Hero name tilt on mouse
document.getElementById('hero').addEventListener('mousemove', e => {
  const name = document.getElementById('heroName');
  const rx = (e.clientY / window.innerHeight - 0.5) * 15;
  const ry = (e.clientX / window.innerWidth - 0.5) * 15;
  name.style.transform = `perspective(600px) rotateX(${-rx}deg) rotateY(${ry}deg)`;
});
document.getElementById('hero').addEventListener('mouseleave', () => {
  document.getElementById('heroName').style.transform = '';
});

// Smooth nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      gsap.to(window, { duration: 1.2, scrollTo: { y: target, offsetY: 70 }, ease: 'power3.inOut' });
    }
  });
});

// GSAP section entrance
gsap.utils.toArray('.section-title').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 85%' },
    opacity: 0, y: 40, duration: 1, ease: 'power3.out'
  });
});
