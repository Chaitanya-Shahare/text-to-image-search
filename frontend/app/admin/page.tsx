'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('Processing image and generating embeddings...');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus(`Success! Image uploaded (ID: ${data.image.id}) and indexed.`);
        setFile(null);
        setPreview(null);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      setStatus('Upload failed. Check console.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="container">
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div className="glass-panel admin-panel">
        <h2 className="section-title">Upload New Image</h2>
        <p className="subtitle">Select an image to index (JPG/PNG). Automatic CLIP embedding generation included.</p>
        
        <div className="upload-zone">
            <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden-input"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="upload-label">
                {preview ? (
                    <img src={preview} alt="Preview" className="preview-img" />
                ) : (
                    <div className="upload-placeholder">
                        <span className="icon">📁</span>
                        <span className="text">Click to select file</span>
                    </div>
                )}
            </label>
        </div>

        {file && (
            <button 
                className="btn full-width" 
                onClick={handleUpload} 
                disabled={uploading}
            >
                {uploading ? 'Uploading & Indexing...' : 'Upload to Engine'}
            </button>
        )}

        {status && (
            <div className={`status-msg ${status.startsWith('Success') ? 'success' : 'error'}`}>
                {status}
            </div>
        )}
      </div>
    </main>
  );
}
