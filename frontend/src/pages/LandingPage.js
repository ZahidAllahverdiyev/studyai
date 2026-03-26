import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const IconUpload = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16V7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M8.5 10.5L12 7L15.5 10.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 16.5C20 18.9853 17.7614 21 15 21H9C6.23858 21 4 18.9853 4 16.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconBrain = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 4.6C7.3 5.1 6 6.9 6 9.1V10.2C4.9 10.7 4.2 11.8 4.2 13C4.2 14.4 5.1 15.5 6.4 15.8C6.8 17.9 8.7 19.5 11 19.5H13.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M14.5 4.5C16.7 5 18 6.8 18 9V10.1C19.1 10.6 19.8 11.7 19.8 12.9C19.8 14.3 18.9 15.4 17.6 15.7C17.2 17.8 15.3 19.4 13 19.4H12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M10 10.2C10.5 9.7 11.2 9.4 12 9.4C12.8 9.4 13.5 9.7 14 10.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconQuiz = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 20H17C19.2 20 21 18.2 21 16V8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M3 16V8C3 5.8 4.8 4 7 4H17C19.2 4 21 5.8 21 8V12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M7.8 13.2L9.4 14.8L12.8 11.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
      background: "var(--bg)",
      color: "var(--text)",
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
      fontWeight: 800,
      fontSize: isMobile ? 18 : 22,
      color: "#fff",
      textDecoration: "none",
      zIndex: 102,
      letterSpacing: "-0.02em",
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
      boxShadow: "0 4px 20px rgba(124,111,255,0.35)",
    },
    navLinks: {
      display: isMobile ? "none" : "flex",
      gap: 32,
      alignItems: "center",
    },
    navLink: {
      color: "rgba(232,234,240,0.72)",
      textDecoration: "none",
      fontSize: 15,
      fontWeight: 600,
      transition: "color 0.2s",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: 0,
    },
    navCta: {
      background: "linear-gradient(135deg, #6c63ff, #48c6ef)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: isMobile ? "12px 16px" : "10px 22px",
      fontSize: isMobile ? 14 : 15,
      fontWeight: 700,
      cursor: "pointer",
      transition: "opacity 0.2s, transform 0.2s, box-shadow 0.2s",
      width: isMobile ? "100%" : "auto",
      boxShadow: "0 8px 32px rgba(108,99,255,0.25)",
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
      fontWeight: 650,
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
      padding: isMobile ? "98px 16px 52px" : "104px 24px 64px",
      position: "relative",
    },
    heroBg: {
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 80% 60% at 50% 28%, rgba(108,99,255,0.20) 0%, transparent 68%), radial-gradient(ellipse 55% 42% at 78% 84%, rgba(72,198,239,0.10) 0%, transparent 62%)",
      pointerEvents: "none",
    },
    heroGrid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: isMobile ? "34px 34px" : "60px 60px",
      pointerEvents: "none",
      maskImage: "radial-gradient(ellipse 80% 70% at 50% 52%, black, transparent)",
    },

    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(108,99,255,0.16)",
      border: "1px solid rgba(108,99,255,0.32)",
      borderRadius: 99,
      padding: isMobile ? "6px 12px" : "6px 16px",
      fontSize: isMobile ? 12 : 13,
      color: "#a89dff",
      fontWeight: 700,
      marginBottom: isMobile ? 18 : 24,
      boxShadow: "0 10px 30px rgba(124,111,255,0.10)",
      animation: "fadeInDown 0.7s ease both",
    },

    heroTitle: {
      fontSize: isMobile ? "clamp(34px, 11vw, 46px)" : "clamp(44px, 7vw, 84px)",
      fontWeight: 800,
      lineHeight: 1.02,
      letterSpacing: "-0.05em",
      marginBottom: isMobile ? 14 : 18,
      animation: "fadeInUp 0.85s ease 0.1s both",
      maxWidth: 980,
    },
    heroGradText: {
      background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    heroSub: {
      fontSize: isMobile ? 15 : "clamp(16px, 2vw, 20px)",
      color: "rgba(232,234,240,0.65)",
      maxWidth: isMobile ? 360 : 600,
      lineHeight: 1.75,
      marginBottom: isMobile ? 26 : 34,
      animation: "fadeInUp 0.85s ease 0.2s both",
      letterSpacing: "0.01em",
    },
    heroButtons: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 14,
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      width: isMobile ? "100%" : "auto",
      maxWidth: isMobile ? 360 : "none",
      animation: "fadeInUp 0.85s ease 0.3s both",
    },

    /* SECTIONS */
    section: {
      padding: isMobile ? "58px 16px" : "74px 24px",
      maxWidth: 1100,
      margin: "0 auto",
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#a594ff",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: isMobile ? "clamp(22px, 7vw, 30px)" : "clamp(26px, 4vw, 44px)",
      fontWeight: 850,
      letterSpacing: "-0.03em",
      marginBottom: 14,
      lineHeight: 1.12,
    },
    sectionSub: {
      fontSize: isMobile ? 15 : 16,
      color: "rgba(232,234,240,0.55)",
      maxWidth: 580,
      lineHeight: 1.8,
      marginBottom: isMobile ? 28 : 38,
    },

    /* HOW IT WORKS */
    stepsWrap: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(270px, 1fr))",
      gap: isMobile ? 12 : 18,
      position: "relative",
      alignItems: "stretch",
    },
    stepCard: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 22,
      padding: isMobile ? "18px 16px" : "26px 22px",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s ease, border-color 0.2s ease",
    },
    stepIcon: {
      color: "rgba(168,157,255,0.95)",
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      background: "rgba(124,111,255,0.10)",
      border: "1px solid rgba(124,111,255,0.20)",
      marginBottom: 14,
    },
    stepTitle: {
      fontSize: isMobile ? 16 : 17,
      fontWeight: 800,
      marginBottom: 8,
      letterSpacing: "-0.01em",
    },
    stepDesc: {
      fontSize: isMobile ? 14 : 15,
      color: "rgba(232,234,240,0.58)",
      lineHeight: 1.8,
    },

    /* CTA */
    ctaWrap: {
      background:
        "linear-gradient(135deg, rgba(108,99,255,0.22) 0%, rgba(72,198,239,0.12) 100%)",
      border: "1px solid rgba(108,99,255,0.35)",
      borderRadius: isMobile ? 22 : 28,
      padding: isMobile ? "28px 16px" : "46px 48px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      margin: isMobile ? "0 16px 42px" : "0 24px 62px",
      boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
    },
    ctaOrbs: {
      position: "absolute",
      top: -90,
      left: -70,
      width: 220,
      height: 220,
      background: "radial-gradient(circle, rgba(108,99,255,0.28) 0%, transparent 62%)",
      pointerEvents: "none",
      filter: "blur(0px)",
    },
    ctaOrbs2: {
      position: "absolute",
      bottom: -110,
      right: -90,
      width: 240,
      height: 240,
      background: "radial-gradient(circle, rgba(72,198,239,0.22) 0%, transparent 62%)",
      pointerEvents: "none",
    },
    ctaTitle: {
      fontSize: isMobile ? "clamp(22px, 6.5vw, 34px)" : "clamp(28px, 4.2vw, 46px)",
      fontWeight: 900,
      letterSpacing: "-0.04em",
      marginBottom: 12,
      position: "relative",
    },
    ctaSub: {
      fontSize: isMobile ? 15 : 17,
      color: "rgba(232,234,240,0.68)",
      marginBottom: isMobile ? 20 : 26,
      position: "relative",
      lineHeight: 1.8,
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
      padding: isMobile ? "22px 16px 34px" : "28px 60px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: isMobile ? 14 : 16,
      textAlign: "center",
      background: "linear-gradient(180deg, rgba(255,255,255,0.00), rgba(255,255,255,0.01))",
    },
    footerText: {
      fontSize: 14,
      color: "rgba(232,234,240,0.35)",
      fontWeight: 600,
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
      transform: "translateY(20px)",
      transition: "opacity 0.65s ease, transform 0.65s ease",
    },
    animateVisible: {
      opacity: 1,
      transform: "translateY(0)",
    },
  };

  const steps = [
    {
      icon: <IconUpload size={24} />,
      title: "Upload your lecture",
      desc: "Drag & drop a PDF/DOCX. We extract the text and prepare it for learning.",
    },
    {
      icon: <IconBrain size={24} />,
      title: "AI understands the content",
      desc: "Clean summaries, key concepts, and study questions—generated from your material.",
    },
    {
      icon: <IconQuiz size={24} />,
      title: "Take a smart quiz",
      desc: "Answer questions with instant review. Track progress and improve each attempt.",
    },
  ];

  const animStyle = (id) => ({
    ...styles.animateHidden,
    ...(visible[id] ? styles.animateVisible : {}),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
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
        .nav-link:hover { color: #fff !important; }
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
            Study Smarter,{" "}
            <span style={styles.heroGradText}>
              Not Harder
            </span>
          </h1>

          <p style={styles.heroSub}>
            Upload your lecture notes and let AI generate quizzes, summaries, and study questions—
            built from your material.
          </p>

          <div style={styles.heroButtons}>
            <button className="btn-primary btn-lg" onClick={() => navigate("/register")}>
              Start for free →
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </section>

        <div id="how">
          <div style={styles.section}>
            <div id="how-header" data-animate style={animStyle("how-header")}>
              <div style={styles.sectionLabel}>How it works</div>
              <h2 style={styles.sectionTitle}>
                Three steps to{" "}
                <span style={styles.heroGradText}>
                  master any subject
                </span>
              </h2>
              <p style={styles.sectionSub}>
                We keep it simple: upload, understand, and practice. No template—just a focused learning flow.
              </p>
            </div>

            <div className="steps-wrap" style={styles.stepsWrap}>
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  id={`step-${i}`}
                  data-animate
                  style={{
                    ...styles.stepCard,
                    ...animStyle(`step-${i}`),
                    transitionDelay: `${i * 0.08}s`,
                    transform:
                      i === 1
                        ? "translateY(-4px)"
                        : i === 2
                          ? "translateY(2px)"
                          : "translateY(0px)",
                  }}
                >
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
          <div style={styles.ctaOrbs} />
          <div style={styles.ctaOrbs2} />

          <h2 style={styles.ctaTitle}>
            Ready to start{" "}
            <span style={styles.heroGradText}>studying smarter</span>?
          </h2>
          <p style={styles.ctaSub}>
            Get personalized quizzes and learning notes in seconds. Keep improving with every attempt.
          </p>

          <div style={styles.ctaButtons}>
            <button className="btn-primary btn-lg" onClick={() => navigate("/register")}>
              Start for free →
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate("/login")}>
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

