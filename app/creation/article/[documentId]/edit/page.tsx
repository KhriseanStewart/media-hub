import { fetchArticleByDocumentId } from "@/lib/api"
import { notFound } from "next/navigation"
import EditArticleForm from "./EditArticleForm"

interface EditPageProps {
  params: Promise<{ documentId: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { documentId } = await params
  const article = await fetchArticleByDocumentId(documentId)

  if (!article) {
    notFound()
  }

  // Extract body text from content blocks
  const bodyText = article.body
    ? article.body
        .map((block) => {
          if (block.type === "paragraph" && block.children) {
            return block.children
              .map((child) => child.text)
              .join("")
          }
          return ""
        })
        .join("\n\n")
    : ""

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string | Date | undefined) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      // Convert to local datetime string format (YYYY-MM-DDTHH:mm)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ""
    }
  }

  // Extract tags
  const tags: string[] = [] // Articles don't have tags in the current structure, but we'll support it

  const articleData = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || "",
    body: bodyText,
    author: article.metadata?.author || "",
    category: article.metadata?.category || "",
    published: formatDateForInput(article.metadata?.published || article.publishedAt),
    tags: tags,
    coverImageUrl: article.coverImage?.url || "",
  }

  return <EditArticleForm documentId={documentId} article={articleData} />
}
