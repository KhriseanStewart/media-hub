import React from 'react'
import ArticleCard from './Article-card'
import { Article, Content } from '@/lib/api'

interface ArticleData {
    article: Article[]
}

export default function ArticleGrid({ article }: ArticleData) {
  if (article.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">No content found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {article.map((item) => (
        <ArticleCard key={item.documentId} article={item}/>
      ))}
    </div>
  )
}
