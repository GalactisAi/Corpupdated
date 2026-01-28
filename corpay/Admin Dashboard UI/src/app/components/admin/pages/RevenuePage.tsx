import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { FileUpload } from '../FileUpload';
import { PowerBIEmbed } from '../PowerBIEmbed';
import { sharePriceService } from '@/app/services/apiService';
import { toast } from 'sonner';
import { Upload, Plus, TrendingUp, DollarSign, Trash2, PieChart } from 'lucide-react';
import axios from 'axios';

export function RevenuePage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [manualRevenue, setManualRevenue] = useState('');
  const [lastMonth, setLastMonth] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Share price manual entry state
  const [manualSharePrice, setManualSharePrice] = useState('');
  const [manualSharePriceChange, setManualSharePriceChange] = useState('');
  const [isSavingSharePrice, setIsSavingSharePrice] = useState(false);
  
  // Share price state
  const [sharePrice, setSharePrice] = useState<{ price: number; change: number; changePercent: number; timestamp: string } | null>(null);
  const [isLoadingSharePrice, setIsLoadingSharePrice] = useState(false);

  // Revenue summary state (matches main dashboard)
  const [revenueSummary, setRevenueSummary] = useState<{ total_amount: number; percentage_change: number } | null>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);

  // Charts (pie proportions) state moved from ChartsPage
  interface ChartCategory {
    category: string;
    percentage: number;
  }
  const [categories, setCategories] = useState<ChartCategory[]>([
    { category: '', percentage: 0 }
  ]);
  const [isSavingCharts, setIsSavingCharts] = useState(false);
  
  // Power BI view states
  const [showProportionsDashboard, setShowProportionsDashboard] = useState(false);
  const [showTrendsDashboard, setShowTrendsDashboard] = useState(false);
  
  // Slideshow state
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [uploadedPptUrl, setUploadedPptUrl] = useState<string | null>(null);
  const [isUploadingPpt, setIsUploadingPpt] = useState(false);
  
  // Handle PPT file upload to backend
  const handlePptFileSelect = async (file: File | null) => {
    setPptFile(file);
    if (file) {
      await uploadPptFile(file);
    } else {
      setUploadedPptUrl(null);
    }
  };
  
  // Upload PPT file to backend
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
            timeout: 30000
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
                timeout: 30000
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
      toast.success('PPT file uploaded successfully');
      return fileUrl;
    } catch (error: any) {
      console.error('Error uploading PPT file:', error);
      toast.error(`Failed to upload PPT file: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploadingPpt(false);
    }
  };
  
  // Start slideshow on frontend dashboard
  const handleStartSlideshow = async () => {
    if (!pptFile && !uploadedPptUrl) {
      toast.error('Please select a PPT file first');
      return;
    }
    
    // If file is selected but not uploaded yet, upload it first
    let fileUrlToUse = uploadedPptUrl;
    if (pptFile && !uploadedPptUrl) {
      const uploadedUrl = await uploadPptFile(pptFile);
      if (!uploadedUrl) {
        toast.error('Failed to upload PPT file. Please try again.');
        return;
      }
      fileUrlToUse = uploadedUrl;
    }
    
    if (!fileUrlToUse) {
      toast.error('No PPT file available. Please upload a file first.');
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
      
      // Try dev endpoint first (no auth)
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/slideshow/start-dev`,
          {},
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
      } catch (devError: any) {
        // If dev endpoint fails, try auth endpoint
        if (devError.response?.status === 401 || devError.response?.status === 403) {
          try {
            response = await axios.post(
              `${API_BASE_URL}/api/admin/slideshow/start`,
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
      
      setIsSlideshowActive(true);
      toast.success('Slideshow started on frontend dashboard');
    } catch (error: any) {
      console.error('Error starting slideshow:', error);
      toast.error(`Failed to start slideshow: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Stop slideshow on frontend dashboard
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
      
      // Try dev endpoint first (no auth)
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/slideshow/stop-dev`,
          {},
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
      } catch (devError: any) {
        // If dev endpoint fails, try auth endpoint
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
      toast.success('Slideshow stopped on frontend dashboard');
    } catch (error: any) {
      console.error('Error stopping slideshow:', error);
      toast.error(`Failed to stop slideshow: ${error.message || 'Unknown error'}`);
    }
  };

  // Load share price on mount and set up auto-refresh
  useEffect(() => {
    loadSharePrice();
    // Refresh share price every 30 seconds
    const interval = setInterval(loadSharePrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load revenue summary on mount and auto-refresh
  useEffect(() => {
    loadRevenueSummary();
    const interval = setInterval(loadRevenueSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSharePrice = async () => {
    setIsLoadingSharePrice(true);
    try {
      const data = await sharePriceService.getSharePrice();
      setSharePrice(data);
    } catch (error) {
      toast.error('Failed to load share price');
    } finally {
      setIsLoadingSharePrice(false);
    }
  };

  const loadRevenueSummary = async () => {
    setIsLoadingRevenue(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/revenue`, { timeout: 10000 });
      if (response.data) {
        setRevenueSummary({
          total_amount: Number(response.data.total_amount) || 0,
          percentage_change: Number(response.data.percentage_change) || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load revenue summary:', error);
      toast.error('Failed to load revenue summary');
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  // Charts helpers (from ChartsPage)
  const addCategory = () => {
    setCategories([...categories, { category: '', percentage: 0 }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    } else {
      toast.error('At least one category is required');
    }
  };

  const updateCategory = (index: number, field: keyof ChartCategory, value: string | number) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleSaveCharts = async () => {
    // Validate all fields are filled
    if (categories.some(cat => !cat.category || cat.percentage <= 0)) {
      toast.error('Please fill in all category names and percentages (greater than 0)');
      return;
    }

    // Validate percentages sum to 100
    const totalPercentage = categories.reduce((sum, cat) => sum + Number(cat.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(`Percentages must sum to 100%. Current total: ${totalPercentage.toFixed(2)}%`);
      return;
    }

    setIsSavingCharts(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    // Default colors for categories (cycling through brand colors)
    const colors = ['#981239', '#3D1628', '#E6E8E7', '#BE1549', '#8B1538', '#5A0F24'];
    
    const proportionsData = categories.map((cat, index) => ({
      category: cat.category,
      percentage: Number(cat.percentage),
      color: colors[index % colors.length]
    }));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // First, check if backend is reachable
    try {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
    } catch (healthError: any) {
      console.error('Backend health check failed:', healthError.message);
      toast.error(`Backend not reachable at ${API_BASE_URL}. Please ensure the backend server is running.`);
      setIsSavingCharts(false);
      return;
    }

    // Try to save to backend API (dev endpoint without auth)
    try {
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/revenue/proportions/manual-dev`,
          { proportions: proportionsData },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          }
        );
        console.log('Successfully saved via dev endpoint');
      } catch (devError: any) {
        console.log('Dev endpoint failed, trying auth endpoint...');
        response = await axios.post(
          `${API_BASE_URL}/api/admin/revenue/proportions/manual`,
          { proportions: proportionsData },
          { 
            headers,
            timeout: 10000
          }
        );
        console.log('Successfully saved via auth endpoint');
      }

      // Successfully saved to backend
      localStorage.setItem('chartProportions', JSON.stringify(proportionsData));
      window.dispatchEvent(new CustomEvent('chartProportionsUpdated', {
        detail: proportionsData
      }));
      toast.success('Chart proportions saved successfully to backend');
      setIsSavingCharts(false);
      return;
    } catch (apiError: any) {
      console.error('Backend API error:', {
        message: apiError.message,
        code: apiError.code,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
      });

      // Fallback to localStorage if API fails
      localStorage.setItem('chartProportions', JSON.stringify(proportionsData));
      window.dispatchEvent(new CustomEvent('chartProportionsUpdated', {
        detail: proportionsData
      }));
      toast.warning('Backend API unavailable. Data saved locally. Please check backend connection.');
      setIsSavingCharts(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      // #region agent log
      fetch('http://127.0.0.1:7254/ingest/ea07c2c1-9a77-4dea-9334-f6ccf4b26b3e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'RevenuePage.tsx:handleExcelUpload:beforeRequest',
          message: 'Starting Excel upload',
          data: { apiBaseUrl: API_BASE_URL, hasToken: !!token, fileName: excelFile.name },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      const formData = new FormData();
      formData.append('file', excelFile);

      // Try dev endpoint first (no auth)
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/revenue/upload-dev`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
          }
        );
      } catch (devError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7254/ingest/ea07c2c1-9a77-4dea-9334-f6ccf4b26b3e', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H2',
            location: 'RevenuePage.tsx:handleExcelUpload:devError',
            message: 'Dev upload failed',
            data: {
              message: devError?.message,
              code: devError?.code,
              status: devError?.response?.status ?? null,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion agent log
        // If dev endpoint fails due to auth, fall back to authenticated endpoint
        if (devError.response?.status === 401 || devError.response?.status === 403) {
          if (!token) {
            toast.error('Authentication required. Please log in.');
            setIsUploading(false);
            return;
          }

          response = await axios.post(
            `${API_BASE_URL}/api/admin/revenue/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
              },
              timeout: 30000,
            }
          );
        } else {
          throw devError;
        }
      }

      console.log('Revenue Excel upload response:', response.data);

      // After backend has processed the file, fetch the latest
      // trends and proportions and notify the main dashboard.
      try {
        const [trendsRes, proportionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/dashboard/revenue-trends`, { timeout: 10000 }),
          axios.get(`${API_BASE_URL}/api/dashboard/revenue-proportions`, { timeout: 10000 }),
        ]);

        if (trendsRes.data) {
          localStorage.setItem('revenueTrends', JSON.stringify(trendsRes.data));
          window.dispatchEvent(new CustomEvent('revenueTrendsUpdated', {
            detail: trendsRes.data,
          }));
        }

        if (proportionsRes.data) {
          localStorage.setItem('chartProportions', JSON.stringify(proportionsRes.data));
          window.dispatchEvent(new CustomEvent('chartProportionsUpdated', {
            detail: proportionsRes.data,
          }));
        }
      } catch (syncError) {
        console.error('Error syncing dashboard after Excel upload:', syncError);
      }

      toast.success('Revenue data uploaded and processed successfully');
      setExcelFile(null);
    } catch (error) {
      console.error('Error uploading revenue Excel file:', error);
      // #region agent log
      fetch('http://127.0.0.1:7254/ingest/ea07c2c1-9a77-4dea-9334-f6ccf4b26b3e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'RevenuePage.tsx:handleExcelUpload:catch',
          message: 'Upload threw error',
          data: {
            message: (error as any)?.message ?? null,
            code: (error as any)?.code ?? null,
            status: (error as any)?.response?.status ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
      const message = (error as any)?.response?.data?.detail || (error as Error).message || 'Upload failed';
      toast.error(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualRevenue || !lastMonth) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    // Convert user input (in millions) to full dollars
    // User enters "400" meaning $400M, we convert to 400000000
    const revenueInMillions = parseFloat(manualRevenue);
    const revenueInDollars = revenueInMillions * 1000000;
    
    const revenueData = {
      total_amount: revenueInDollars,
      percentage_change: parseFloat(lastMonth),
      last_updated: new Date().toISOString()
    };
    
    console.log(`Converting ${revenueInMillions}M to $${revenueInDollars.toLocaleString()}`);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

      // First, check if backend is reachable
      try {
        console.log('Testing backend connection:', `${API_BASE_URL}/health`);
        await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
        console.log('Backend is reachable!');
      } catch (healthError: any) {
        console.error('Backend health check failed:', healthError.message);
        toast.error(`Backend not reachable at ${API_BASE_URL}. Please ensure the backend server is running.`);
        // Still try to save, but show warning
      }

      // Try to save to backend API (dev endpoint without auth)
      try {
        console.log('Attempting to save to backend:', `${API_BASE_URL}/api/admin/revenue/manual-dev`);
        console.log('Payload:', { total_amount: revenueData.total_amount, percentage_change: revenueData.percentage_change });
        
        // Try dev endpoint first (no auth required)
        let response;
        try {
          response = await axios.post(
            `${API_BASE_URL}/api/admin/revenue/manual-dev`,
            {
              total_amount: revenueData.total_amount,
              percentage_change: revenueData.percentage_change,
            },
            { 
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000 // 10 second timeout
            }
          );
          console.log('Successfully saved via dev endpoint');
        } catch (devError: any) {
          console.error('Dev endpoint error:', {
            message: devError.message,
            code: devError.code,
            status: devError.response?.status,
            data: devError.response?.data
          });
          
          // If dev endpoint fails, try the auth endpoint
          console.log('Dev endpoint failed, trying auth endpoint...');
          try {
            response = await axios.post(
              `${API_BASE_URL}/api/admin/revenue/manual`,
              {
                total_amount: revenueData.total_amount,
                percentage_change: revenueData.percentage_change,
              },
              { 
                headers,
                timeout: 10000 // 10 second timeout
              }
            );
            console.log('Successfully saved via auth endpoint');
          } catch (authError: any) {
            console.error('Auth endpoint also failed:', {
              message: authError.message,
              code: authError.code,
              status: authError.response?.status,
              data: authError.response?.data
            });
            throw authError; // Re-throw to be caught by outer catch
          }
        }
      
      console.log('Backend response:', response.data);
      
      // Successfully saved to backend
      // Also save to localStorage as backup and trigger update
      localStorage.setItem('revenueData', JSON.stringify(revenueData));
      window.dispatchEvent(new CustomEvent('revenueDataUpdated', {
        detail: revenueData
      }));
      
      toast.success('Revenue data saved successfully to backend');
      setManualRevenue('');
      setLastMonth('');
      setIsUploading(false);
      return;
    } catch (apiError: any) {
      console.error('Backend API error:', {
        message: apiError.message,
        code: apiError.code,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        config: {
          url: apiError.config?.url,
          method: apiError.config?.method
        }
      });

      // Check if it's a network/connection error
      if (apiError.code === 'ECONNABORTED' || apiError.message === 'Network Error' || 
          apiError.code === 'ERR_NETWORK' || apiError.code === 'ECONNREFUSED') {
        
        console.warn('Backend unavailable, saving to localStorage as fallback');
        
        // Save to localStorage for frontend dashboard to read
        localStorage.setItem('revenueData', JSON.stringify(revenueData));
        
        // Trigger custom event for cross-origin communication
        window.dispatchEvent(new CustomEvent('revenueDataUpdated', {
          detail: revenueData
        }));
        
        toast.warning('Backend unavailable - saved locally. Please ensure backend is running at ' + API_BASE_URL);
        setManualRevenue('');
        setLastMonth('');
        setIsUploading(false);
        return;
      }
      
      // Check if it's an authentication error
      if (apiError.response?.status === 401 || apiError.response?.status === 403) {
        const errorDetail = apiError.response?.data?.detail || 'Authentication required';
        toast.error(`Authentication failed: ${errorDetail}. Saving locally as fallback.`);
        
        // Save to localStorage as fallback
        localStorage.setItem('revenueData', JSON.stringify(revenueData));
        window.dispatchEvent(new CustomEvent('revenueDataUpdated', {
          detail: revenueData
        }));
        
        setManualRevenue('');
        setLastMonth('');
        setIsUploading(false);
        return;
      }
      
      // For other errors, show the error but don't save locally
      const errorMessage = apiError.response?.data?.detail || apiError.message || 'Failed to save revenue data';
      toast.error(`Backend error: ${errorMessage}`);
      console.error('Revenue save error:', apiError);
      setIsUploading(false);
    }
  };

  const handleSharePriceEntry = async () => {
    if (!manualSharePrice || !manualSharePriceChange) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSavingSharePrice(true);
    const sharePriceData = {
      price: parseFloat(manualSharePrice),
      change_percentage: parseFloat(manualSharePriceChange),
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // First, check if backend is reachable
    try {
      console.log('Testing backend connection:', `${API_BASE_URL}/health`);
      await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
      console.log('Backend is reachable!');
    } catch (healthError: any) {
      console.error('Backend health check failed:', healthError.message);
      toast.error(`Backend not reachable at ${API_BASE_URL}. Please ensure the backend server is running.`);
      setIsSavingSharePrice(false);
      return;
    }

    // Try to save to backend API (dev endpoint without auth)
    try {
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/revenue/share-price/manual-dev`,
          {
            price: sharePriceData.price,
            change_percentage: sharePriceData.change_percentage,
          },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          }
        );
        console.log('Successfully saved via dev endpoint');
      } catch (devError: any) {
        console.log('Dev endpoint failed, trying auth endpoint...');
        response = await axios.post(
          `${API_BASE_URL}/api/admin/revenue/share-price/manual`,
          {
            price: sharePriceData.price,
            change_percentage: sharePriceData.change_percentage,
          },
          { 
            headers,
            timeout: 10000
          }
        );
        console.log('Successfully saved via auth endpoint');
      }

      // Successfully saved to backend
      localStorage.setItem('sharePriceData', JSON.stringify(sharePriceData));
      window.dispatchEvent(new CustomEvent('sharePriceDataUpdated', {
        detail: sharePriceData
      }));
      toast.success('Share price data saved successfully to backend');
      setManualSharePrice('');
      setManualSharePriceChange('');
      setIsSavingSharePrice(false);
      return;
    } catch (apiError: any) {
      console.error('Backend API error:', {
        message: apiError.message,
        code: apiError.code,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
      });

      // Fallback to localStorage if API fails
      localStorage.setItem('sharePriceData', JSON.stringify(sharePriceData));
      window.dispatchEvent(new CustomEvent('sharePriceDataUpdated', {
        detail: sharePriceData
      }));
      toast.warning('Backend API unavailable. Data saved locally. Please check backend connection.');
      setManualSharePrice('');
      setManualSharePriceChange('');
      setIsSavingSharePrice(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Revenue Management</h1>
          <p className="text-gray-400">Upload revenue data via Excel, PPT, Power BI, or enter manually</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Revenue Summary Display */}
          {revenueSummary && (
            <Card className="bg-white/10 border-white/20 min-w-[220px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-pink-500" />
                      <span className="text-xs text-gray-400">Total Revenue</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-white">
                        ${revenueSummary.total_amount > 0 ? (revenueSummary.total_amount / 1_000_000).toFixed(0) : '0'}M
                      </span>
                      <span className="text-xs text-green-400">
                        ▲ {revenueSummary.percentage_change.toFixed(1)}% vs last month
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Price Display */}
          {sharePrice && (
            <Card className="bg-white/10 border-white/20 min-w-[220px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-pink-500" />
                      <span className="text-xs text-gray-400">Corpay Share Price</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-white">
                        ${sharePrice.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-green-400">
                        ▲ {sharePrice.changePercent >= 0 ? '+' : ''}{sharePrice.changePercent.toFixed(2)}% vs last value
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="bg-white/10">
          <TabsTrigger value="manual" className="data-[state=active]:bg-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:bg-pink-600">
            <PieChart className="w-4 h-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-pink-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Revenue Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Manual Revenue Entry</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter revenue data manually for quick updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue" className="text-white">Total Revenue (in Millions)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={manualRevenue}
                    onChange={(e) => setManualRevenue(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter value in millions (e.g., 976 for $976M)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastMonth" className="text-white">% vs Last Month</Label>
                  <Input
                    id="lastMonth"
                    type="number"
                    step="0.01"
                    value={lastMonth}
                    onChange={(e) => setLastMonth(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Button 
                  onClick={handleManualEntry}
                  disabled={isUploading}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {isUploading ? 'Saving...' : 'Save Revenue Data'}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Share Price Entry Card */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Manual Share Price Entry</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter share price data manually for quick updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sharePrice" className="text-white">Share Price</Label>
                  <Input
                    id="sharePrice"
                    type="number"
                    step="0.01"
                    value={manualSharePrice}
                    onChange={(e) => setManualSharePrice(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharePriceChange" className="text-white">% Change</Label>
                  <Input
                    id="sharePriceChange"
                    type="number"
                    step="0.01"
                    value={manualSharePriceChange}
                    onChange={(e) => setManualSharePriceChange(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Button 
                  onClick={handleSharePriceEntry}
                  disabled={isSavingSharePrice}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {isSavingSharePrice ? 'Saving...' : 'Save Share Price Data'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts management moved from sidebar */}
        <TabsContent value="charts" className="mt-6">
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Charts</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage and customize pie chart categories and proportions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category, index) => (
                  <div key={index} className="flex gap-3 items-end p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`category-${index}`} className="text-white">
                        Category Name
                      </Label>
                      <Input
                        id={`category-${index}`}
                        type="text"
                        placeholder="e.g., Fleet, Corporate, Lodging"
                        value={category.category}
                        onChange={(e) => updateCategory(index, 'category', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label htmlFor={`percentage-${index}`} className="text-white">
                        Percentage (%)
                      </Label>
                      <Input
                        id={`percentage-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        value={category.percentage || ''}
                        onChange={(e) => updateCategory(index, 'percentage', parseFloat(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeCategory(index)}
                      disabled={categories.length === 1}
                      className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={addCategory}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white font-semibold">Total Percentage:</p>
                    <p className={`text-lg font-bold ${
                      Math.abs(categories.reduce((sum, cat) => sum + Number(cat.percentage || 0), 0) - 100) < 0.01
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {categories.reduce((sum, cat) => sum + Number(cat.percentage || 0), 0).toFixed(2)}%
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveCharts}
                    disabled={isSavingCharts}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {isSavingCharts ? 'Saving...' : 'Save Chart Proportions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-white mb-1">Revenue Trends Dashboard</h2>
                <p className="text-gray-400 text-sm">View revenue trends and monthly performance</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTrendsDashboard(!showTrendsDashboard)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  {showTrendsDashboard ? 'Hide Dashboard' : 'Show Power BI Dashboard'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTrendsDashboard(false)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Excel Instead
                </Button>
              </div>
            </div>
            
            {showTrendsDashboard ? (
              <PowerBIEmbed
                title="Revenue Trends"
                description="Monthly revenue trends and performance metrics"
                height="700px"
              />
            ) : (
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Upload Revenue Trends Excel</CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload an Excel file containing revenue trends by month, or use Power BI dashboard above
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload
                    selectedFile={excelFile}
                    onFileSelect={setExcelFile}
                    onClear={() => setExcelFile(null)}
                    label="Select Excel File"
                  />
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-white mb-2">Expected Format:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Column A: Month</li>
                      <li>• Column B: Revenue Amount</li>
                      <li>• Column C: Growth Rate (%)</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleExcelUpload}
                    disabled={!excelFile || isUploading}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Trends Data'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
