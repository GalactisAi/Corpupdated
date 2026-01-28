import { FileText, BookOpen } from 'lucide-react';

interface ResourceCardProps {
  title: string;
  description: string;
  type: 'case-study' | 'whitepaper';
}

export function ResourceCard({ title, description, type }: ResourceCardProps) {
  const Icon = type === 'case-study' ? FileText : BookOpen;
  const bgColor = type === 'case-study' ? '#3D1628' : '#981239';
  
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:scale-105 transition-transform duration-200">
      <div className="p-2 rounded" style={{ backgroundColor: bgColor + '20' }}>
        <Icon className="w-4 h-4" style={{ color: bgColor }} />
      </div>
      <div>
        <p className="text-sm mb-1" style={{ color: '#3D1628' }}>{title}</p>
        <p className="text-xs" style={{ color: '#E6E8E7' }}>{description}</p>
      </div>
    </div>
  );
}