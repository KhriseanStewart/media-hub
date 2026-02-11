"use client"

import * as React from "react"
import Image from "next/image"

import type { GalleryImage } from "@/lib/galleries"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Props = {
  images: GalleryImage[]
  intervalMs?: number
  className?: string
}

export function GalleryViewer({ images, intervalMs = 2400, className }: Props) {
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  const count = images.length

  const goTo = React.useCallback(
    (next: number) => {
      if (count === 0) return
      const normalized = ((next % count) + count) % count
      setIndex(normalized)
    },
    [count]
  )

  const next = React.useCallback(() => goTo(index + 1), [goTo, index])
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index])

  React.useEffect(() => {
    if (paused) return
    if (count <= 1) return

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, intervalMs)

    return () => window.clearInterval(t)
  }, [count, intervalMs, paused])

  if (count === 0) return null

  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative overflow-hidden rounded-2xl border bg-muted/20"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-[420px] w-full sm:h-[520px] lg:h-[620px]">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={cn(
                "absolute inset-0 transition-all duration-700",
                i === index ? "opacity-100 scale-100" : "opacity-0 scale-[1.01]"
              )}
              aria-hidden={i !== index}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority={i === index}
              />
            </div>
          ))}

          <div className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
            {index + 1} / {count}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-background/50 px-4 py-3 backdrop-blur">
          <div className="text-xs text-muted-foreground">
            {paused ? "Paused" : "Playing"} • Hover to pause
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={prev}>
              Prev
            </Button>
            <Button variant="secondary" size="sm" onClick={next}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "relative aspect-4/3 overflow-hidden rounded-lg border bg-muted/20 transition",
              i === index
                ? "ring-2 ring-ring"
                : "opacity-90 hover:opacity-100"
            )}
            aria-label={`Go to image ${i + 1}`}
          >
            <Image
              src={img.src}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

