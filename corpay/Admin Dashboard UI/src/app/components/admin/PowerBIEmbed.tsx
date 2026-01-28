import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { getPowerBiConfig } from '@/app/services/apiService';

interface PowerBIEmbedProps {
  reportId?: string;
  embedUrl?: string;
  title?: string;
  description?: string;
  onClose?: () => void;
  height?: string;
}

export function PowerBIEmbed({ 
  reportId, 
  embedUrl, 
  title = 'Power BI Dashboard',
  description = 'Interactive Power BI report',
  onClose,
  height = '600px'
}: PowerBIEmbedProps) {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const config = getPowerBiConfig();
  const finalReportId = reportId || config.reportId;
  const finalEmbedUrl = embedUrl || config.embedUrl;

  useEffect(() => {
    if (!finalEmbedUrl || !finalReportId || finalReportId === 'your-report-id-here') {
      setError('Power BI configuration is missing. Please configure the embed URL and Report ID in API Configuration.');
      setIsLoading(false);
      return;
    }

    loadPowerBIReport();
  }, [finalEmbedUrl, finalReportId]);

  const loadPowerBIReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Power BI Embedded requires authentication token
      // For now, we'll create an iframe-based embed
      // In production, you'll need to implement proper authentication
      
      if (!embedContainerRef.current) {
        return;
      }

      // Clear previous content
      embedContainerRef.current.innerHTML = '';

      // Create iframe for Power BI embed
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      // Construct embed URL
      // Format: https://app.powerbi.com/reportEmbed?reportId={reportId}&config={config}
      const embedUrlWithParams = `${finalEmbedUrl}?reportId=${finalReportId}&autoAuth=true&ctid=common`;
      
      iframe.src = embedUrlWithParams;
      iframe.title = title;
      iframe.allow = 'fullscreen';
      
      iframe.onload = () => {
        setIsLoading(false);
      };
      
      iframe.onerror = () => {
        setError('Failed to load Power BI report. Please check your configuration and ensure the report is accessible.');
        setIsLoading(false);
      };

      embedContainerRef.current.appendChild(iframe);
    } catch (err) {
      console.error('Error loading Power BI report:', err);
      setError('An error occurred while loading the Power BI report.');
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPowerBIReport().finally(() => {
      setIsRefreshing(false);
    });
  };

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{title}</CardTitle>
            <CardDescription className="text-gray-400">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-lg border border-red-500/20">
            <p className="text-red-400 mb-4 text-center">{error}</p>
            <Button
              onClick={() => {
                // Navigate to API config or reload
                window.location.href = '/admin/config';
              }}
              variant="outline"
              className="border-white/20"
            >
              Configure Power BI
            </Button>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                  <p className="text-white text-sm">Loading Power BI report...</p>
                </div>
              </div>
            )}
            <div 
              ref={embedContainerRef}
              className="w-full rounded-lg overflow-hidden bg-black/20"
              style={{ minHeight: height }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

