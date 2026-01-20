import { fetchContent } from "@/lib/api"
import { ContentGrid } from "@/components/content-grid"

export const metadata = {
  title: "Videos - Media Hub",
  description: "Watch our latest video tutorials and guides",
}

export default async function VideosPage() {
  const videos = await fetchContent("video")

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Videos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
          Watch comprehensive tutorials, guides, and demonstrations on various development topics.
        </p>
      </div>

      <ContentGrid content={videos} />
    </main>
  )
}
