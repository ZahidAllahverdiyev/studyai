import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current.observe(el);
    });
    return () => observerRef.current.disconnect();
  }, []);

  const styles = {
    root: {
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
      background: "#0a0b0f",
      color: "#e8eaf0",
      minHeight: "100vh",
      overflowX: "hidden",
    },

    /* ── NAV ── */
    nav: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 60px",
      background:
        scrollY > 40
          ? "rgba(10,11,15,0.92)"
          : "transparent",
      backdropFilter: scrollY > 40 ? "blur(14px)" : "none",
      borderBottom:
        scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease",
    },
    navLogo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontWeight: 700,
      fontSize: 22,
      color: "#fff",
      textDecoration: "none",
    },
    logoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
    },
    navLinks: {
      display: "flex",
      gap: 32,
      alignItems: "center",
    },
    navLink: {
      color: "rgba(232,234,240,0.7)",
      textDecoration: "none",
      fontSize: 15,
      fontWeight: 500,
      transition: "color 0.2s",
      cursor: "pointer",
      background: "none",
      border: "none",
    },
    navCta: {
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "10px 22px",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      transition: "opacity 0.2s, transform 0.2s",
    },

    /* ── HERO ── */
    hero: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "120px 24px 80px",
      position: "relative",
    },
    heroBg: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(108,99,255,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(72,198,239,0.1) 0%, transparent 60%)",
      pointerEvents: "none",
    },
    heroGrid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
      pointerEvents: "none",
      maskImage:
        "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(108,99,255,0.15)",
      border: "1px solid rgba(108,99,255,0.35)",
      borderRadius: 99,
      padding: "6px 16px",
      fontSize: 13,
      color: "#a89dff",
      fontWeight: 600,
      marginBottom: 28,
      animation: "fadeInDown 0.7s ease both",
    },
    heroTitle: {
      fontSize: "clamp(42px, 7vw, 80px)",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.03em",
      marginBottom: 24,
      animation: "fadeInUp 0.8s ease 0.1s both",
    },
    heroGradText: {
      background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    heroSub: {
      fontSize: "clamp(16px, 2vw, 20px)",
      color: "rgba(232,234,240,0.6)",
      maxWidth: 560,
      lineHeight: 1.7,
      marginBottom: 44,
      animation: "fadeInUp 0.8s ease 0.2s both",
    },
    heroButtons: {
      display: "flex",
      gap: 14,
      justifyContent: "center",
      flexWrap: "wrap",
      animation: "fadeInUp 0.8s ease 0.3s both",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "15px 36px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 8px 32px rgba(108,99,255,0.35)",
    },
    btnSecondary: {
      background: "rgba(255,255,255,0.06)",
      color: "#e8eaf0",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "15px 36px",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s",
    },
    heroStats: {
      display: "flex",
      gap: 48,
      justifyContent: "center",
      marginTop: 72,
      animation: "fadeInUp 0.8s ease 0.4s both",
      flexWrap: "wrap",
    },
    statItem: {
      textAlign: "center",
    },
    statNum: {
      fontSize: 32,
      fontWeight: 800,
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    statLabel: {
      fontSize: 13,
      color: "rgba(232,234,240,0.45)",
      fontWeight: 500,
      marginTop: 4,
    },

    /* ── SECTIONS ── */
    section: {
      padding: "100px 24px",
      maxWidth: 1100,
      margin: "0 auto",
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#6c63ff",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: "clamp(28px, 4vw, 44px)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: 16,
      lineHeight: 1.2,
    },
    sectionSub: {
      fontSize: 17,
      color: "rgba(232,234,240,0.55)",
      maxWidth: 520,
      lineHeight: 1.7,
      marginBottom: 64,
    },

    /* ── FEATURES ── */
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 20,
    },
    featureCard: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: "32px",
      transition: "transform 0.3s, border-color 0.3s",
      cursor: "default",
    },
    featureIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24,
      marginBottom: 20,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 10,
    },
    featureDesc: {
      fontSize: 15,
      color: "rgba(232,234,240,0.55)",
      lineHeight: 1.65,
    },

    /* ── HOW IT WORKS ── */
    stepsWrap: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 24,
      position: "relative",
    },
    stepCard: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: "36px 28px",
      position: "relative",
      overflow: "hidden",
    },
    stepNum: {
      fontSize: 72,
      fontWeight: 900,
      position: "absolute",
      top: -10,
      right: 16,
      color: "rgba(108,99,255,0.08)",
      lineHeight: 1,
      pointerEvents: "none",
      fontFamily: "monospace",
    },
    stepIcon: {
      fontSize: 32,
      marginBottom: 16,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 10,
    },
    stepDesc: {
      fontSize: 15,
      color: "rgba(232,234,240,0.55)",
      lineHeight: 1.65,
    },

    /* ── CTA SECTION ── */
    ctaWrap: {
      background:
        "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(72,198,239,0.1) 100%)",
      border: "1px solid rgba(108,99,255,0.2)",
      borderRadius: 28,
      padding: "72px 48px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      margin: "0 24px 100px",
    },
    ctaGlow: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 500,
      height: 300,
      background:
        "radial-gradient(ellipse, rgba(108,99,255,0.2) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    ctaTitle: {
      fontSize: "clamp(28px, 4vw, 44px)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: 16,
      position: "relative",
    },
    ctaSub: {
      fontSize: 17,
      color: "rgba(232,234,240,0.6)",
      marginBottom: 40,
      position: "relative",
    },
    ctaButtons: {
      display: "flex",
      gap: 14,
      justifyContent: "center",
      flexWrap: "wrap",
      position: "relative",
    },

    /* ── FOOTER ── */
    footer: {
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "32px 60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
    },
    footerText: {
      fontSize: 14,
      color: "rgba(232,234,240,0.35)",
    },

    /* ── ANIMATE ── */
    animateHidden: {
      opacity: 0,
      transform: "translateY(30px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    },
    animateVisible: {
      opacity: 1,
      transform: "translateY(0)",
    },
  };

  const features = [
    {
      icon: "🧠",
      color: "rgba(108,99,255,0.2)",
      title: "AI-Powered Analysis",
      desc: "Upload your lecture notes and our AI instantly extracts key concepts, summaries, and study points.",
    },
    {
      icon: "📝",
      color: "rgba(72,198,239,0.2)",
      title: "Smart Quiz Generation",
      desc: "Automatically generate personalized quizzes based on your uploaded material to test your knowledge.",
    },
    {
      icon: "📊",
      color: "rgba(255,182,72,0.2)",
      title: "Progress Tracking",
      desc: "Track your learning journey with detailed stats on quizzes taken, scores, and improvement over time.",
    },
    {
      icon: "⚡",
      color: "rgba(72,239,128,0.2)",
      title: "Instant Results",
      desc: "Get immediate feedback on your quiz performance with detailed explanations for each answer.",
    },
    {
      icon: "📄",
      color: "rgba(255,99,132,0.2)",
      title: "PDF & DOCX Support",
      desc: "Works with your existing lecture files — just upload and let StudyAI do the heavy lifting.",
    },
    {
      icon: "🌙",
      color: "rgba(168,157,255,0.2)",
      title: "Beautiful Dark UI",
      desc: "Designed for long study sessions with a comfortable dark interface that's easy on the eyes.",
    },
  ];

  const steps = [
    {
      icon: "📤",
      title: "Upload Your Lecture",
      desc: "Drag & drop your PDF or DOCX lecture file. We support files up to 10MB.",
    },
    {
      icon: "🤖",
      title: "AI Analyzes Content",
      desc: "Our AI reads through your material and extracts the most important information.",
    },
    {
      icon: "🎯",
      title: "Take Quizzes & Learn",
      desc: "Answer AI-generated questions, track your score, and master your subject.",
    },
  ];

  const animStyle = (id) => ({
    ...styles.animateHidden,
    ...(visible[id] ? styles.animateVisible : {}),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(108,99,255,0.45) !important; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1) !important; }
        .nav-link:hover { color: #fff !important; }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(108,99,255,0.3) !important; }
      `}</style>

      <div style={styles.root}>
        {/* NAV */}
        <nav style={styles.nav}>
          <div style={styles.navLogo}>
            <div style={styles.logoIcon}>✦</div>
            StudyAI
          </div>
          <div style={styles.navLinks}>
            <button
              className="nav-link"
              style={styles.navLink}
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Features
            </button>
            <button
              className="nav-link"
              style={styles.navLink}
              onClick={() =>
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How it works
            </button>
            <button
              className="nav-link"
              style={styles.navLink}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
            <button
              className="nav-cta"
              style={styles.navCta}
              onClick={() => navigate("/register")}
            >
              Get started free
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.heroGrid} />
          <div style={styles.badge}>✦ AI-Powered Learning Platform</div>
          <h1 style={styles.heroTitle}>
            Study Smarter,{" "}
            <span style={styles.heroGradText}>Not Harder</span>
          </h1>
          <p style={styles.heroSub}>
            Upload your lecture notes and let AI generate personalized quizzes,
            track your progress, and help you ace every exam.
          </p>
          <div style={styles.heroButtons}>
            <button
              className="btn-primary"
              style={styles.btnPrimary}
              onClick={() => navigate("/register")}
            >
              Start for free →
            </button>
            <button
              className="btn-secondary"
              style={styles.btnSecondary}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
          <div style={styles.heroStats}>
            {[
              ["PDF & DOCX", "Supported"],
              ["AI Generated", "Quizzes"],
              ["Real-time", "Progress"],
            ].map(([num, label]) => (
              <div key={label} style={styles.statItem}>
                <div style={styles.statNum}>{num}</div>
                <div style={styles.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <div id="features">
          <div style={styles.section}>
            <div
              id="feat-header"
              data-animate
              style={animStyle("feat-header")}
            >
              <div style={styles.sectionLabel}>Features</div>
              <h2 style={styles.sectionTitle}>
                Everything you need to{" "}
                <span style={styles.heroGradText}>learn effectively</span>
              </h2>
              <p style={styles.sectionSub}>
                StudyAI combines powerful AI analysis with intuitive study tools
                to transform how you learn.
              </p>
            </div>
            <div style={styles.featuresGrid}>
              {features.map((f, i) => (
                <div
                  key={f.title}
                  id={`feat-${i}`}
                  data-animate
                  className="feature-card"
                  style={{
                    ...styles.featureCard,
                    ...animStyle(`feat-${i}`),
                    transitionDelay: `${i * 0.08}s`,
                  }}
                >
                  <div
                    style={{ ...styles.featureIcon, background: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="how">
          <div style={styles.section}>
            <div id="how-header" data-animate style={animStyle("how-header")}>
              <div style={styles.sectionLabel}>How it works</div>
              <h2 style={styles.sectionTitle}>
                Three steps to{" "}
                <span style={styles.heroGradText}>master any subject</span>
              </h2>
              <p style={styles.sectionSub}>
                Getting started takes less than a minute. No setup required.
              </p>
            </div>
            <div style={styles.stepsWrap}>
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  id={`step-${i}`}
                  data-animate
                  style={{
                    ...styles.stepCard,
                    ...animStyle(`step-${i}`),
                    transitionDelay: `${i * 0.12}s`,
                  }}
                >
                  <div style={styles.stepNum}>0{i + 1}</div>
                  <div style={styles.stepIcon}>{s.icon}</div>
                  <div style={styles.stepTitle}>{s.title}</div>
                  <div style={styles.stepDesc}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          id="cta-section"
          data-animate
          style={{ ...styles.ctaWrap, ...animStyle("cta-section") }}
        >
          <div style={styles.ctaGlow} />
          <h2 style={styles.ctaTitle}>
            Ready to transform{" "}
            <span style={styles.heroGradText}>how you study?</span>
          </h2>
          <p style={styles.ctaSub}>
            Join students who are already learning smarter with StudyAI.
          </p>
          <div style={styles.ctaButtons}>
            <button
              className="btn-primary"
              style={styles.btnPrimary}
              onClick={() => navigate("/register")}
            >
              Create free account →
            </button>
            <button
              className="btn-secondary"
              style={styles.btnSecondary}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <div style={{ ...styles.navLogo, fontSize: 18 }}>
            <div style={{ ...styles.logoIcon, width: 28, height: 28, fontSize: 14 }}>
              ✦
            </div>
            StudyAI
          </div>
          <div style={styles.footerText}>
            © 2026 StudyAI. Learn Smarter.
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <button
              className="nav-link"
              style={{ ...styles.navLink, fontSize: 14 }}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
            <button
              className="nav-link"
              style={{ ...styles.navLink, fontSize: 14 }}
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;