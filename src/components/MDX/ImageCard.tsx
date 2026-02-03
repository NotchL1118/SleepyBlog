import Image from "next/image";

interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageCard({
  src,
  alt,
  title,
  description,
  width = 800,
  height = 400,
  className = "",
}: ImageCardProps) {
  return (
    <figure className={`my-2 ${className}`}>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700">
        <div className="relative overflow-hidden">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="h-auto w-full object-cover transition-all duration-300"
            priority={false}
          />
          {(title || description) && (
            <div className="absolute bottom-0 left-0 right-0 flex translate-y-full flex-col bg-black/70 p-3 text-white opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              {title && (
                <strong className="mb-1 line-clamp-1 translate-y-2 transform text-sm font-semibold transition-transform delay-100 duration-200 group-hover:translate-y-0">
                  {title}
                </strong>
              )}
              {description && (
                <figcaption className="line-clamp-2 translate-y-2 transform text-xs text-gray-200 transition-transform delay-150 duration-200 group-hover:translate-y-0">
                  {description}
                </figcaption>
              )}
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
