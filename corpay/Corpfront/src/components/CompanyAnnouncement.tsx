interface CompanyAnnouncementProps {
  title: string;
  description: string;
  date: string;
  badge?: {
    text: string;
    type: 'upcoming' | 'new';
  };
  backgroundColor: string;
}

export function CompanyAnnouncement({ title, description, date, badge, backgroundColor }: CompanyAnnouncementProps) {
  const badgeStyles = badge ? {
    backgroundColor: badge.type === 'upcoming' ? '#0085C2' : '#BE1549',
    color: 'white',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: 600
  } : undefined;

  return (
    <div 
      className="p-4 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200"
      style={{ 
        backgroundColor: backgroundColor,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <p style={{ fontWeight: 600, color: '#3D1628', fontSize: '14px' }}>{title}</p>
        {badge && (
          <span style={badgeStyles}>{badge.text}</span>
        )}
      </div>
      <p style={{ fontWeight: 400, color: '#E6E8E7', fontSize: '14px', marginBottom: '4px' }}>{date}</p>
      <p style={{ fontWeight: 400, color: '#3D1628', fontSize: '14px' }}>{description}</p>
    </div>
  );
}