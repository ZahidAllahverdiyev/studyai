import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

const DEFAULT_AVATAR = "/avatars/learning.png";
const API_BASE_URL = "https://studyai-production-af51.up.railway.app";

function prettyDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function getAvatarSrc(avatar) {
  if (!avatar) return DEFAULT_AVATAR;
  if (avatar.startsWith("/uploads/")) return `${API_BASE_URL}${avatar}`;
  return avatar;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

  .profile-root * { box-sizing: border-box; }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    font-family: 'DM Sans', sans-serif;
  }

  @media (max-width: 900px) {
    .profile-grid { grid-template-columns: 1fr; }
  }

  .profile-card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: 16px;
    padding: 22px;
  }

  .profile-card-full {
    grid-column: 1 / -1;
  }

  .avatar-wrapper {
    position: relative;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .profile-avatar-img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--surface2);
    outline: 2px dashed rgba(129,140,248,0.5);
    outline-offset: 3px;
    display: block;
  }

  .avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0,0,0,0.45);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 18px;
  }

  .avatar-wrapper:hover .avatar-overlay { opacity: 1; }

  .avatar-upload-input { display: none; }

  .profile-name {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .profile-email {
    font-size: 13px;
    color: var(--subtext);
    margin-top: 3px;
  }

  .member-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    background: rgba(52,211,153,0.12);
    color: #34d399;
    padding: 3px 10px;
    border-radius: 999px;
    margin-top: 7px;
  }

  .member-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    display: inline-block;
  }

  .p-divider {
    height: 0.5px;
    background: var(--border);
    margin: 16px 0;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    padding: 5px 0;
  }

  .info-label { color: var(--subtext); }
  .info-value { font-weight: 500; color: var(--text); }

  .profile-edit-btn {
    width: 100%;
    margin-top: 16px;
    padding: 10px;
    background: transparent;
    border: 0.5px solid var(--border);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .profile-edit-btn:hover { background: var(--surface2); }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  .stat-card {
    background: var(--surface2);
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
  }

  .stat-num {
    font-family: 'Sora', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  .stat-num.files   { color: #818cf8; }
  .stat-num.quizzes { color: #34d399; }
  .stat-num.score   { color: #f59e0b; }

  .stat-label {
    font-size: 10px;
    color: var(--muted);
    margin-top: 5px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }

  .score-section {
    background: var(--surface2);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 14px;
  }

  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .score-pct {
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .score-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(52,211,153,0.12);
    color: #34d399;
  }

  .score-bar-bg {
    height: 5px;
    background: var(--border);
    border-radius: 999px;
    overflow: hidden;
  }

  .score-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #818cf8, #34d399);
    transition: width 1s ease;
  }

  .continue-btn {
    width: 100%;
    padding: 12px;
    background: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .continue-btn:hover { background: #4338ca; }

  .avatar-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .avatar-btn {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    padding: 5px;
    cursor: pointer;
    background: var(--surface2);
    border: 1.5px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-btn:hover { transform: scale(1.05); }

  .avatar-btn.selected {
    border-color: #818cf8 !important;
    background: rgba(129,140,248,0.1);
  }

  .avatar-btn img {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    object-fit: cover;
    display: block;
  }

  .upload-avatar-btn {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    cursor: pointer;
    background: var(--surface2);
    border: 1.5px dashed var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
    transition: border-color 0.15s, background 0.15s;
  }

  .upload-avatar-btn:hover {
    border-color: #818cf8;
    background: rgba(129,140,248,0.08);
  }
`;

const presetAvatars = [
  "/avatars/joystick.png",
  "/avatars/flash.png",
  "/avatars/cpu.png",
  "/avatars/puzzle.png",
  "/avatars/graduate.png",
  "/avatars/mortarboard.png",
  "/avatars/learning.png",
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar || localStorage.getItem("avatar") || DEFAULT_AVATAR
  );
  const [uploading, setUploading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalQuizzes: 0,
    averageScore: 0,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingStats(true);
        const res = await api.get("/dashboard");
        if (!alive) return;

        setStats(
          res.data?.stats || {
            totalFiles: 0,
            totalQuizzes: 0,
            averageScore: 0,
          }
        );
      } catch {
        toast.error("Could not load stats.");
      } finally {
        if (alive) setLoadingStats(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
      localStorage.setItem("avatar", user.avatar);
    }
  }, [user?.avatar]);

  const displayAvatar = useMemo(() => getAvatarSrc(selectedAvatar), [selectedAvatar]);

  const pickPreset = (avatar) => {
    setSelectedAvatar(avatar);
    localStorage.setItem("avatar", avatar);
    toast.success("Avatar updated!");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB olar");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);

      const token = localStorage.getItem("token");

      const res = await api.post("/user/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = res?.data?.avatar;
      if (!url) {
        throw new Error("Avatar URL gelmedi");
      }

      setSelectedAvatar(url);
      localStorage.setItem("avatar", url);
      toast.success("Avatar updated!");
    } catch (err) {
      console.error("UPLOAD ERROR:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const name = user?.name || "User";
  const email = user?.email || "—";
  const joined = user?.createdAt ? prettyDate(user.createdAt) : "—";
  const avg = Math.round(Number(stats.averageScore || 0));
  const scoreLabel =
    avg >= 80
      ? "Excellent 🏆"
      : avg >= 60
      ? "Good 👍"
      : avg > 0
      ? "Keep going 💪"
      : "No data yet";

  return (
    <>
      <style>{css}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Account overview</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/settings")}
          >
            ⚙ Settings
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/upload")}
          >
            ↑ Upload
          </button>
        </div>
      </div>

      <div className="profile-grid profile-root">
        <div className="profile-card">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <div
              className="avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={displayAvatar}
                alt="avatar"
                className="profile-avatar-img"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />

              <div className="avatar-overlay">
                {uploading ? "⏳" : "📷"}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="avatar-upload-input"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <div className="profile-name">{name}</div>
              <div className="profile-email">{email}</div>
              <div className="member-pill">
                <span className="member-pill-dot" />
                Active member
              </div>
            </div>
          </div>

          <div className="p-divider" />

          <div className="info-row">
            <span className="info-label">Member since</span>
            <span className="info-value">{joined}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Plan</span>
            <span className="info-value">Free</span>
          </div>

          <button
            className="profile-edit-btn"
            onClick={() => navigate("/settings")}
          >
            Edit profile
          </button>
        </div>

        <div className="profile-card">
          <div className="section-label">Your stats</div>

          {loadingStats ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-num files">{stats.totalFiles}</div>
                  <div className="stat-label">Files</div>
                </div>

                <div className="stat-card">
                  <div className="stat-num quizzes">{stats.totalQuizzes}</div>
                  <div className="stat-label">Quizzes</div>
                </div>

                <div className="stat-card">
                  <div className="stat-num score">{avg}%</div>
                  <div className="stat-label">Avg score</div>
                </div>
              </div>

              <div className="score-section">
                <div className="score-header">
                  <span className="score-pct">{avg}% average</span>
                  <span className="score-badge">{scoreLabel}</span>
                </div>

                <div className="score-bar-bg">
                  <div
                    className="score-bar-fill"
                    style={{ width: `${avg}%` }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            className="continue-btn"
            onClick={() => navigate("/upload")}
          >
            🚀 Continue studying
          </button>
        </div>

        <div className="profile-card profile-card-full">
          <div className="section-label">Choose avatar</div>

          <div className="avatar-grid">
            <div
              className="upload-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload your photo"
            >
              {uploading ? "⏳" : "+"}
            </div>

            {presetAvatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => pickPreset(avatar)}
                className={`avatar-btn ${selectedAvatar === avatar ? "selected" : ""}`}
              >
                <img src={avatar} alt="avatar option" />
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
            Click + to upload your own photo · Max 2MB · JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </>
  );
}