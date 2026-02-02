import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { FileUpload } from '../FileUpload';
import { toast } from 'sonner';
import { Presentation } from 'lucide-react';
import axios from 'axios';

export function SwitchScreenPage() {
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [uploadedPptUrl, setUploadedPptUrl] = useState<string | null>(null);
  const [isUploadingPpt, setIsUploadingPpt] = useState(false);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideIntervalSeconds, setSlideIntervalSeconds] = useState<number>(5);

  const uploadPptFile = async (file: File): Promise<string | null> => {
    setIsUploadingPpt(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try dev endpoint first (no auth)
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/slideshow/upload-dev`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          }
        );
      } catch (devError: any) {
        // If dev endpoint fails, try auth endpoint
        if (devError.response?.status === 401 || devError.response?.status === 403) {
          try {
            response = await axios.post(
              `${API_BASE_URL}/api/admin/slideshow/upload`,
              formData,
              {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
              }
            );
          } catch (authError: any) {
            toast.error('Authentication required. Please log in.');
            setIsUploadingPpt(false);
            return null;
          }
        } else {
          throw devError;
        }
      }

      const fileUrl = response.data.file_url;
      setUploadedPptUrl(fileUrl);
      toast.success('File uploaded successfully');
      return fileUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploadingPpt(false);
    }
  };

  const handlePptFileSelect = async (file: File | null) => {
    setPptFile(file);
    if (file) {
      await uploadPptFile(file);
    } else {
      setUploadedPptUrl(null);
    }
  };

  const handleStartSlideshow = async () => {
    if (!pptFile && !uploadedPptUrl) {
      toast.error('Please select a presentation file first');
      return;
    }

    let fileUrlToUse = uploadedPptUrl;
    if (pptFile && !uploadedPptUrl) {
      const uploadedUrl = await uploadPptFile(pptFile);
      if (!uploadedUrl) {
        toast.error('Failed to upload file. Please try again.');
        return;
      }
      fileUrlToUse = uploadedUrl;
    }

    if (!fileUrlToUse) {
      toast.error('No file available. Please upload a presentation first.');
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const intervalSeconds = Math.max(1, Math.min(300, slideIntervalSeconds)) || 5;

      // Try dev endpoint first (no auth)
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/slideshow/start-dev`,
          { interval_seconds: intervalSeconds },
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
      } catch (devError: any) {
        if (devError.response?.status === 401 || devError.response?.status === 403) {
          try {
            response = await axios.post(
              `${API_BASE_URL}/api/admin/slideshow/start`,
              { interval_seconds: intervalSeconds },
              { headers, timeout: 10000 }
            );
          } catch (authError: any) {
            toast.error('Authentication required. Please log in.');
            return;
          }
        } else {
          throw devError;
        }
      }

      setIsSlideshowActive(true);
      toast.success('Switched main screen to slideshow');
    } catch (error: any) {
      console.error('Error starting slideshow:', error);
      toast.error(`Failed to start slideshow: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStopSlideshow = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/slideshow/stop-dev`,
          {},
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
      } catch (devError: any) {
        if (devError.response?.status === 401 || devError.response?.status === 403) {
          try {
            response = await axios.post(
              `${API_BASE_URL}/api/admin/slideshow/stop`,
              {},
              { headers, timeout: 10000 }
            );
          } catch (authError: any) {
            toast.error('Authentication required. Please log in.');
            return;
          }
        } else {
          throw devError;
        }
      }

      setIsSlideshowActive(false);
      toast.success('Switched main screen back to dashboard');
    } catch (error: any) {
      console.error('Error stopping slideshow:', error);
      toast.error(`Failed to stop slideshow: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Switch Screen</h1>
          <p className="text-gray-400">
            Upload a PDF and switch the main dashboard screen to a full-screen slideshow.
          </p>
        </div>
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Presentation className="w-4 h-4" />
            Upload Presentation
          </CardTitle>
          <CardDescription className="text-gray-400">
            Upload a PDF file to display as a full-screen slideshow on the Frontend Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            selectedFile={pptFile}
            onFileSelect={handlePptFileSelect}
            onClear={() => {
              setPptFile(null);
              setUploadedPptUrl(null);
            }}
            label="Select PDF File"
            accept={{
              'application/pdf': ['.pdf'],
            }}
          />
          {isUploadingPpt && (
            <p className="text-sm text-gray-400">Uploading file...</p>
          )}
          {uploadedPptUrl && (
            <p className="text-sm text-green-400">✓ File uploaded successfully</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="slideInterval" className="text-white">
              Slide interval (seconds)
            </Label>
            <Input
              id="slideInterval"
              type="number"
              min={1}
              max={300}
              value={slideIntervalSeconds}
              onChange={(e) => setSlideIntervalSeconds(Math.max(1, Math.min(300, Number(e.target.value) || 5)))}
              className="bg-white/10 border-white/20 text-white max-w-[120px]"
            />
            <p className="text-xs text-gray-400">How many seconds each slide is shown before moving to the next (1–300).</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white mb-2">Supported Formats:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• PDF (.pdf) - No extra software needed</li>
            </ul>
            <p className="text-sm text-gray-400 mt-2">
              Click "Switch to Slideshow" to replace the main dashboard with the presentation, and "Switch back to Dashboard"
              to return to the normal view.
            </p>
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              onClick={handleStartSlideshow}
              disabled={(!pptFile && !uploadedPptUrl) || isUploadingPpt}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
            >
              {isUploadingPpt ? 'Uploading...' : 'Switch to Slideshow'}
            </Button>
            <Button
              onClick={handleStopSlideshow}
              disabled={!isSlideshowActive}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Switch back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

