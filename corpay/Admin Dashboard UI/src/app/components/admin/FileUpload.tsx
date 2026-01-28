import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '../ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  accept?: Record<string, string[]>;
  label?: string;
}

export function FileUpload({ 
  onFileSelect, 
  selectedFile, 
  onClear,
  accept = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls']
  },
  label = 'Upload Excel File'
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false
  });

  // Determine file type description based on accept prop
  const getFileTypeDescription = () => {
    const acceptKeys = Object.keys(accept);
    if (acceptKeys.some(key => key.includes('presentation'))) {
      return 'PowerPoint (.pptx, .ppt)';
    }
    return 'Excel (.xlsx, .xls)';
  };

  return (
    <div className="space-y-4">
      <label className="text-sm text-white">{label}</label>
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive 
              ? 'border-pink-500 bg-pink-500/10' 
              : 'border-white/20 hover:border-white/40 bg-white/5'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-white mb-2">
            {isDragActive ? 'Drop file here' : 'Drag & drop file here, or click to select'}
          </p>
          <p className="text-sm text-gray-400">
            Supports: {getFileTypeDescription()}
          </p>
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg p-4 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-pink-500" />
            <div>
              <p className="text-white">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
