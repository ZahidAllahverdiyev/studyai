import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

  .an-root * { box-sizing: border-box; }
  .an-root { font-family: 'DM Sans', sans-serif; }

  /* ── Grid ── */
  .an-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 16px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .an-grid { grid-template-columns: 1fr; }
  }

  /* ── Cards ── */
  .an-card {
    background: var(--surface);
    border: 0.5px solid var(--border);
    border-radius: 16px;
    padding: 20px;
  }

  /* ── File list ── */
  .an-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .an-file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 0.15s, border-color 0.15s;
    margin-bottom: 6px;
  }
  .an-file-item:hover { background: var(--surface2); }
  .an-file-item.active {
    background: rgba(129,140,248,0.1);
    border-color: rgba(129,140,248,0.4);
  }

  .an-file-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(129,140,248,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .an-file-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .an-file-date {
    font-size: 11px;
    color: var(--muted);
    margin-top: 2px;
  }

  .an-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-left: auto;
  }
  .an-status-dot.completed { background: #34d399; }
  .an-status-dot.processing { background: #f59e0b; }
  .an-status-dot.pending { background: var(--border); }
  .an-status-dot.failed { background: #f87171; }

  /* ── Empty state ── */
  .an-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--muted);
    font-size: 13px;
  }

  /* ── Main panel ── */
  .an-main-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: var(--muted);
    gap: 12px;
  }

  .an-main-empty-icon {
    font-size: 48px;
    opacity: 0.4;
  }

  .an-main-empty-text {
    font-size: 15px;
    color: var(--subtext);
  }

  /* ── File header ── */
  .an-file-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .an-file-title {
    font-family: 'Sora', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .an-file-subtitle {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
  }

  .an-btn-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .an-btn {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.15s, background 0.15s;
  }
  .an-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .an-btn-primary { background: #4f46e5; color: #fff; }
  .an-btn-primary:hover:not(:disabled) { background: #4338ca; }
  .an-btn-secondary {
    background: transparent;
    border: 0.5px solid var(--border);
    color: var(--text);
  }
  .an-btn-secondary:hover:not(:disabled) { background: var(--surface2); }
  .an-btn-green { background: rgba(52,211,153,0.15); color: #34d399; }
  .an-btn-green:hover:not(:disabled) { background: rgba(52,211,153,0.25); }

  /* ── Tabs ── */
  .an-tabs {
    display: flex;
    gap: 4px;
    border-bottom: 0.5px solid var(--border);
    margin-bottom: 18px;
  }

  .an-tab {
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.15s;
  }
  .an-tab:hover { color: var(--text); }
  .an-tab.active {
    color: #818cf8;
    border-bottom-color: #818cf8;
  }

  /* ── Summary ── */
  .an-summary-text {
    font-size: 14px;
    color: var(--text);
    line-height: 1.75;
    white-space: pre-wrap;
  }

  /* ── Key points ── */
  .an-keypoint {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 0.5px solid var(--border);
    font-size: 14px;
    color: var(--text);
    line-height: 1.6;
  }
  .an-keypoint:last-child { border-bottom: none; }

  .an-keypoint-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #818cf8;
    flex-shrink: 0;
    margin-top: 6px;
  }

  /* ── Study questions ── */
  .an-question {
    background: var(--surface2);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--text);
    line-height: 1.6;
    border-left: 3px solid #818cf8;
  }

  /* ── Chat ── */
  .an-chat-messages {
    min-height: 200px;
    max-height: 380px;
    overflow-y: auto;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .an-msg {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.6;
    max-width: 85%;
  }

  .an-msg-user {
    background: #4f46e5;
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }

  .an-msg-ai {
    background: var(--surface2);
    color: var(--text);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }

  .an-msg-loading {
    background: var(--surface2);
    color: var(--muted);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    font-style: italic;
  }

  .an-chat-input-row {
    display: flex;
    gap: 8px;
  }

  .an-chat-input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 10px;
    border: 0.5px solid var(--border);
    background: var(--surface2);
    color: var(--text);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.15s;
  }
  .an-chat-input:focus { border-color: #818cf8; }

  /* ── Processing state ── */
  .an-processing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 14px;
    color: var(--subtext);
  }

  .an-spinner-lg {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: an-spin 0.8s linear infinite;
  }

  @keyframes an-spin { to { transform: rotate(360deg); } }

  .an-divider {
    height: 0.5px;
    background: var(--border);
    margin: 16px 0;
  }

  .an-no-analysis {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 20px;
    gap: 12px;
    text-align: center;
  }

  .an-no-analysis-icon { font-size: 36px; opacity: 0.5; }
  .an-no-analysis-text { font-size: 14px; color: var(--subtext); }
`;

function prettyDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return ""; }
}

function fileIcon(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["ppt", "pptx"].includes(ext)) return "📊";
  if (["txt", "md"].includes(ext)) return "📃";
  return "📁";
}

export default function AnalysisPage() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Faylları yüklə
  useEffect(() => {
    (async () => {
      try {
        setLoadingFiles(true);
        const res = await api.get("/files");
        setFiles(res.data?.files || res.data || []);
      } catch {
        toast.error("Could not load files.");
      } finally {
        setLoadingFiles(false);
      }
    })();
  }, []);

  // Fayl seçiləndə mövcud analizi yüklə
  const selectFile = async (file) => {
    setSelectedFile(file);
    setAnalysis(null);
    setChatMessages([]);
    setActiveTab("summary");

    if (file.status === "completed") {
      try {
        const res = await api.get(`/ai/analysis/${file._id}`);
        if (res.data?.analysis) {
          setAnalysis(res.data.analysis);
        }
      } catch {
        // analiz yoxdur, boş qalacaq
      }
    }
  };

  // Analiz et
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      setAnalyzing(true);
      setAnalysis(null);
      toast.loading("Analyzing...", { id: "analyze" });

      const res = await api.post(`/ai/analyze/${selectedFile._id}`);
      setAnalysis(res.data.analysis);

      // Fayl siyahısında statusu yenilə
      setFiles(prev =>
        prev.map(f => f._id === selectedFile._id ? { ...f, status: "completed" } : f)
      );
      setSelectedFile(prev => ({ ...prev, status: "completed" }));

      toast.success("Analysis complete!", { id: "analyze" });
      setActiveTab("summary");
    } catch (err) {
      const msg = err?.response?.data?.error || "Analysis failed.";
      toast.error(msg, { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  };

  // DOCX yüklə
  const handleDownload = async () => {
    if (!selectedFile) return;
    try {
      const res = await api.get(`/ai/download/${selectedFile._id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedFile.originalName || "studyai"}-notes.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    } catch {
      toast.error("Download failed.");
    }
  };

  // Chat
  const handleChat = async () => {
    const msg = chatInput.trim();
    if (!msg || !selectedFile || chatLoading) return;

    setChatMessages(prev => [...prev, { role: "user", text: msg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.post(`/ai/chat/${selectedFile._id}`, { message: msg });
      setChatMessages(prev => [...prev, { role: "ai", text: res.data.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "ai", text: "Could not get answer. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Chat scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleChatKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Analysis</h1>
          <p className="page-subtitle">AI-powered lecture analysis</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/upload")}
        >
          ↑ Upload new file
        </button>
      </div>

      <div className="an-grid an-root">

        {/* ── Sol: Fayl siyahısı ── */}
        <div className="an-card">
          <div className="an-section-label">Your files</div>

          {loadingFiles ? (
            <div className="an-empty">Loading...</div>
          ) : files.length === 0 ? (
            <div className="an-empty">
              No files yet.
              <br />
              <button
                className="an-btn an-btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => navigate("/upload")}
              >
                Upload a file
              </button>
            </div>
          ) : (
            files.map(file => (
              <div
                key={file._id}
                className={`an-file-item ${selectedFile?._id === file._id ? "active" : ""}`}
                onClick={() => selectFile(file)}
              >
                <div className="an-file-icon">{fileIcon(file.originalName)}</div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div className="an-file-name">{file.originalName || "Untitled"}</div>
                  <div className="an-file-date">{prettyDate(file.createdAt)}</div>
                </div>
                <div className={`an-status-dot ${file.status || "pending"}`} />
              </div>
            ))
          )}
        </div>

        {/* ── Sağ: Analiz paneli ── */}
        <div className="an-card">
          {!selectedFile ? (
            <div className="an-main-empty">
              <div className="an-main-empty-icon">🔍</div>
              <div className="an-main-empty-text">
                Select a file from the left to analyze it
              </div>
            </div>
          ) : (
            <>
              {/* Fayl başlığı */}
              <div className="an-file-header">
                <div>
                  <div className="an-file-title">{selectedFile.originalName || "Untitled"}</div>
                  <div className="an-file-subtitle">
                    {selectedFile.status === "completed" ? "✅ Analysis ready" :
                     selectedFile.status === "processing" ? "⏳ Processing..." :
                     selectedFile.status === "failed" ? "❌ Analysis failed" :
                     "⬜ Not analyzed yet"}
                  </div>
                </div>

                <div className="an-btn-row">
                  {analysis && (
                    <button className="an-btn an-btn-green" onClick={handleDownload}>
                      ↓ Download notes
                    </button>
                  )}
                  <button
                    className="an-btn an-btn-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? "Analyzing..." : analysis ? "Re-analyze" : "✨ Analyze"}
                  </button>
                </div>
              </div>

              <div className="an-divider" />

              {/* Processing */}
              {analyzing && (
                <div className="an-processing">
                  <div className="an-spinner-lg" />
                  <div>AI is analyzing your file...</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    This may take a few seconds
                  </div>
                </div>
              )}

              {/* Analiz yoxdur */}
              {!analyzing && !analysis && (
                <div className="an-no-analysis">
                  <div className="an-no-analysis-icon">📋</div>
                  <div className="an-no-analysis-text">
                    No analysis yet. Click "Analyze" to start.
                  </div>
                </div>
              )}

              {/* Analiz var */}
              {!analyzing && analysis && (
                <>
                  {/* Tabs */}
                  <div className="an-tabs">
                    {["summary", "keypoints", "questions", "chat"].map(tab => (
                      <button
                        key={tab}
                        className={`an-tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "summary" && "📝 Summary"}
                        {tab === "keypoints" && "⭐ Key Points"}
                        {tab === "questions" && "❓ Questions"}
                        {tab === "chat" && "💬 Chat"}
                      </button>
                    ))}
                  </div>

                  {/* Summary */}
                  {activeTab === "summary" && (
                    <div className="an-summary-text">
                      {analysis.summary || "No summary available."}
                    </div>
                  )}

                  {/* Key Points */}
                  {activeTab === "keypoints" && (
                    <div>
                      {(analysis.keyPoints || []).length === 0 ? (
                        <div style={{ color: "var(--muted)", fontSize: 14 }}>No key points.</div>
                      ) : (
                        (analysis.keyPoints || []).map((point, i) => (
                          <div key={i} className="an-keypoint">
                            <div className="an-keypoint-dot" />
                            <div>{point}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Study Questions */}
                  {activeTab === "questions" && (
                    <div>
                      {(analysis.studyQuestions || []).length === 0 ? (
                        <div style={{ color: "var(--muted)", fontSize: 14 }}>No questions.</div>
                      ) : (
                        (analysis.studyQuestions || []).map((q, i) => (
                          <div key={i} className="an-question">
                            <strong style={{ color: "#818cf8" }}>{i + 1}.</strong> {q}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Chat */}
                  {activeTab === "chat" && (
                    <div>
                      <div className="an-chat-messages">
                        {chatMessages.length === 0 && (
                          <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
                            Ask anything about this file...
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`an-msg ${msg.role === "user" ? "an-msg-user" : "an-msg-ai"}`}
                          >
                            {msg.text}
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="an-msg an-msg-loading">Thinking...</div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="an-chat-input-row">
                        <input
                          className="an-chat-input"
                          placeholder="Ask a question..."
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={handleChatKey}
                          disabled={chatLoading}
                        />
                        <button
                          className="an-btn an-btn-primary"
                          onClick={handleChat}
                          disabled={chatLoading || !chatInput.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}