import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import axios from 'axios';

interface FullScreenSlideshowProps {
  fileUrl: string;
  onClose?: () => void;
}

export function FullScreenSlideshow({ fileUrl, onClose }: FullScreenSlideshowProps) {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSlides();
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fileUrl, currentIndex, slides.length, onClose]);

  const loadSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Slideshow] Loading slides from backend...');
      
      // Get converted slide images from backend (no extraction, just display)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/slideshow/slides`, { timeout: 60000 });
      console.log('[Slideshow] Backend response:', response.data);
      
      if (response.data.slides && response.data.slides.length > 0) {
        // Backend converted slides to images - just display them page by page
        console.log('[Slideshow] ✅ Loaded', response.data.slides.length, 'slides from backend');
        setSlides(response.data.slides);
        setLoading(false);
      } else {
        setError('No slides found. Please ensure LibreOffice is installed for slide conversion.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[Slideshow] ❌ Error loading slides:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load presentation. Please ensure LibreOffice is installed.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#000', 
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px'
      }}>
        Loading presentation...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#000', 
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>Error</div>
        <div style={{ marginBottom: '20px' }}>{error}</div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Close
          </button>
        )}
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: '#000', 
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        No slides found
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '10px 20px', 
        backgroundColor: '#333', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff'
      }}>
        <div>Slide {currentIndex + 1} of {slides.length}</div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close (ESC)
          </button>
        )}
      </div>

      {/* Slide display */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        overflow: 'auto',
        padding: '20px'
      }}>
        <img
          src={slides[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.error('Image load error');
            setError('Failed to load slide image');
          }}
        />
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#333', 
          display: 'flex', 
          justifyContent: 'center',
          gap: '10px'
        }}>
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: currentIndex === 0 ? '#555' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
            disabled={currentIndex === slides.length - 1}
            style={{
              padding: '10px 20px',
              backgroundColor: currentIndex === slides.length - 1 ? '#555' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: currentIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
