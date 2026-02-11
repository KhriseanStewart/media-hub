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

  // Render article body content with formatting
  const renderBody = () => {
    if (!article.body || !Array.isArray(article.body)) {
      return <p className="text-slate-600">No content available.</p>
    }

    return article.body.map((block, index) => {
      // Type assertion for block with any structure
      const blockAny = block as any

      if (block.type === "paragraph" && block.children) {
        return (
          <p key={index} className="mb-4 text-lg leading-relaxed text-slate-700">
            {block.children.map((child: any, childIndex: number) => {
              const text = child.text || ""
              let content: React.ReactNode = text

              // Apply formatting marks (if they exist)
              if (child.marks && Array.isArray(child.marks)) {
                child.marks.forEach((mark: any) => {
                  if (mark.type === "bold") {
                    content = <strong>{content}</strong>
                  } else if (mark.type === "italic") {
                    content = <em>{content}</em>
                  } else if (mark.type === "underline") {
                    content = <u>{content}</u>
                  }
                })
              }

              return <span key={childIndex}>{content}</span>
            })}
          </p>
        )
      } else if (block.type === "h1") {
        const text = blockAny.children?.map((c: any) => c.text || "").join("") || ""
        return (
          <h1 key={index} className="mb-4 mt-6 text-2xl font-bold text-slate-900">
            {text}
          </h1>
        )
      } else if (block.type === "h2") {
        const text = blockAny.children?.map((c: any) => c.text || "").join("") || ""
        return (
          <h2 key={index} className="mb-4 mt-6 text-2xl font-bold text-slate-900">
            {text}
          </h2>
        )
      } else if (block.type === "h3") {
        const text = blockAny.children?.map((c: any) => c.text || "").join("") || ""
        return (
          <h3 key={index} className="mb-4 mt-6 text-xl font-bold text-slate-900">
            {text}
          </h3>
        )
      } else if (block.type === "heading") {
        const level = blockAny.level || 1
        const text = blockAny.children?.map((c: any) => c.text || "").join("") || ""
        const headingClass = "mb-4 mt-6 font-bold text-slate-900"
        if (level === 1) {
          return <h1 key={index} className={`${headingClass} text-2xl`}>{text}</h1>
        } else if (level === 2) {
          return <h2 key={index} className={`${headingClass} text-2xl`}>{text}</h2>
        } else if (level === 3) {
          return <h3 key={index} className={`${headingClass} text-xl`}>{text}</h3>
        }
        return <h2 key={index} className={`${headingClass} text-2xl`}>{text}</h2>
      } else if (block.type === "list-item") {
        const text = blockAny.children?.map((c: any) => c.text || "").join("") || ""
        return (
          <li key={index} className="mb-2 text-lg leading-relaxed text-slate-700">
            {text}
          </li>
        )
      } else if (block.type === "image") {
        const img = blockAny.image || blockAny
        const url = img?.url
        const alt = img?.alternativeText || img?.alt || ""
        if (!url) return null
        return (
          <span key={index} className="my-4 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4"
            />
          </span>
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
