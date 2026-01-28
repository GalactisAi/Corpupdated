import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsroomCardProps {
  title: string;
  image: string;
}

export function NewsroomCard({ title, image }: NewsroomCardProps) {
  return (
    <div className="flex-1 min-w-[140px] cursor-pointer">
      <ImageWithFallback 
        src={image} 
        alt={title}
        className="w-full h-32 object-cover rounded-lg mb-2"
      />
      <p className="text-xs">{title}</p>
    </div>
  );
}
