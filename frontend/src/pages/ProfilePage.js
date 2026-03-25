import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

function prettyDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return "—"; }
}

const css = `
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  @media (max-width: 900px) {
    .profile-grid { grid-template-columns: 1fr; }
  }

  .profile-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px;
  }

  .profile-avatar-img {
    width: 68px; height: 68px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border2);
    background: var(--surface2);
    flex-shrink: 0;
  }

  .profile-name {
    font-size: 24px; font-weight: 800;
    color: var(--text); letter-spacing: -0.02em;
  }
  .profile-email { font-size: 14px; color: var(--subtext); margin-top: 3px; }

  .profile-info-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .profile-info-label {
    font-size: 11px; font-weight: 700;
    color: var(--muted); letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 6px;
  }
  .profile-info-value { font-size: 17px; font-weight: 700; color: var(--text); }

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 10px;
  }
  .avatar-btn {
    border-radius: 12px; padding: 6px;
    cursor: pointer; background: transparent;
    transition: transform 0.2s, border-color 0.2s;
  }
  .avatar-btn:hover { transform: scale(1.06); }
  .avatar-btn.selected {
    border: 2px solid var(--purple) !important;
    background: rgba(124,111,255,0.08);
  }
  .avatar-btn img {
    width: 100%; aspect-ratio: 1/1;
    border-radius: 50%; object-fit: cover;
    display: block; background: var(--surface);
  }

  .stat-mini {
    padding: 18px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 14px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .stat-mini:hover { border-color: var(--border2); transform: translateY(-2px); }
  .stat-mini-label {
    font-size: 11px; font-weight: 700;
    color: var(--muted); letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 8px;
  }
  .stat-mini-value {
    font-size: 30px; font-weight: 800;
    letter-spacing: -0.03em; color: var(--text);
  }

  .section-title {
    font-size: 17px; font-weight: 700;
    color: var(--text); margin-bottom: 4px;
  }
  .section-sub { font-size: 13px; color: var(--subtext); margin-bottom: 20px; }

  .divider {
    height: 1px; background: var(--border);
    margin: 20px 0;
  }

  .score-bar-bg {
    height: 8px; border-radius: 99px;
    background: var(--surface3);
    overflow: hidden; margin-top: 8px;
  }
  .score-bar-fill {
    height: 100%; border-radius: 99px;
    background: var(--grad);
    transition: width 1s ease;
  }
`;

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const presetAvatars = [
    "/avatars/joystick.png",
    "/avatars/flash.png",
    "/avatars/cpu.png",
    "/avatars/puzzle.png",
    "/avatars/graduate.png",
    "/avatars/mortarboard.png",
    "/avatars/learning.png",
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("avatar") || presetAvatars[0]
  );
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({ totalFiles: 0, totalQuizzes: 0, averageScore: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingStats(true);
        const res = await api.get("/dashboard");
        if (!alive) return;
        setStats(res.data?.stats || { totalFiles: 0, totalQuizzes: 0, averageScore: 0 });
      } catch {
        toast.error("Could not load stats.");
      } finally {
        if (alive) setLoadingStats(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pickAvatar = (avatar) => {
    localStorage.setItem("avatar", avatar);
    setSelectedAvatar(avatar);
    toast.success("Avatar updated!");
  };

  const name   = user?.name || "User";
  const email  = user?.email || "—";
  const joined = user?.createdAt ? prettyDate(user.createdAt) : "—";
  const avg    = Math.round(Number(stats.averageScore || 0));

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Account overview</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/settings")}>
            ⚙ Settings
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/upload")}>
            ↑ Upload
          </button>
        </div>
      </div>

      <div className="profile-grid">

        {/* ── Left: User card ── */}
        <div className="profile-card">

          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <img src={selectedAvatar} alt="avatar" className="profile-avatar-img" />
            <div>
              <div className="profile-name">{name}</div>
              <div className="profile-email">{email}</div>
            </div>
          </div>

          {/* Member since */}
          <div className="profile-info-box">
            <div className="profile-info-label">Member since</div>
            <div className="profile-info-value">{joined}</div>
          </div>

          <div className="divider" />

          {/* Avatar picker */}
          <div className="profile-info-label" style={{ marginBottom: 0 }}>Choose avatar</div>
          <div className="avatar-grid">
            {presetAvatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => pickAvatar(avatar)}
                className={`avatar-btn ${selectedAvatar === avatar ? "selected" : ""}`}
                style={{ border: `1px solid var(--border)` }}
              >
                <img src={avatar} alt="avatar option" />
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-secondary w-full" onClick={() => navigate("/settings")}>
              Edit profile
            </button>
          </div>
        </div>

        {/* ── Right: Stats card ── */}
        <div className="profile-card">
          <div className="section-title">Your Stats</div>
          <div className="section-sub">Learning progress snapshot</div>

          {loadingStats ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                <div className="stat-mini">
                  <div className="stat-mini-label">Files</div>
                  <div className="stat-mini-value" style={{ color: "var(--purple2)" }}>
                    {stats.totalFiles}
                  </div>
                </div>
                <div className="stat-mini">
                  <div className="stat-mini-label">Quizzes</div>
                  <div className="stat-mini-value" style={{ color: "var(--cyan)" }}>
                    {stats.totalQuizzes}
                  </div>
                </div>
                <div className="stat-mini">
                  <div className="stat-mini-label">Avg Score</div>
                  <div className="stat-mini-value" style={{ color: "var(--yellow)" }}>
                    {avg}%
                  </div>
                </div>
              </div>

              {/* Score bar */}
              <div className="profile-info-box" style={{ marginBottom: 0 }}>
                <div className="profile-info-label">Average score</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="profile-info-value">{avg}%</div>
                  <div style={{ fontSize: 13, color: avg >= 80 ? "var(--green)" : avg >= 60 ? "var(--yellow)" : "var(--red)", fontWeight: 600 }}>
                    {avg >= 80 ? "Excellent 🏆" : avg >= 60 ? "Good 👍" : avg > 0 ? "Keep going 💪" : "No data yet"}
                  </div>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${avg}%` }} />
                </div>
              </div>
            </>
          )}

          <div className="divider" />

          <button className="btn btn-primary w-full" onClick={() => navigate("/upload")}>
            🚀 Continue studying
          </button>
        </div>
      </div>
    </>
  );
}