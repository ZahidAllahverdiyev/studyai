import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
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
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => {
      observerRef.current.observe(el);
    });
    return () => observerRef.current.disconnect();
  }, []);

  const animStyle = (id) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? "translateY(0)" : "translateY(30px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  });

  const features = [
    { icon: "🧠", color: "rgba(108,99,255,0.2)", title: "AI-Powered Analysis", desc: "Upload your lecture notes and our AI instantly extracts key concepts, summaries, and study points." },
    { icon: "📝", color: "rgba(72,198,239,0.2)", title: "Smart Quiz Generation", desc: "Automatically generate personalized quizzes based on your uploaded material to test your knowledge." },
    { icon: "📊", color: "rgba(255,182,72,0.2)", title: "Progress Tracking", desc: "Track your learning journey with detailed stats on quizzes taken, scores, and improvement over time." },
    { icon: "⚡", color: "rgba(72,239,128,0.2)", title: "Instant Results", desc: "Get immediate feedback on your quiz performance with detailed explanations for each answer." },
    { icon: "📄", color: "rgba(255,99,132,0.2)", title: "PDF & DOCX Support", desc: "Works with your existing lecture files — just upload and let StudyAI do the heavy lifting." },
    { icon: "🌙", color: "rgba(168,157,255,0.2)", title: "Beautiful Dark UI", desc: "Designed for long study sessions with a comfortable dark interface that's easy on the eyes." },
  ];

  const steps = [
    { icon: "📤", title: "Upload Your Lecture", desc: "Drag & drop your PDF or DOCX lecture file. We support files up to 10MB." },
    { icon: "🤖", title: "AI Analyzes Content", desc: "Our AI reads through your material and extracts the most important information." },
    { icon: "🎯", title: "Take Quizzes & Learn", desc: "Answer AI-generated questions, track your score, and master your subject." },
  ];

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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(108,99,255,0.5) !important; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1) !important; }
        .nav-link-btn:hover { color: #fff !important; }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(108,99,255,0.35) !important; }

        /* Mobile menu slide */
        .mobile-menu {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10,11,15,0.98);
          backdrop-filter: blur(20px);
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .mobile-menu.open { opacity: 1; transform: translateY(0); pointer-events: all; }
        .mobile-menu.closed { opacity: 0; transform: translateY(-20px); pointer-events: none; }
        .mobile-menu-link {
          font-family: 'Sora', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: rgba(232,234,240,0.8);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .mobile-menu-link:hover { color: #fff; }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          .hero-stats { gap: 24px !important; margin-top: 48px !important; }
          .stat-num { font-size: 20px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-wrap { grid-template-columns: 1fr !important; }
          .cta-wrap { margin: 0 16px 80px !important; padding: 48px 24px !important; }
          .footer-inner { flex-direction: column; align-items: center; text-align: center; gap: 16px; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif", background: "#0a0b0f", color: "#e8eaf0", minHeight: "100vh", overflowX: "hidden" }}>

        {/* MOBILE MENU OVERLAY */}
        <div className={`mobile-menu ${menuOpen ? "open" : "closed"}`}>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", padding: 8 }}
          >✕</button>
          <button className="mobile-menu-link" onClick={() => { setMenuOpen(false); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}>Features</button>
          <button className="mobile-menu-link" onClick={() => { setMenuOpen(false); document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }); }}>How it works</button>
          <button className="mobile-menu-link" onClick={() => { setMenuOpen(false); navigate("/login"); }}>Sign in</button>
          <button
            onClick={() => { setMenuOpen(false); navigate("/register"); }}
            style={{ background: "linear-gradient(135deg, #6c63ff, #48c6ef)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >Get started free</button>
        </div>

        {/* NAV */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          background: scrollY > 40 ? "rgba(10,11,15,0.95)" : "transparent",
          backdropFilter: scrollY > 40 ? "blur(14px)" : "none",
          borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.4s ease",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 20, color: "#fff", textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #48c6ef)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
            StudyAI
          </div>

          {/* Desktop links */}
          <div className="desktop-nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <button className="nav-link-btn" style={{ color: "rgba(232,234,240,0.7)", textDecoration: "none", fontSize: 15, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", background: "none", border: "none" }} onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
            <button className="nav-link-btn" style={{ color: "rgba(232,234,240,0.7)", textDecoration: "none", fontSize: 15, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", background: "none", border: "none" }} onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
            <button className="nav-link-btn" style={{ color: "rgba(232,234,240,0.7)", textDecoration: "none", fontSize: 15, fontWeight: 500, transition: "color 0.2s", cursor: "pointer", background: "none", border: "none" }} onClick={() => navigate("/login")}>Sign in</button>
            <button className="nav-cta" style={{ background: "linear-gradient(135deg, #6c63ff, #48c6ef)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s, transform 0.2s" }} onClick={() => navigate("/register")}>Get started free</button>
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, alignItems: "center", justifyContent: "center" }}
          >
            <span style={{ display: "block", width: 20, height: 2, background: "#e8eaf0", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "#e8eaf0", borderRadius: 2 }} />
            <span style={{ display: "block", width: 20, height: 2, background: "#e8eaf0", borderRadius: 2 }} />
          </button>
        </nav>

        {/* HERO */}
        <section style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "110px 20px 70px",
          position: "relative",
        }}>
          {/* Backgrounds */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(108,99,255,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(72,198,239,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none", maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)" }} />

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.35)", borderRadius: 99, padding: "6px 16px", fontSize: 13, color: "#a89dff", fontWeight: 600, marginBottom: 24, animation: "fadeInDown 0.7s ease both" }}>
            ✦ AI-Powered Learning Platform
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(38px, 10vw, 80px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20, animation: "fadeInUp 0.8s ease 0.1s both" }}>
            Study Smarter,{" "}
            <span style={{ background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Not Harder</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: "clamp(15px, 4vw, 19px)", color: "rgba(232,234,240,0.6)", maxWidth: 480, lineHeight: 1.7, marginBottom: 36, animation: "fadeInUp 0.8s ease 0.2s both" }}>
            Upload your lecture notes and let AI generate personalized quizzes, track your progress, and help you ace every exam.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeInUp 0.8s ease 0.3s both", width: "100%" }}>
            <button
              className="btn-primary"
              style={{ background: "linear-gradient(135deg, #6c63ff, #48c6ef)", color: "#fff", border: "none", borderRadius: 14, padding: "15px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 8px 32px rgba(108,99,255,0.35)", flex: "1 1 auto", maxWidth: 260, minWidth: 140 }}
              onClick={() => navigate("/register")}
            >Start for free →</button>
            <button
              className="btn-secondary"
              style={{ background: "rgba(255,255,255,0.06)", color: "#e8eaf0", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "15px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", flex: "1 1 auto", maxWidth: 180, minWidth: 120 }}
              onClick={() => navigate("/login")}
            >Sign in</button>
          </div>

          {/* Stats */}
          <div className="hero-stats" style={{ display: "flex", gap: 36, justifyContent: "center", marginTop: 60, animation: "fadeInUp 0.8s ease 0.4s both", flexWrap: "wrap" }}>
            {[["PDF & DOCX", "Supported"], ["AI Generated", "Quizzes"], ["Real-time", "Progress"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="stat-num" style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, #6c63ff, #48c6ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(232,234,240,0.45)", fontWeight: 500, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <div id="features">
          <div style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto" }}>
            <div id="feat-header" data-animate style={animStyle("feat-header")}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6c63ff", marginBottom: 10 }}>Features</div>
              <h2 style={{ fontSize: "clamp(26px, 6vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14, lineHeight: 1.2 }}>
                Everything you need to{" "}
                <span style={{ background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>learn effectively</span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(232,234,240,0.55)", maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>
                StudyAI combines powerful AI analysis with intuitive study tools to transform how you learn.
              </p>
            </div>
            <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {features.map((f, i) => (
                <div key={f.title} id={`feat-${i}`} data-animate className="feature-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 24px", transition: "transform 0.3s, border-color 0.3s", cursor: "default", ...animStyle(`feat-${i}`), transitionDelay: `${i * 0.07}s` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16, background: f.color }}>{f.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: "rgba(232,234,240,0.55)", lineHeight: 1.65 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div id="how">
          <div style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto" }}>
            <div id="how-header" data-animate style={animStyle("how-header")}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6c63ff", marginBottom: 10 }}>How it works</div>
              <h2 style={{ fontSize: "clamp(26px, 6vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14, lineHeight: 1.2 }}>
                Three steps to{" "}
                <span style={{ background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>master any subject</span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(232,234,240,0.55)", maxWidth: 480, lineHeight: 1.7, marginBottom: 48 }}>
                Getting started takes less than a minute. No setup required.
              </p>
            </div>
            <div className="steps-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {steps.map((s, i) => (
                <div key={s.title} id={`step-${i}`} data-animate style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "32px 24px", position: "relative", overflow: "hidden", ...animStyle(`step-${i}`), transitionDelay: `${i * 0.1}s` }}>
                  <div style={{ fontSize: 64, fontWeight: 900, position: "absolute", top: -8, right: 14, color: "rgba(108,99,255,0.07)", lineHeight: 1, pointerEvents: "none", fontFamily: "monospace" }}>0{i + 1}</div>
                  <div style={{ fontSize: 30, marginBottom: 14 }}>{s.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: "rgba(232,234,240,0.55)", lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div id="cta-section" data-animate className="cta-wrap" style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(72,198,239,0.1) 100%)",
          border: "1px solid rgba(108,99,255,0.2)", borderRadius: 24,
          padding: "64px 32px", textAlign: "center", position: "relative", overflow: "hidden",
          margin: "0 20px 80px",
          ...animStyle("cta-section"),
        }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 250, background: "radial-gradient(ellipse, rgba(108,99,255,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(26px, 6vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 14, position: "relative" }}>
            Ready to transform{" "}
            <span style={{ background: "linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>how you study?</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(232,234,240,0.6)", marginBottom: 36, position: "relative" }}>
            Join students who are already learning smarter with StudyAI.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <button className="btn-primary" style={{ background: "linear-gradient(135deg, #6c63ff, #48c6ef)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 30px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 8px 32px rgba(108,99,255,0.35)" }} onClick={() => navigate("/register")}>Create free account →</button>
            <button className="btn-secondary" style={{ background: "rgba(255,255,255,0.06)", color: "#e8eaf0", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 30px", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onClick={() => navigate("/login")}>Sign in</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 20px" }}>
          <div className="footer-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18, color: "#fff" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6c63ff, #48c6ef)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
              StudyAI
            </div>
            <div style={{ fontSize: 13, color: "rgba(232,234,240,0.35)" }}>© 2026 StudyAI. Learn Smarter.</div>
            <div style={{ display: "flex", gap: 20 }}>
              <button className="nav-link-btn" style={{ color: "rgba(232,234,240,0.5)", background: "none", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/login")}>Sign in</button>
              <button className="nav-link-btn" style={{ color: "rgba(232,234,240,0.5)", background: "none", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/register")}>Register</button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;
