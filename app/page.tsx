import { fetchArticle, fetchContent } from "@/lib/api"
import { ContentGrid } from "@/components/content-grid"
import ArticleGrid from "@/components/Article-grid";
import { GallerySection } from "@/components/gallery-section"

export default async function HomePage() {
  const content = await fetchContent();
  const article = await fetchArticle()

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
          Latest Content
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
          Discover our collection of podcasts, videos, and articles covering technology, design, and development.
        </p>
      </div>

      <ContentGrid content={content} />
      <br />
      <br />
      <ArticleGrid article={article} />

      <GallerySection />
    </main>
  )
}
