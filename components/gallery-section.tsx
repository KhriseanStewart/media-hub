import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { galleries } from "@/lib/galleries"
import { GalleryMasonry } from "@/components/gallery-masonry"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function GallerySection() {
  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Galleries</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Pinterest-style boards. Click a gallery to view it as an auto-cycling
            slideshow.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {galleries.map((g) => (
          <Link
            key={g.slug}
            href={`/galleries/${g.slug}`}
            className="group block"
          >
            <Card className="h-full transition-colors group-hover:bg-muted/20">
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{g.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {g.description}
                    </CardDescription>
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    View <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <GalleryMasonry images={g.images} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

