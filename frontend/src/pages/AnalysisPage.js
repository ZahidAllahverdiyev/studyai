// ============================================================
// src/pages/AnalysisPage.js - Shows AI analysis of a file
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function AnalysisPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [chatMessages, setChatMessages] = useState([
  { role: "assistant", content: "Ask me anything about this lecture 👇" },
]);
const [chatInput, setChatInput] = useState("");
const [chatting, setChatting] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const isMountedRef = useRef(true);
  const pollingRef = useRef(null);
  const [pollingActive, setPollingActive] = useState(false);

  const normalizeAnalysis = useCallback((raw) => {
    if (!raw) return null;

    let a = raw;

    // 1) analysis özü string ola bilər
    if (typeof a === "string") {
      try { a = JSON.parse(a); } 
      catch { return { summary: a, keyPoints: [], studyQuestions: [] }; }
    }

    // 2) summary içində JSON string ola bilər
if (a?.summary && typeof a.summary === "string") {
  const s = a.summary
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  if (s.startsWith("{")) {
    try {
      const parsed = JSON.parse(s);
      if (parsed.summary) a = { ...a, ...parsed };
    } catch {}
  }
}

   // 3) studyQuestions yoxdursa amma summary içindədirsə
if ((!a.studyQuestions || a.studyQuestions.length === 0) && a?.summary) {
  const s = a.summary
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  if (s.startsWith("{")) {
    try {
      const parsed = JSON.parse(s);
      if (parsed.studyQuestions) a.studyQuestions = parsed.studyQuestions;
      if (parsed.summary) a.summary = parsed.summary;
    } catch {}
  }
}

    // 4) studyQuestions string ola bilər
    if (a?.studyQuestions && typeof a.studyQuestions === "string") {
      try {
        a.studyQuestions = JSON.parse(a.studyQuestions);
      } catch {
        a.studyQuestions = a.studyQuestions
          .split("\n")
          .map((x) => x.replace(/^\s*(Q?\d+[).:-]\s*)/i, "").trim())
          .filter(Boolean);
      }
    }

    // 5) keyPoints string ola bilər
    if (a?.keyPoints && typeof a.keyPoints === "string") {
      try {
        a.keyPoints = JSON.parse(a.keyPoints);
      } catch {
        a.keyPoints = a.keyPoints
          .split("\n")
          .map((x) => x.replace(/^\s*[-•\d.).:-]+\s*/, "").trim())
          .filter(Boolean);
      }
    }

    return {
      summary: a.summary || "",
      keyPoints: Array.isArray(a.keyPoints) ? a.keyPoints : [],
      studyQuestions: Array.isArray(a.studyQuestions) ? a.studyQuestions : [],
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingActive(false);
  }, []);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    setPollingActive(true);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/ai/analysis/${fileId}`);
        if (!isMountedRef.current) return;

        const status = res.data?.status;
        setFile({ name: res.data?.fileName, status });

        const fixed = normalizeAnalysis(res.data?.analysis);
        if (fixed?.summary) setAnalysis(fixed);

        if (status === "completed" || status === "failed") {
          stopPolling();
        }
      } catch (err) {
        // Keep polling.
      }
    }, 2500);
  }, [fileId, normalizeAnalysis, stopPolling]);

  useEffect(() => {
    isMountedRef.current = true;
    let isMounted = true;

    api
      .get(`/ai/analysis/${fileId}`)
      .then((res) => {
        if (!isMounted) return;

        setFile({ name: res.data.fileName, status: res.data.status });

        const fixed = normalizeAnalysis(res.data.analysis);
        if (fixed?.summary) setAnalysis(fixed);

        if (res.data?.status === "processing") startPolling();
        else stopPolling();
      })
      .catch(() => toast.error("File not found"))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      isMountedRef.current = false;
      stopPolling();
    };
  }, [fileId, normalizeAnalysis, startPolling, stopPolling]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // Mark status in UI immediately; backend will set real status shortly after.
      setFile((prev) => (prev ? { ...prev, status: "processing" } : prev));
      startPolling();

      const res = await api.post(`/ai/analyze/${fileId}`);
      const fixed = normalizeAnalysis(res.data.analysis);
      if (fixed?.summary) setAnalysis(fixed);
      toast.success("AI analysis complete! ✨");
    } catch (err) {
      setFile((prev) => (prev ? { ...prev, status: "failed" } : prev));
      stopPolling();
      const msg = err.response?.data?.error || "Analysis failed.";
      toast.error(msg);
      if (msg.includes("little text")) {
        setTimeout(() => navigate("/upload"), 2000);
      }
    } finally {
      setAnalyzing(false);
      stopPolling();
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      await api.post(`/quiz/generate/${fileId}`);
      toast.success("Quiz generated! 🎯");
      navigate(`/quiz/${fileId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to generate quiz.");
    } finally {
      setGeneratingQuiz(false);
    }
  };


  const handleChatSend = async (e) => {
  e?.preventDefault();

  const msg = chatInput.trim();
  if (!msg) return;

  // UI-də user mesajını göstər
  setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
  setChatInput("");
  setChatting(true);

  try {
    const res = await api.post(`/ai/chat/${fileId}`, { message: msg });
    const answer = res.data?.answer || "No answer.";
    setChatMessages((prev) => [...prev, { role: "assistant", content: answer }]);
  } catch (err) {
    toast.error(err.response?.data?.error || "Chat failed.");
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Sorry — something went wrong. Try again." },
    ]);
  } finally {
    setChatting(false);
  }
};


  const handleDownloadDocx = async () => {
  const customName = prompt("Enter file name:", file?.name || "studyai-notes");

  if (!customName) return;

  try {
    const res = await api.get(`/ai/download/${fileId}`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // təhlükəsizlik üçün ad təmizləmə
    const safeName = customName
      .replace(/[\\/:*?"<>|]+/g, "")
      .trim();

    a.download = `${safeName || "studyai-notes"}.docx`;

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    toast.error("Download failed.");
  }
};



  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: "auto", paddingTop: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "100%", padding: "0 24px" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Analysis</h1>
          <p className="page-subtitle">📄 {file?.name || "Lecture File"}</p>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => navigate("/upload")}>
            ← Back
          </button>

          {analysis && (
            <button
              className="btn btn-primary"
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
            >
              {generatingQuiz ? "⏳ Generating Quiz..." : "📝 Take Quiz"}
            </button>
          )}
        </div>
      </div>

      {/* Analyze Prompt (if not yet analyzed) */}
      {!analysis &&
        !analyzing &&
        file?.status !== "processing" &&
        !pollingActive && (
        <div className="card" style={{ textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
          <h2 style={{ fontFamily: "Playfair Display", marginBottom: 12 }}>
            Ready to Analyze This Lecture?
          </h2>
          <p className="text-muted mb-6" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
            Our AI will read your lecture and generate a comprehensive summary, extract key points,
            and create study questions — all in seconds.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleAnalyze}>
            🧠 Analyze with AI
          </button>
        </div>
      )}

      {/* Loading Animation */}
      {!analysis && (analyzing || file?.status === "processing" || pollingActive) && (
        <div className="card">
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span />
              <span />
              <span />
            </div>
            <h3 style={{ fontFamily: "Playfair Display" }}>Analyzing Your Lecture...</h3>
            <p className="text-muted text-sm">
              The AI is reading through your file, extracting knowledge, and preparing your study materials.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary */}
          <div className="card mb-4">
            <div className="analysis-section">
              <div className="analysis-section-title">📖 Summary</div>
              <p className="summary-text" style={{ whiteSpace: "pre-wrap" }}>
  {analysis.summary.startsWith("{") 
    ? (() => { try { return JSON.parse(analysis.summary).summary; } catch { return analysis.summary; } })()
    : analysis.summary}
</p>
              <button
  className="btn btn-secondary mt-4"
  onClick={handleDownloadDocx}
>
  ⬇ Download as DOCX
</button>
            </div>
          </div>

          {/* Key Points */}
          {analysis.keyPoints.length > 0 && (
            <div className="card mb-4">
              <div className="analysis-section">
                <div className="analysis-section-title">
                  ⚡ Key Points ({analysis.keyPoints.length})
                </div>

                {analysis.keyPoints.map((point, i) => (
                  <div key={i} className="key-point">
                    <span className="key-point-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Questions */}
          {analysis.studyQuestions.length > 0 && (
            <div className="card mb-4">
              <div className="analysis-section">
                <div className="analysis-section-title">🤔 Study Questions</div>

                {analysis.studyQuestions.map((q, i) => (
                  <div key={i} className="study-question">
                    <strong style={{ color: "var(--mauve)", marginRight: 8 }}>
                      Q{i + 1}.
                    </strong>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Chat with Lecture */}
<div className="card mb-4">
  <div className="analysis-section">
    <div className="analysis-section-title">💬 Chat with this lecture</div>

    <div
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: 12,
        maxHeight: 320,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {chatMessages.map((m, idx) => (
        <div
          key={idx}
          style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "88%",
            padding: "10px 12px",
            borderRadius: 12,
            background:
              m.role === "user"
                ? "rgba(137, 180, 250, 0.18)"
                : "rgba(203, 166, 247, 0.14)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.55,
            fontSize: 14,
          }}
        >
          {m.content}
        </div>
      ))}

      {chatting && (
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "88%",
            padding: "10px 12px",
            borderRadius: 12,
            background: "rgba(203, 166, 247, 0.14)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: 14,
          }}
        >
          Thinking...
        </div>
      )}
    </div>

    <form onSubmit={handleChatSend} className="mt-4" style={{ display: "flex", gap: 10 }}>
      <input
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Ask a question from the lecture..."
        disabled={chatting}
      />
      <button className="btn btn-primary" type="submit" disabled={chatting}>
        {chatting ? "..." : "Send"}
      </button>
    </form>
  </div>
</div>

          {/* CTA to Quiz */}
          <div
            className="card"
            style={{
              background:
                "linear-gradient(135deg, rgba(137,180,250,0.08), rgba(203,166,247,0.08))",
              textAlign: "center",
              padding: "40px 32px",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontFamily: "Playfair Display", marginBottom: 8 }}>
              Ready to Test Your Knowledge?
            </h3>
            <p className="text-muted mb-4">
              Take an AI-generated quiz with 12 questions to see how well you understood the material.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
            >
              {generatingQuiz ? "⏳ Generating Quiz..." : "🚀 Start Quiz"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

