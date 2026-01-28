import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { FileUpload } from '../FileUpload';
import { toast } from 'sonner';
import { Upload, Activity, TrendingUp } from 'lucide-react';

export function SystemPerformancePage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!excelFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // POST /api/admin/system/upload
      toast.success('System performance data uploaded successfully');
      setExcelFile(null);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">System Performance</h1>
        <p className="text-gray-400">Upload system uptime and performance metrics</p>
      </div>

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Upload Performance Data</CardTitle>
          <CardDescription className="text-gray-400">
            Upload Excel file containing system uptime and success rate metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            selectedFile={excelFile}
            onFileSelect={setExcelFile}
            onClear={() => setExcelFile(null)}
            label="Select System Performance Excel File"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h4 className="text-white">System Uptime</h4>
              </div>
              <p className="text-sm text-gray-400">
                Expected format: Percentage value (e.g., 99.985)
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h4 className="text-white">Success Rate</h4>
              </div>
              <p className="text-sm text-gray-400">
                Expected format: Percentage value (e.g., 99.62)
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h4 className="text-white mb-3">Excel File Structure:</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="grid grid-cols-3 gap-4 p-2 bg-white/5 rounded">
                <span>Column A: Metric Name</span>
                <span>Column B: Value</span>
                <span>Column C: Timestamp</span>
              </div>
              <div className="p-2">
                <p>Row 1: System Uptime, 99.985, 2024-12-24</p>
                <p>Row 2: Success Rate, 99.62, 2024-12-24</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!excelFile || isUploading}
            className="w-full bg-pink-600 hover:bg-pink-700"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Performance Data'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Current Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">System Uptime</p>
              <p className="text-3xl text-white">99.985%</p>
              <p className="text-xs text-green-400 mt-1">Last updated: 2 hours ago</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Success Rate</p>
              <p className="text-3xl text-white">99.62%</p>
              <p className="text-xs text-green-400 mt-1">Last updated: 2 hours ago</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Upload History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2024-12-24 10:00', uptime: '99.985%', success: '99.62%' },
                { date: '2024-12-23 10:00', uptime: '99.980%', success: '99.58%' },
                { date: '2024-12-22 10:00', uptime: '99.975%', success: '99.55%' }
              ].map((record, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-white mb-1">{record.date}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Uptime: {record.uptime}</span>
                    <span>Success: {record.success}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
