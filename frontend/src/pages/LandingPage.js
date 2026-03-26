import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
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

    return () => observerRef.current?.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const styles = {
    root: {
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
      background: "#0a0b0f",
      color: "#e8eaf0",
      minHeight: "100vh",
      overflowX: "hidden",
    },

    /* NAV */
    nav: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "14px 16px" : "18px 60px",
      background: scrollY > 40 ? "rgba(10,11,15,0.92)" : "transparent",
      backdropFilter: scrollY > 40 ? "blur(14px)" : "none",
      borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease",
    },
    navLogo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontWeight: 700,
      fontSize: isMobile ? 18 : 22,
      color: "#fff",
      textDecoration: "none",
      zIndex: 102,
    },
    logoIcon: {
      width: isMobile ? 30 : 36,
      height: isMobile ? 30 : 36,
      borderRadius: 10,
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? 15 : 18,
      flexShrink: 0,
    },
    navLinks: {
      display: isMobile ? "none" : "flex",
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
      padding: isMobile ? "12px 16px" : "10px 22px",
      fontSize: isMobile ? 14 : 15,
      fontWeight: 600,
      cursor: "pointer",
      transition: "opacity 0.2s, transform 0.2s",
      width: isMobile ? "100%" : "auto",
    },
    mobileMenuButton: {
      display: isMobile ? "flex" : "none",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      width: 42,
      height: 42,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      cursor: "pointer",
      zIndex: 102,
    },
    mobileBar: {
      width: 18,
      height: 2,
      background: "#fff",
      borderRadius: 10,
      transition: "all 0.25s ease",
    },
    mobileMenu: {
      position: "fixed",
      top: 68,
      left: 12,
      right: 12,
      background: "rgba(10,11,15,0.98)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: "14px",
      display: isMobile && menuOpen ? "flex" : "none",
      flexDirection: "column",
      gap: 10,
      zIndex: 101,
      boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
      backdropFilter: "blur(14px)",
    },
    mobileMenuLink: {
      color: "#e8eaf0",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: "14px 16px",
      textAlign: "left",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
    },

    /* HERO */
    hero: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: isMobile ? "110px 16px 56px" : "120px 24px 80px",
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
      backgroundSize: isMobile ? "34px 34px" : "60px 60px",
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
      padding: isMobile ? "6px 12px" : "6px 16px",
      fontSize: isMobile ? 11 : 13,
      color: "#a89dff",
      fontWeight: 600,
      marginBottom: isMobile ? 22 : 28,
      animation: "fadeInDown 0.7s ease both",
    },
    heroTitle: {
      fontSize: isMobile ? "clamp(34px, 11vw, 46px)" : "clamp(42px, 7vw, 80px)",
      fontWeight: 800,
      lineHeight: 1.08,
      letterSpacing: "-0.03em",
      marginBottom: isMobile ? 18 : 24,
      animation: "fadeInUp 0.8s ease 0.1s both",
      maxWidth: 900,
    },
    heroGradText: {
      background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    heroSub: {
      fontSize: isMobile ? 15 : "clamp(16px, 2vw, 20px)",
      color: "rgba(232,234,240,0.6)",
      maxWidth: isMobile ? 340 : 560,
      lineHeight: 1.7,
      marginBottom: isMobile ? 30 : 44,
      animation: "fadeInUp 0.8s ease 0.2s both",
    },
    heroButtons: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 14,
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      width: isMobile ? "100%" : "auto",
      maxWidth: isMobile ? 340 : "none",
      animation: "fadeInUp 0.8s ease 0.3s both",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: isMobile ? "15px 18px" : "15px 36px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 8px 32px rgba(108,99,255,0.35)",
      width: isMobile ? "100%" : "auto",
    },
    btnSecondary: {
      background: "rgba(255,255,255,0.06)",
      color: "#e8eaf0",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: isMobile ? "15px 18px" : "15px 36px",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s",
      width: isMobile ? "100%" : "auto",
    },
    heroStats: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, auto)",
      gap: isMobile ? 18 : 48,
      justifyContent: "center",
      marginTop: isMobile ? 40 : 72,
      animation: "fadeInUp 0.8s ease 0.4s both",
      width: isMobile ? "100%" : "auto",
      maxWidth: isMobile ? 340 : "none",
    },
    statItem: {
      textAlign: "center",
      background: isMobile ? "rgba(255,255,255,0.03)" : "transparent",
      border: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
      borderRadius: isMobile ? 16 : 0,
      padding: isMobile ? "16px 14px" : 0,
    },
    statNum: {
      fontSize: isMobile ? 24 : 32,
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

    /* SECTIONS */
    section: {
      padding: isMobile ? "70px 16px" : "100px 24px",
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
      fontSize: isMobile ? "clamp(24px, 8vw, 34px)" : "clamp(28px, 4vw, 44px)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: 16,
      lineHeight: 1.2,
    },
    sectionSub: {
      fontSize: isMobile ? 15 : 17,
      color: "rgba(232,234,240,0.55)",
      maxWidth: 520,
      lineHeight: 1.7,
      marginBottom: isMobile ? 34 : 64,
    },

    /* FEATURES */
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(300px, 1fr))",
      gap: isMobile ? 16 : 20,
    },
    featureCard: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: isMobile ? "24px 18px" : "32px",
      transition: "transform 0.3s, border-color 0.3s",
      cursor: "default",
    },
    featureIcon: {
      width: isMobile ? 46 : 52,
      height: isMobile ? 46 : 52,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: isMobile ? 22 : 24,
      marginBottom: 20,
    },
    featureTitle: {
      fontSize: isMobile ? 17 : 18,
      fontWeight: 700,
      marginBottom: 10,
    },
    featureDesc: {
      fontSize: 15,
      color: "rgba(232,234,240,0.55)",
      lineHeight: 1.65,
    },

    /* HOW IT WORKS */
    stepsWrap: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(260px, 1fr))",
      gap: isMobile ? 16 : 24,
      position: "relative",
    },
    stepCard: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: isMobile ? "24px 18px" : "36px 28px",
      position: "relative",
      overflow: "hidden",
    },
    stepNum: {
      fontSize: isMobile ? 54 : 72,
      fontWeight: 900,
      position: "absolute",
      top: isMobile ? 0 : -10,
      right: 16,
      color: "rgba(108,99,255,0.08)",
      lineHeight: 1,
      pointerEvents: "none",
      fontFamily: "monospace",
    },
    stepIcon: {
      fontSize: isMobile ? 28 : 32,
      marginBottom: 16,
    },
    stepTitle: {
      fontSize: isMobile ? 17 : 18,
      fontWeight: 700,
      marginBottom: 10,
    },
    stepDesc: {
      fontSize: 15,
      color: "rgba(232,234,240,0.55)",
      lineHeight: 1.65,
    },

    /* CTA */
    ctaWrap: {
      background:
        "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(72,198,239,0.1) 100%)",
      border: "1px solid rgba(108,99,255,0.2)",
      borderRadius: isMobile ? 22 : 28,
      padding: isMobile ? "38px 18px" : "72px 48px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      margin: isMobile ? "0 16px 70px" : "0 24px 100px",
    },
    ctaGlow: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: isMobile ? 280 : 500,
      height: isMobile ? 180 : 300,
      background:
        "radial-gradient(ellipse, rgba(108,99,255,0.2) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    ctaTitle: {
      fontSize: isMobile ? "clamp(24px, 8vw, 34px)" : "clamp(28px, 4vw, 44px)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: 16,
      position: "relative",
    },
    ctaSub: {
      fontSize: isMobile ? 15 : 17,
      color: "rgba(232,234,240,0.6)",
      marginBottom: 28,
      position: "relative",
      lineHeight: 1.7,
    },
    ctaButtons: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 14,
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      position: "relative",
      width: isMobile ? "100%" : "auto",
    },

    /* FOOTER */
    footer: {
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: isMobile ? "24px 16px 34px" : "32px 60px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: isMobile ? 14 : 16,
      textAlign: "center",
    },
    footerText: {
      fontSize: 14,
      color: "rgba(232,234,240,0.35)",
    },
    footerLinks: {
      display: "flex",
      gap: isMobile ? 12 : 24,
      flexWrap: "wrap",
      justifyContent: "center",
    },

    /* ANIMATE */
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
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(108,99,255,0.45) !important;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.1) !important;
        }

        .nav-link:hover {
          color: #fff !important;
        }

        .nav-cta:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(108,99,255,0.3) !important;
        }
      `}</style>

      <div style={styles.root}>
        <nav style={styles.nav}>
          <div style={styles.navLogo}>
            <div style={styles.logoIcon}>✦</div>
            StudyAI
          </div>

          {!isMobile && (
            <div style={styles.navLinks}>
              <button
                className="nav-link"
                style={styles.navLink}
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Features
              </button>
              <button
                className="nav-link"
                style={styles.navLink}
                onClick={() =>
                  document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
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
          )}

          {isMobile && (
            <button
              aria-label="Toggle menu"
              style={styles.mobileMenuButton}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span
                style={{
                  ...styles.mobileBar,
                  transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                style={{
                  ...styles.mobileBar,
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  ...styles.mobileBar,
                  transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          )}
        </nav>

        <div style={styles.mobileMenu}>
          <button
            style={styles.mobileMenuLink}
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              closeMenu();
            }}
          >
            Features
          </button>
          <button
            style={styles.mobileMenuLink}
            onClick={() => {
              document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
              closeMenu();
            }}
          >
            How it works
          </button>
          <button
            style={styles.mobileMenuLink}
            onClick={() => {
              navigate("/login");
              closeMenu();
            }}
          >
            Sign in
          </button>
          <button
            className="nav-cta"
            style={styles.navCta}
            onClick={() => {
              navigate("/register");
              closeMenu();
            }}
          >
            Get started free
          </button>
        </div>

        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.heroGrid} />
          <div style={styles.badge}>✦ AI-Powered Learning Platform</div>

          <h1 style={styles.heroTitle}>
            Study Smarter, <span style={styles.heroGradText}>Not Harder</span>
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

        <div id="features">
          <div style={styles.section}>
            <div id="feat-header" data-animate style={animStyle("feat-header")}>
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
                  <div style={{ ...styles.featureIcon, background: f.color }}>
                    {f.icon}
                  </div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

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

        <div
          id="cta-section"
          data-animate
          style={{ ...styles.ctaWrap, ...animStyle("cta-section") }}
        >
          <div style={styles.ctaGlow} />
          <h2 style={styles.ctaTitle}>
            Ready to transform <span style={styles.heroGradText}>how you study?</span>
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

        <footer style={styles.footer}>
          <div style={{ ...styles.navLogo, fontSize: isMobile ? 17 : 18 }}>
            <div
              style={{
                ...styles.logoIcon,
                width: isMobile ? 26 : 28,
                height: isMobile ? 26 : 28,
                fontSize: isMobile ? 13 : 14,
              }}
            >
              ✦
            </div>
            StudyAI
          </div>

          <div style={styles.footerText}>© 2026 StudyAI. Learn Smarter.</div>

          <div style={styles.footerLinks}>
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