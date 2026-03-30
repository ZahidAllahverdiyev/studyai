// ============================================================
// src/pages/UploadPage.js - File upload with drag & drop
// (Updated) Adds: multi-select + bulk delete
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userFiles, setUserFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // NEW: bulk select state
  const [selected, setSelected] = useState(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);

  const navigate = useNavigate();

  // Load existing files
  useEffect(() => {
    api.get('/files')
      .then(res => setUserFiles(res.data.files || []))
      .catch(() => toast.error('Failed to load files'))
      .finally(() => setLoadingFiles(false));
  }, []);

  // Dropzone config
  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') toast.error('File too large. Max 10MB.');
      else if (err?.code === 'file-invalid-type') toast.error('Only PDF and DOCX files allowed.');
      else toast.error('Invalid file.');
    },
  });

  const handleUpload = async () => {
    if (!files.length) return toast.error('Please select a file first.');

    const formData = new FormData();
    formData.append('file', files[0]);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(pct);
        },
      });

      console.log(res.data);
      toast.success('File uploaded! Redirecting to analysis...');
     setTimeout(() => navigate(`/analysis/${res.data.file.id}`), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      setUserFiles(prev => prev.filter(f => f._id !== fileId));

      // NEW: if it was selected, remove from selection too
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });

      toast.success('File deleted.');
    } catch {
      toast.error('Failed to delete file.');
    }
  };

  // NEW: bulk selection helpers
  const toggleSelect = (fileId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(fileId) ? next.delete(fileId) : next.add(fileId);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(userFiles.map(f => f._id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = async () => {
    if (!selected.size) return;

    const count = selected.size;
    if (!window.confirm(`Delete ${count} selected file(s)?`)) return;

    setDeletingBulk(true);
    const ids = Array.from(selected);

    try {
      await Promise.all(ids.map(id => api.delete(`/files/${id}`)));

      setUserFiles(prev => prev.filter(f => !selected.has(f._id)));
      clearSelection();
      toast.success(`Deleted ${count} file(s).`);
    } catch (err) {
      toast.error('Bulk delete failed.');
    } finally {
      setDeletingBulk(false);
    }
  };

  const allSelected = userFiles.length > 0 && selected.size === userFiles.length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload Lecture</h1>
          <p className="page-subtitle">Upload a PDF or DOCX file for AI analysis</p>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="card mb-6">
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <>
              <div className="upload-icon">📂</div>
              <div className="upload-title">Drop it here!</div>
            </>
          ) : (
            <>
              <div className="upload-icon">📤</div>
              <div className="upload-title">Drag & drop your lecture file</div>
              <div className="upload-subtitle mt-2">
                or <span style={{ color: 'var(--blue)', cursor: 'pointer' }}>click to browse</span>
                <br /><br />
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                  Supports PDF and DOCX · Max 10MB
                </span>
              </div>
            </>
          )}
        </div>

        {/* Selected file preview */}
        {files.length > 0 && !uploading && (
          <div className="file-item mt-4">
            <div className={`file-icon ${files[0].name.endsWith('.pdf') ? 'pdf' : 'docx'}`}>
              {files[0].name.endsWith('.pdf') ? '📕' : '📘'}
            </div>
            <div className="file-info">
              <div className="file-name">{files[0].name}</div>
              <div className="file-meta">{formatFileSize(files[0].size)}</div>
            </div>
            <button onClick={() => setFiles([])} className="btn btn-sm btn-danger">Remove</button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="progress-container mt-4">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="progress-text">{uploadProgress}% uploaded</div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? `⏳ Uploading... ${uploadProgress}%` : '🚀 Upload & Analyze'}
            </button>
          </div>
        )}
      </div>

      {/* Existing Files */}
      <div className="card">
        <h3 style={{ fontFamily: 'Playfair Display', marginBottom: 20 }}>
          Your Files
          {userFiles.length > 0 && (
            <span
              className="badge badge-blue"
              style={{ marginLeft: 12, fontSize: 13, verticalAlign: 'middle' }}
            >
              {userFiles.length}
            </span>
          )}
        </h3>

        {loadingFiles ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : userFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-title">No files yet</div>
            <p>Upload your first lecture to get started with AI analysis!</p>
          </div>
        ) : (
          <>
            {/* NEW: Bulk actions bar */}
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: 16 }}>
              <div className="text-sm text-muted">
                Selected: {selected.size}
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={allSelected ? clearSelection : selectAll}
                >
                  {allSelected ? 'Clear all' : 'Select all'}
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleBulkDelete}
                  disabled={!selected.size || deletingBulk}
                >
                  {deletingBulk ? 'Deleting...' : 'Delete selected'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {userFiles.map(file => {
                const checked = selected.has(file._id);

                return (
                  <div key={file._id} className="file-item">
                    {/* NEW: checkbox */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(file._id)}
                      style={{ width: 18, height: 18 }}
                      aria-label={`Select ${file.originalName}`}
                    />

                    <div className={`file-icon ${file.fileType}`}>
                      {file.fileType === 'pdf' ? '📕' : '📘'}
                    </div>

                    <div className="file-info">
                      <div className="file-name">{file.originalName}</div>
                      <div className="file-meta">
                        {formatFileSize(file.fileSize)} · {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="file-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/analysis/${file._id}`)}
                      >
                        {file.status === 'completed' ? '📊 View Analysis' : '🔍 Analyze'}
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(file._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}