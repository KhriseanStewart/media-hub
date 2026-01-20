import { fetchContent } from "@/lib/api"
import { ContentGrid } from "@/components/content-grid"

export const metadata = {
  title: "Podcasts - Media Hub",
  description: "Listen to our latest podcast episodes",
}

export default async function PodcastsPage() {
  const podcasts = await fetchContent("podcast")

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Podcasts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
          Listen to insightful conversations and deep dives into technology and development topics.
        </p>
      </div>

      <ContentGrid content={podcasts} />
    </main>
  )
}
