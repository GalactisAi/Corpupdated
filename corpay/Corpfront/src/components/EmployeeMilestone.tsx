import { ImageWithFallback } from './figma/ImageWithFallback';

interface EmployeeMilestoneProps {
  name: string;
  description: string;
  avatar: string;
  borderColor: string;
  backgroundColor: string;
}

export function EmployeeMilestone({ name, description, avatar, borderColor, backgroundColor }: EmployeeMilestoneProps) {
  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
      style={{ 
        borderLeft: `5px solid ${borderColor}`,
        backgroundColor: backgroundColor,
        boxShadow: '0px 3px 12px rgba(0,0,0,0.06)'
      }}
    >
      {/* Hover gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${borderColor} 0%, transparent 100%)` }}
      />
      
      <div className="relative">
        <ImageWithFallback 
          src={avatar} 
          alt={name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
        />
        {/* Badge indicator */}
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: borderColor }}
        />
      </div>
      
      <div className="flex-1">
        <p style={{ fontWeight: 700, color: '#3D1628', fontSize: '15px', marginBottom: '2px' }}>{name}</p>
        <p style={{ fontWeight: 500, color: '#7a7a7a', fontSize: '13px' }}>{description}</p>
      </div>
      
      {/* Celebration icon */}
      <div className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
        <span style={{ color: borderColor, fontSize: '20px' }}>🎉</span>
      </div>
    </div>
  );
}