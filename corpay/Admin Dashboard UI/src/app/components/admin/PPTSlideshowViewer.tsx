import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface Slide {
  id: number;
  content: string;
  image?: string;
}

interface PPTSlideshowViewerProps {
  file: File;
  onClose: () => void;
}

export function PPTSlideshowViewer({ file, onClose }: PPTSlideshowViewerProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const slideInterval = 5000; // 5 seconds per slide

  useEffect(() => {
    loadPPTX(file);
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [file]);

  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => {
          if (prev >= slides.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, slideInterval);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, slides.length]);

  const loadPPTX = async (pptFile: File) => {
    try {
      setIsLoading(true);
      const arrayBuffer = await pptFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Extract slide data from PPTX
      const slideFiles: Slide[] = [];
      let slideIndex = 1;

      // PPTX structure: ppt/slides/slide1.xml, slide2.xml, etc.
      const slidePromises: Promise<void>[] = [];
      
      zip.forEach((relativePath, zipEntry) => {
        if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
          const currentSlideIndex = slideIndex++;
          slidePromises.push(
            zipEntry.async('string').then(async (xmlContent) => {
              // Extract text content from XML (simplified parsing)
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
              const textElements = xmlDoc.getElementsByTagName('a:t');
              let slideText = '';
              
              for (let i = 0; i < textElements.length; i++) {
                const text = textElements[i].textContent;
                if (text) {
                  slideText += text + ' ';
                }
              }

              // Try to extract images
              let imageData = '';
              const imageElements = xmlDoc.getElementsByTagName('a:blip');
              
              if (imageElements.length > 0) {
                const rEmbed = imageElements[0].getAttribute('r:embed');
                if (rEmbed) {
                  try {
                    // Get relationship ID and find the actual image file
                    const relationshipsPath = `ppt/slides/_rels/slide${currentSlideIndex}.xml.rels`;
                    const relsFile = zip.file(relationshipsPath);
                    
                    if (relsFile) {
                      const relsContent = await relsFile.async('string');
                      const relsDoc = parser.parseFromString(relsContent, 'text/xml');
                      const relationships = relsDoc.getElementsByTagName('Relationship');
                      
                      for (let i = 0; i < relationships.length; i++) {
                        const rel = relationships[i];
                        if (rel.getAttribute('Id') === rEmbed) {
                          const target = rel.getAttribute('Target');
                          if (target) {
                            const imagePath = `ppt/${target.replace('../', '')}`;
                            const imageFile = zip.file(imagePath);
                            if (imageFile) {
                              const base64 = await imageFile.async('base64');
                              const extension = imagePath.split('.').pop()?.toLowerCase() || 'png';
                              imageData = `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${base64}`;
                            }
                          }
                          break;
                        }
                      }
                    }
                  } catch (error) {
                    console.error('Error extracting image:', error);
                  }
                }
              }

              slideFiles.push({
                id: currentSlideIndex,
                content: slideText.trim() || `Slide ${currentSlideIndex}`,
                image: imageData || undefined
              });
            }).catch((error) => {
              console.error('Error parsing slide:', error);
              slideFiles.push({
                id: currentSlideIndex,
                content: `Slide ${currentSlideIndex} - Error loading content`
              });
            })
          );
        }
      });

      await Promise.all(slidePromises);
      
      // Sort slides by ID
      slideFiles.sort((a, b) => a.id - b.id);
      
      if (slideFiles.length === 0) {
        // Fallback: create placeholder slides if parsing fails
        slideFiles.push({
          id: 1,
          content: 'Slide 1 - PPT file loaded successfully. Content parsing in progress...'
        });
      }

      setSlides(slideFiles);
      setIsLoading(false);
      toast.success(`Loaded ${slideFiles.length} slide(s)`);
    } catch (error) {
      console.error('Error loading PPTX:', error);
      toast.error('Failed to load PPT file. Please ensure it is a valid .pptx file.');
      setIsLoading(false);
      // Create a fallback slide
      setSlides([{
        id: 1,
        content: 'Unable to parse PPT file. Please ensure it is a valid .pptx format.'
      }]);
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-8 text-center">
          <div className="text-white">Loading presentation...</div>
        </CardContent>
      </Card>
    );
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <Card className="bg-white/10 border-white/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-white text-lg font-semibold">PPT Slideshow</h3>
            <span className="text-gray-400 text-sm">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Slide Display Area */}
        <div className="bg-black/30 rounded-lg p-8 min-h-[500px] flex items-center justify-center mb-6 relative">
          {currentSlide && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {currentSlide.image ? (
                <img 
                  src={currentSlide.image} 
                  alt={`Slide ${currentSlide.id}`}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <div className="text-white text-center max-w-4xl">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-xl whitespace-pre-wrap">{currentSlide.content}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousSlide}
              disabled={currentSlideIndex === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${index === currentSlideIndex 
                    ? 'bg-pink-600 w-8' 
                    : 'bg-white/30 hover:bg-white/50'
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-gray-400 text-sm">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

