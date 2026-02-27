import { useEffect, useRef, useState } from 'react';
import './App.css';

// ─── SVG Download Icon ───────────────────────────────────────────────────────
const DlIcon = ({ size = 13, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ─── Skill Bar ───────────────────────────────────────────────────────────────
function SkillBar({ name, pct, animate }) {
  return (
    <div className="skill-bar-row">
      <div className="skill-bar-header">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: animate ? `${pct}%` : '0%' }} />
      </div>
    </div>
  );
}

// ─── Skill Category ──────────────────────────────────────────────────────────
function SkillCategory({ label, skills, animate }) {
  return (
    <div className="reveal">
      <div className="skill-category-label">{label}</div>
      <div className="skill-bars">
        {skills.map(s => <SkillBar key={s.name} {...s} animate={animate} />)}
      </div>
    </div>
  );
}

// ─── Touch detection helper ──────────────────────────────────────────────────
const isTouchDevice = () =>
  window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0;

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const [scrollPct, setScrollPct] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [skillsAnimate, setSkillsAnimate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTouch] = useState(() => isTouchDevice());

  // Cursor (only on non-touch devices)
  useEffect(() => {
    if (isTouch) return;
    const onMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', onMove);
    let raf;
    const animate = () => {
      const rx = ringPos.current.x + (mousePos.current.x - ringPos.current.x) * 0.12;
      const ry = ringPos.current.y + (mousePos.current.y - ringPos.current.y) * 0.12;
      ringPos.current = { x: rx, y: ry };
      if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px'; }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [isTouch]);

  // Cursor expand on hover targets (only on non-touch)
  useEffect(() => {
    if (isTouch) return;
    const expand = () => {
      if (cursorRef.current) { cursorRef.current.style.width = '20px'; cursorRef.current.style.height = '20px'; }
      if (ringRef.current) { ringRef.current.style.width = '60px'; ringRef.current.style.height = '60px'; }
    };
    const shrink = () => {
      if (cursorRef.current) { cursorRef.current.style.width = '12px'; cursorRef.current.style.height = '12px'; }
      if (ringRef.current) { ringRef.current.style.width = '36px'; ringRef.current.style.height = '36px'; }
    };
    const targets = document.querySelectorAll('a, button, .stat-item, .tag, .project-card, .timeline-item, .contact-link-row');
    targets.forEach(el => { el.addEventListener('mouseenter', expand); el.addEventListener('mouseleave', shrink); });
    return () => targets.forEach(el => { el.removeEventListener('mouseenter', expand); el.removeEventListener('mouseleave', shrink); });
  });

  // Scroll effects
  useEffect(() => {
    const onScroll = () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setScrollPct(pct);
      let cur = '';
      document.querySelectorAll('section[id]').forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
      setActiveSection(cur);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('visible'), i * 80);
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
    return () => ro.disconnect();
  });

  // Skills bar animation
  useEffect(() => {
    const skillsEl = document.querySelector('.skills-categories');
    if (!skillsEl) return;
    const bo = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { setSkillsAnimate(true); bo.unobserve(en.target); } });
    }, { threshold: 0.2 });
    bo.observe(skillsEl);
    return () => bo.disconnect();
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  const handleFormSubmit = () => {
    setFormSent(true);
    setTimeout(() => setFormSent(false), 3000);
  };

  const navItems = ['about', 'experience', 'projects', 'skills', 'resume', 'contact'];

  const skillData = [
    { label: 'Frontend', skills: [{ name: 'React / Next.js', pct: 80 }, { name: 'HTML / CSS / JavaScript', pct: 88 }, { name: 'TypeScript', pct: 68 }] },
    { label: 'Backend', skills: [{ name: 'Node.js / Express', pct: 78 }, { name: 'Python / FastAPI', pct: 82 }, { name: 'SQL / PostgreSQL', pct: 74 }] },
    { label: 'AI / ML', skills: [{ name: 'PyTorch / Scikit-learn', pct: 70 }, { name: 'LLM APIs (OpenAI / Anthropic)', pct: 78 }, { name: 'Pandas / NumPy', pct: 75 }] },
    { label: 'Cloud & DevOps', skills: [{ name: 'AWS (EC2, S3, Lambda)', pct: 68 }, { name: 'Docker', pct: 65 }, { name: 'Git / GitHub Actions', pct: 84 }] },
  ];

  const projects = [
    { num: '01 / Featured', featured: true, name: 'CHAT\nAPPLICATION', desc: 'Full-stack chat application with React frontend, Node.js backend, real-time messaging via WebSockets, deployed on Render.com.', stack: ['React', 'Node.js', 'Express', 'Render.com'], link: '#' },
    { num: '02', featured: false, name: 'TO DO\nPLATFORM', desc: 'Full-stack productivity app with user auth, real-time sync, and cloud file storage. Built to practice production deployment with CI/CD.', stack: ['React','Next.js', 'MongoDB','Tailwind CSS'], link: '#' },
    { num: '03', featured: false, name: 'Faculty Management\nSystem', desc: 'Real-time faculty management system with CRUD operations, authentication, and database integration.', stack: ['React', 'Node.js', 'MongoDB', 'Express'], link: '#' },
    { num: '04', featured: false, name: 'Banking management\nSystem using JDBC', desc: 'Banking management system built using JDBC and Java.', stack: ['Java', 'JDBC', 'MySQL'], link: '#' },
  ];

  const tickerItems = ['Full Stack Development', 'Machine Learning', 'Cloud', 'Tech Mahindra Intern', 'Software Engineering', 'API Design', 'Problem Solver', 'Fast Learner'];

  return (
    <>
      <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />

      {/* Custom cursor — only on pointer/mouse devices */}
      {!isTouch && (
        <>
          <div className="cursor" ref={cursorRef} />
          <div className="cursor-ring" ref={ringRef} />
        </>
      )}

      {/* ── NAV ── */}
      <nav>
        <div className="nav-logo">[ HA ]</div>

        {/* Desktop nav links */}
        <ul className="nav-links">
          {navItems.map(id => (
            <li key={id}><a href={`#${id}`} className={activeSection === id ? 'active' : ''}>{id}</a></li>
          ))}
          <li><a href="your-resume.pdf" download className="nav-resume-btn">↓ Resume</a></li>
        </ul>

        {/* Hamburger button — visible on mobile */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <ul>
          {navItems.map(id => (
            <li key={id}>
              <a href={`#${id}`} onClick={handleNavClick}>{id}</a>
            </li>
          ))}
          <li>
            <a href="your-resume.pdf" download className="mobile-resume-btn" onClick={handleNavClick}>
              ↓ Resume
            </a>
          </li>
        </ul>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Open to full-time opportunities</div>
          <h1 className="hero-name">HARUL<br /><span>Arora</span></h1>
          <p className="hero-title">Software Engineer · Full Stack · AI/ML · Cloud</p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">View My Work</a>
            <a href="your-resume.pdf" download className="btn btn-download">
              <DlIcon className="dl-icon" /> Download CV
            </a>
            <a href="#contact" className="btn btn-ghost">Contact Me</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <div className="card-label">// quick profile</div>
            <p className="card-bio">Fresh graduate. Real internship experience at Tech Mahindra. Building full-stack and AI-powered apps — and just getting started.</p>
            <div className="card-tags">
              <span className="tag hot">AI / ML</span>
              <span className="tag hot">Web Dev</span>
              <span className="tag">React</span>
              <span className="tag">Node.js</span>
              <span className="tag">Python</span>
              <span className="tag">JavaScript</span>
              <span className="tag">HTML/CSS</span>
              <span className="tag">SQL</span>
            </div>
          </div>
        </div>
        <div className="hero-bg-text">DEV</div>
      </section>

      {/* ── TICKER ── */}
      <div className="skills-strip">
        <div className="skills-ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span className="ticker-item" key={i}>{item} <span className="ticker-dot" /></span>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-grid">
            <div>
              <div className="section-label">About</div>
              <div className="section-number">01</div>
            </div>
            <div>
              <h2 className="bio-heading reveal">Fresh graduate.<br /><em>Real-world ready.</em></h2>
              <div className="bio-body">
                <p className="reveal"><strong>I'm</strong> a fresh graduate and full-stack developer who believes the best way to learn is to build. With hands-on internship experience at <strong>Tech Mahindra</strong> as a Software Engineer, they've already worked inside real enterprise-scale engineering teams — and they're hungry for what comes next.</p>
                <p className="reveal">Comfortable across the entire stack — crafting clean frontends, designing backend APIs, deploying to the cloud, and integrating AI. They bring the energy of someone who has everything to prove and the skills to back it up.</p>
                <blockquote className="highlight-line reveal">"Zero years of full-time experience. Still the most capable hire in the room."</blockquote>
                <p className="reveal">Their focus sits at the intersection of <strong>AI/ML and cloud-native software</strong> — building systems that are fast, scalable, and intelligent. Always learning. Always shipping.</p>
              </div>
              <div className="stats-grid">
                <div className="stat-item reveal"><div className="stat-number">1</div><div className="stat-label">Internship · Tech Mahindra</div></div>
                <div className="stat-item reveal"><div className="stat-number">5+</div><div className="stat-label">Projects shipped</div></div>
                <div className="stat-item reveal"><div className="stat-number">0</div><div className="stat-label">Days without coding</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section className="experience" id="experience">
        <div className="container">
          <div className="exp-layout">
            <div>
              <div className="section-label">Experience</div>
              <div className="section-number">02</div>
              <h2 className="exp-heading reveal" style={{ marginTop: '1rem' }}>WHERE<br />I'VE<br /><span style={{ color: 'var(--accent)' }}>WORKED</span></h2>
            </div>
            <div>
              <div className="timeline">
                {/* Tech Mahindra */}
                <div className="timeline-item reveal">
                  <div className="timeline-date">2025<br />Training</div>
                  <div className="timeline-content">
                    <div className="tm-badge"><span className="tm-badge-dot" /><span className="tm-badge-text">Tech Mahindra</span></div>
                    <div className="timeline-role">Software Engineer</div>
                    <div className="timeline-company">// Rajpura, Punjab</div>
                    <div className="timeline-type">Software Engineer Intern · feb-2025 to jun-2025</div>
                    <p className="timeline-desc">Contributed to enterprise-grade software development at one of India's leading IT services companies. Worked within a cross-functional agile team — building and maintaining scalable backend services, writing clean testable code, and participating in sprint planning and code reviews. Gained real exposure to production-level deployment workflows, version control best practices, and collaborative engineering at scale.</p>
                    <div className="timeline-tags">
                      {['Java', 'REST APIs', 'SQL', 'Git', 'JDBC', 'Cloud'].map(t => <span className="timeline-tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </div>
                {/* Academic */}
                <div className="timeline-item reveal">
                  <div className="timeline-date">2021-2025<br />Academic</div>
                  <div className="timeline-content">
                    <div className="timeline-role">Academic Projects</div>
                    <div className="timeline-company">// University</div>
                    <div className="timeline-type">Final Year &amp; Coursework · B.Tech / B.E</div>
                    <p className="timeline-desc">Built multiple full-stack and ML projects as part of coursework and personal initiative. Treated every project like a real product — designed architecture, wrote the code, and deployed it. This is where the obsession with building started.</p>
                    <div className="timeline-tags">
                      {['React', 'Python', 'Machine Learning', 'Cloud'].map(t => <span className="timeline-tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className="projects" id="projects">
        <div className="container">
          <div className="projects-header">
            <div>
              <div className="section-label">Projects</div>
              <div className="section-number">03</div>
            </div>
            <div>
              <h2 className="projects-heading reveal">THINGS<br />I'VE<br /><span style={{ color: 'var(--accent)' }}>BUILT</span></h2>
              <p className="projects-subtext reveal">Academic work, side projects, personal experiments. Each one a chance to learn something new and ship something real.</p>
            </div>
          </div>
          <div className="projects-grid">
            {projects.map((p) => (
              <div className={`project-card reveal${p.featured ? ' featured' : ''}`} key={p.num}>
                <div>
                  <div className="project-number">{p.num}</div>
                  <div className="project-name">{p.name.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</div>
                  <p className="project-desc">{p.desc}</p>
                </div>
                <div className="project-footer">
                  <div className="project-stack">{p.stack.map(s => <span className="project-tag" key={s}>{s}</span>)}</div>
                  <a href={p.link} className="project-link">GitHub</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section className="skills" id="skills">
        <div className="container">
          <div className="skills-layout">
            <div>
              <div className="section-label">Skills</div>
              <div className="section-number">04</div>
              <h2 className="skills-heading reveal" style={{ marginTop: '1rem' }}>MY<br />TECH<br /><span style={{ color: 'var(--accent)' }}>STACK</span></h2>
            </div>
            <div className="skills-categories">
              {skillData.map(cat => (
                <SkillCategory key={cat.label} {...cat} animate={skillsAnimate} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESUME ── */}
      <section className="resume-section" id="resume">
        <div className="container">
          <div className="resume-layout">
            <div>
              <div className="section-label">Resume</div>
              <div className="section-number">05</div>
              <h2 className="resume-heading reveal" style={{ marginTop: '1rem' }}>DOWN<br />LOAD<br /><span style={{ color: 'var(--accent)' }}>MY CV</span></h2>
              <p className="reveal" style={{ fontSize: '.95rem', fontWeight: 300, lineHeight: 1.8, color: '#b5b3aa', marginTop: '1.5rem' }}>Everything on one page — internship, projects, skills. The full picture in a format recruiters actually read.</p>
            </div>
            <div>
              <div className="resume-card reveal">
                <div className="resume-card-label">// resume.pdf — ready to download</div>
                <div className="resume-file-row">
                  <div className="resume-file-info">
                    <div className="resume-file-icon"><span>PDF</span></div>
                    <div>
                      <div className="resume-file-name">[YourName]_Resume.pdf</div>
                      <div className="resume-file-meta">Last updated · 2025 · 1 page</div>
                    </div>
                  </div>
                  <a href="your-resume.pdf" download className="resume-dl-btn">
                    <DlIcon /> Download
                  </a>
                </div>
                <div className="resume-highlights">
                  {[
                    'Software Engineer Intern — Tech Mahindra (2024)',
                    'Full Stack · AI/ML · Cloud skills',
                    '4 personal & academic projects',
                    'B.Tech / B.E in Computer Science (update your degree)',
                    'Open to full-time roles & relocations',
                  ].map(item => <div className="resume-highlight-item" key={item}>{item}</div>)}
                </div>
                <a href="your-resume.pdf" download className="resume-big-btn">
                  <DlIcon size={16} className="dl-icon" /> Download Full Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="contact-layout">
            <div>
              <div className="section-label">Contact</div>
              <h2 className="contact-heading reveal">LET'S<br />WORK<br /><span>TOGETHER</span></h2>
              <p className="contact-subtext reveal">Looking for full-time roles, internships, or freelance work. If you need a developer who moves fast and builds things that matter — let's talk.</p>
              <div className="contact-links reveal">
                {[
                  { icon: 'Email', label: 'harularora463@gmail.com', href: 'mailto:harularora463@gmail.com' },
                  { icon: 'GitHub', label: 'github.com/HarulArora', href: 'https://github.com/HarulArora' },
                  { icon: 'LinkedIn', label: 'linkedin.com/in/yourname', href: '#' },
                ].map(link => (
                  <a href={link.href} className="contact-link-row" key={link.icon}>
                    <span className="contact-link-icon">{link.icon}</span>
                    <span className="contact-link-label">{link.label}</span>
                    <span className="cla">→</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="contact-form reveal">
                <div className="form-row"><label className="form-label">Name</label><input type="text" className="form-input" placeholder="Your name" /></div>
                <div className="form-row"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="your@email.com" /></div>
                <div className="form-row"><label className="form-label">Subject</label><input type="text" className="form-input" placeholder="Job opportunity / Collab / Hello" /></div>
                <div className="form-row"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Tell me about the role or project..." /></div>
                <button className="form-submit" onClick={handleFormSubmit}>
                  {formSent ? 'Message Sent ✓' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <p className="footer-text">© 2025 [Your Name] — Fresher. Builder. Always learning.</p>
        <div className="footer-links">
          <a href="#">GitHub</a>
          <a href="#">LinkedIn</a>
          <a href="your-resume.pdf" download>Resume</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </>
  );
}
