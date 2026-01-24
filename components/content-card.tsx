"use client"

import Link from "next/link"
import type { Content } from "@/lib/api"
import { Mic, Video, FileText, Trash, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { DELETE } from "@/app/api/content/route"

interface ContentCardProps {
  content: Content
}

export function ContentCard({ content }: ContentCardProps) {
  const router = useRouter();
  const Icon = content.contentType === "podcast" ? Mic : content.contentType === "video" ? Video : FileText

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function removeContent() {
    return router.push(`/creation/${content.id}/edit`)
  }

  return (
    <Link href={`/content/${content.slug}`} className="group block">
      <article className="h-full rounded-lg border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm">
      <div className="flex justify-between">
        <div className="mb-4 flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {content.contentType}
          </span>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Trash className="" onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await DELETE(content.documentId);
          }}/>
          
          <Edit className="" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/creation/school-posts/${content.documentId}/edit`);
            }}/>
        </div>
      </div>

        <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-foreground/80 transition-colors text-balance">
          {content.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground text-pretty">{content.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {!content && <br />}

          {content.tag?.map((t) => {
            return (
            <span
              key={t.id}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {t.value}
            </span>
          )})}
        </div>

        <time className="text-xs text-muted-foreground">{formatDate(content.publishedAt)}</time>
      </article>
    </Link>
  )
}
