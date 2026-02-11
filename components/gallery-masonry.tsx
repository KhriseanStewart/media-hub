import Image from "next/image"
import type { GalleryImage } from "@/lib/galleries"
import { cn } from "@/lib/utils"

type Props = {
  images: GalleryImage[]
  className?: string
  maxImages?: number
}

export function GalleryMasonry({ images, className, maxImages = 8 }: Props) {
  const slice = images.slice(0, maxImages)

  return (
    <div
      className={cn(
        "columns-2 md:columns-3 gap-x-[12px] md:gap-x-[14px]",
        className
      )}
    >
      {slice.map((img) => (
        <div
          key={img.id}
          className="mb-3 overflow-hidden rounded-xl border bg-muted/20 shadow-sm break-inside-avoid md:mb-3.5"
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            className="h-auto w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
            priority={false}
          />
        </div>
      ))}
    </div>
  )
}

