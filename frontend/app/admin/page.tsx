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
    setStatus('Initializing upload...');

    const BATCH_SIZE = 5;
    const totalFiles = files.length;
    let processedCount = 0;
    let successCount = 0;
    const allErrors: string[] = [];

    // Chunk files manually
    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
        const chunk = files.slice(i, i + BATCH_SIZE);
        const formData = new FormData();
        chunk.forEach(file => formData.append('images', file));

        setStatus(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(totalFiles / BATCH_SIZE)}... (${processedCount}/${totalFiles} completed)`);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            const data = await res.json();
            
            if (res.ok) {
                successCount += (data.images ? data.images.length : 0);
                // Accumulate errors if any partial errors returned
                if (data.errors) {
                     data.errors.forEach((err: any) => allErrors.push(`${err.filename}: ${err.error}`));
                }
            } else {
                allErrors.push(`Batch failed: ${data.error || 'Unknown error'}`);
            }
        } catch (e: any) {
            console.error(e);
            allErrors.push(`Network error on batch: ${e.message}`);
        }
        
        processedCount += chunk.length;
    }

    setUploading(false);
    
    // Final Status Report
    if (allErrors.length === 0) {
        setStatus(`Success! All ${successCount} images uploaded and indexed.`);
        setFiles([]);
         const input = document.getElementById('file-upload') as HTMLInputElement;
         if (input) input.value = '';
    } else {
        setStatus(`Completed with issues. ${successCount} succeeded. ${allErrors.length} failed. Check console for details.`);
        console.error('Upload Errors:', allErrors);
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
                         <span className="text-sm text-gray-400 block mt-2">
                            {files.slice(0, 3).map(f => f.name).join(', ')}
                            {files.length > 3 && ` ... +${files.length - 3} more`}
                         </span>
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
                style={{ opacity: uploading ? 0.7 : 1, cursor: uploading ? 'wait' : 'pointer' }}
            >
                {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing {files.length} images...
                    </span>
                ) : `Upload ${files.length} Images`}
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
