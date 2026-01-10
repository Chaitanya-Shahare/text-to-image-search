'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        // Convert FileList to Array
        setFiles(Array.from(e.target.files));
        setStatus('');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus(`Processing ${files.length} images... (This might take a while for embeddings)`);

    const formData = new FormData();
    files.forEach(file => {
        formData.append('images', file);
    });

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus(`Success! Processed ${data.images.length} images.`);
        setFiles([]);
        // Optional: clear file input
        const input = document.getElementById('file-upload') as HTMLInputElement;
        if (input) input.value = '';
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
        <h2 className="section-title">Upload New Images</h2>
        <p className="subtitle">Select images to index (JPG/PNG). Automatic CLIP embedding generation included.</p>
        
        <div className="upload-zone">
            <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden-input"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="upload-label">
                {files.length > 0 ? (
                    <div className="py-8">
                         <span className="icon">📂</span>
                         <span className="text text-xl block">{files.length} files selected</span>
                         <span className="text-sm text-gray-400 block mt-2">{files.map(f => f.name).join(', ')}</span>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <span className="icon">📁</span>
                        <span className="text">Click to select files (Multiple allowed)</span>
                    </div>
                )}
            </label>
        </div>

        {files.length > 0 && (
            <button 
                className="btn full-width" 
                onClick={handleUpload} 
                disabled={uploading}
            >
                {uploading ? 'Uploading & Indexing...' : `Upload ${files.length} Images`}
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
