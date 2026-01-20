import { fetchContent } from "@/lib/api"
import { ContentGrid } from "@/components/content-grid"

export const metadata = {
  title: "Articles - Media Hub",
  description: "Read our latest articles and blog posts",
}

export default async function ArticlesPage() {
  const articles = await fetchContent("article")

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Articles</h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
          Read in-depth articles and guides on best practices, patterns, and technologies.
        </p>
      </div>

      <ContentGrid content={articles} />
    </main>
  )
}
