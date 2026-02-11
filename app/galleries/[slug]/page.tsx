import Link from "next/link"
import { notFound } from "next/navigation"

import { getGallery } from "@/lib/galleries"
import { GalleryViewer } from "@/components/gallery-viewer"
import { GalleryMasonry } from "@/components/gallery-masonry"

type PageProps = {
  params: { slug: string }
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = params
  const gallery = getGallery(slug)

  if (!gallery) notFound()

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back home
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {gallery.title}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {gallery.description}
          </p>
        </div>
      </div>

      <GalleryViewer images={gallery.images} />

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">All images</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pinterest-style masonry layout.
        </p>

        <div className="mt-6">
          <GalleryMasonry images={gallery.images} className="md:columns-4" />
        </div>
      </section>
    </main>
  )
}

