import { Linkedin, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LinkedInPostCardProps {
  author: string;
  timeAgo: string;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  isCorpayBrand?: boolean;
}

export function LinkedInPostCard({ author, timeAgo, content, image, likes = 0, comments = 0, isCorpayBrand = false }: LinkedInPostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 flex-shrink-0 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
            background: isCorpayBrand 
              ? 'linear-gradient(135deg, #981239 0%, #BE1549 100%)' 
              : 'linear-gradient(135deg, #0085C2 0%, #006ba1 100%)'
          }}>
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: '#3D1628', fontWeight: 600 }}>{author}</p>
            <p className="text-xs" style={{ color: '#999' }}>{timeAgo}</p>
          </div>
        </div>
        
        {/* Content */}
        <p className="text-sm leading-relaxed" style={{ color: '#3D1628' }}>{content}</p>
      </div>
      
      {/* Image */}
      {image && (
        <div className="relative overflow-hidden">
          <ImageWithFallback 
            src={image} 
            alt="LinkedIn post image"
            className="w-full h-40 object-cover"
          />
        </div>
      )}
      
      {/* Engagement Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-600 hover:text-[#981239] transition-colors cursor-pointer">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span style={{ fontWeight: 500 }}>{likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 hover:text-[#981239] transition-colors cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5" />
              <span style={{ fontWeight: 500 }}>{comments}</span>
            </div>
          </div>
          <div className="text-gray-600 hover:text-[#981239] transition-colors cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}