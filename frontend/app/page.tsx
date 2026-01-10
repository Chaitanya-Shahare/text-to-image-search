'use client';

import { useState } from 'react';

interface SearchResult {
  id: number;
  filename: string;
  path: string;
  score: number;
  tags: string[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSelectedImage(null); // Clear selection on new search
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        console.error('Search failed');
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="hero-section">
        <h1 className="hero-title">
          Visual Semantic Search
        </h1>
        <p className="hero-subtitle">
          Search your image library using natural language description. 
          Powered by OpenAI CLIP.
        </p>

        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Describe what you're looking for... (e.g., 'red sports car')"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit" 
            className="search-btn btn"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="results-section">
          <h2 className="results-title">
             Results <span className="results-count">{results.length} found</span>
          </h2>
          
          <div className="results-grid">
            {results.map((item) => (
              <div 
                key={item.id} 
                className="card result-card"
                onClick={() => setSelectedImage(item)}
              >
                {/* Proxy /uploads through Next.js rewrite */}
                <img 
                    src={item.path} 
                    alt={item.tags.join(', ')} 
                    loading="lazy"
                    className="card-img"
                />
                
                <div className="card-overlay">
                    <div className="overlay-content">
                        <div className="tags-container">
                            {item.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="tag">{tag}</span>
                            ))}
                        </div>
                        <div className="meta-row">
                            <span className="filename">{item.filename}</span>
                            <span className="score">{(item.score * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && results.length === 0 && (
            <div className="empty-state">
              <p>No matching images found.</p>
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>×</button>
            <div className="modal-body">
              <div className="modal-img-container">
                <img src={selectedImage.path} className="modal-img" alt={selectedImage.filename} />
              </div>
              <div className="modal-details">
                <h3 className="modal-section-title">Image Analysis</h3>
                <div className="modal-filename">{selectedImage.filename}</div>
                <div className="modal-score">{(selectedImage.score * 100).toFixed(2)}% Match</div>
                
                <h3 className="modal-section-title">Tags</h3>
                <div className="tags-container">
                    {selectedImage.tags.length > 0 ? selectedImage.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                    )) : <span className="text-gray-500 italic">No tags detected</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
