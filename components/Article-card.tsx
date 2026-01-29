import Image from "next/image"
import Link from "next/link"
import { Article } from "@/lib/api"
import { formatDate } from "date-fns"

interface MediumArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: MediumArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.documentId}`}
      className="flex flex-col max-w-md overflow-hidden rounded-lg hover:bg-muted/40 transition"
    >
      {/* Image */}
      <div className="relative w-full h-96 overflow-hidden">
        <Image
          src={article.coverImage?.url ?? "/placeholder.png"}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>


      {/* Content */}
      <div className="p-4 ">
        {/* Title */}
        <h2 className="text-lg font-bold leading-snug">
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {article.metadata?.author ?? "Staff Writer"}
          </span>

          <span>
            {article.metadata?.published
              ? formatDate(article.metadata.published, "MMM, d, yyyy")
              : "Unpublished"}
            {" • "}
            {article.metadata?.published
              ? `${Math.max(
                  1,
                  Math.ceil(
                    article.body?.length / 5
                  )
                )} min read`
              : "—"}
          </span>
        </div>
      </div>
    </Link>
  )
}
