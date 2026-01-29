import { fetchArticleByDocumentId } from "@/lib/api"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Calendar, User, Tag as TagIcon, Edit } from "lucide-react"
import { formatDate } from "date-fns"
import Link from "next/link"
import DeleteArticleButton from "@/components/delete-article-button"

interface ArticlePageProps {
  params: Promise<{ documentId: string }>
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { documentId } = await params
  const article = await fetchArticleByDocumentId(documentId)

  if (!article) {
    return {
      title: "Article Not Found",
    }
  }

  return {
    title: `${article.title} - Media Hub`,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { documentId } = await params
  const article = await fetchArticleByDocumentId(documentId)

  if (!article) {
    notFound()
  }

  const formatArticleDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "Unpublished"
    try {
      return formatDate(new Date(dateString), "MMMM d, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  // Render article body content
  const renderBody = () => {
    if (!article.body || !Array.isArray(article.body)) {
      return <p className="text-slate-600">No content available.</p>
    }

    return article.body.map((block, index) => {
      if (block.type === "paragraph" && block.children) {
        return (
          <p key={index} className="mb-4 text-lg leading-relaxed text-slate-700">
            {block.children.map((child, childIndex) => {
              if (child.type === "text") {
                return <span key={childIndex}>{child.text}</span>
              }
              return null
            })}
          </p>
        )
      }
      return null
    })
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article>
        {/* Action Buttons */}
        <div className="mb-6 flex items-center justify-end gap-3">
          <Link
            href={`/creation/article/${documentId}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <DeleteArticleButton documentId={documentId} />
        </div>

        {/* Cover Image */}
        {article.coverImage?.url && (
          <div className="relative w-full h-96 mb-8 overflow-hidden rounded-lg border border-slate-200 shadow-md">
            <Image
              src={article.coverImage.url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-6 text-xl text-slate-600 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-600 border-b border-slate-200 pb-6">
          {article.metadata?.author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.metadata.author}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time>{formatArticleDate(article.metadata?.published || article.publishedAt)}</time>
          </div>
          {article.metadata?.category && (
            <div className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              <span>{article.metadata.category}</span>
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none mb-8">
          {renderBody()}
        </div>

        {/* Tags */}
        {article.metadata && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200">
            <TagIcon className="h-5 w-5 text-slate-500 mt-1" />
            {article.metadata.category && (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                {article.metadata.category}
              </span>
            )}
          </div>
        )}
      </article>
    </main>
  )
}
