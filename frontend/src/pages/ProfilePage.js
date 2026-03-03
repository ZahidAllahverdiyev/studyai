import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

function prettyDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

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

  const selectedAvatar =
    localStorage.getItem("avatar") || presetAvatars[0];

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
          res.data?.stats || { totalFiles: 0, totalQuizzes: 0, averageScore: 0 }
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

  const name = user?.name || "User";
  const email = user?.email || "—";
  const joined = user?.createdAt ? prettyDate(user.createdAt) : "—";
  const avg = Math.round(Number(stats.averageScore || 0));

  const pickAvatar = (avatar) => {
    localStorage.setItem("avatar", avatar);
    toast.success("Avatar updated!");
    // refresh etmək əvəzinə sadəcə state də edə bilərdik, amma bu ən sadədir
    window.location.reload();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Account overview</p>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate("/settings")}>
            ⚙️ Settings
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/upload")}>
            📤 Upload
          </button>
        </div>
      </div>

      <div className="card-grid">
        {/* Left: user card */}
        <div className="card" style={{ padding: 28 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
            <div className="flex items-center gap-3">
              <img
                src={selectedAvatar}
                alt="avatar"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--border)",
                  background: "var(--surface2)",
                }}
              />

              <div>
                <div style={{ fontFamily: "Playfair Display", fontSize: 26, fontWeight: 700 }}>
                  {name}
                </div>
                <div className="text-muted">{email}</div>
              </div>
            </div>
          </div>

          {/* Member since */}
          <div
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 16,
              marginBottom: 18,
            }}
          >
            <div className="text-xs text-muted" style={{ marginBottom: 6, letterSpacing: 0.8 }}>
              MEMBER SINCE
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{joined}</div>
          </div>

          {/* Avatar picker */}
          <div
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 16,
            }}
          >
            <div className="text-xs text-muted" style={{ marginBottom: 10, letterSpacing: 0.8 }}>
              CHOOSE AVATAR
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {presetAvatars.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => pickAvatar(avatar)}
                  style={{
                    border:
                      selectedAvatar === avatar
                        ? "2px solid var(--blue)"
                        : "1px solid var(--border)",
                    background: "transparent",
                    borderRadius: 14,
                    padding: 6,
                    cursor: "pointer",
                  }}
                  title="Select"
                >
                  <img
                    src={avatar}
                    alt="avatar option"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                      background: "var(--surface)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate("/settings")}>
              Edit profile
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/upload")}>
              Manage files
            </button>
          </div>
        </div>

        {/* Right: stats */}
        <div className="card" style={{ padding: 28 }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div style={{ fontFamily: "Playfair Display", fontSize: 20, fontWeight: 700 }}>
                Your Stats
              </div>
              <div className="text-muted text-sm">Quick snapshot</div>
            </div>
          </div>

          {loadingStats ? (
            <div style={{ textAlign: "center", padding: 18 }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div
                style={{
                  padding: 16,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div className="text-muted text-xs" style={{ letterSpacing: 0.8 }}>
                  FILES
                </div>
                <div style={{ fontFamily: "Playfair Display", fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                  {stats.totalFiles}
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div className="text-muted text-xs" style={{ letterSpacing: 0.8 }}>
                  QUIZZES
                </div>
                <div style={{ fontFamily: "Playfair Display", fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                  {stats.totalQuizzes}
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <div className="text-muted text-xs" style={{ letterSpacing: 0.8 }}>
                  AVG SCORE
                </div>
                <div style={{ fontFamily: "Playfair Display", fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                  {avg}%
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button className="btn btn-primary w-full" onClick={() => navigate("/upload")}>
              🚀 Continue studying
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}