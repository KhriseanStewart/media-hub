import type { Content } from "@/lib/api"
import { ContentCard } from "./content-card"

interface ContentGridProps {
  content: Content[]
}

export function ContentGrid({ content }: ContentGridProps) {
  if (content.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No content found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {content.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  )
}
