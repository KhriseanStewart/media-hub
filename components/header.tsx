import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors"
          >
            Media Hub
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/creation/school-posts/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Add post
            </Link>
            <Link
              href="/galleries/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Add Gallery
            </Link>
            <Link
              href="/creation/article/new"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Add Article
            </Link>
            <Link
              href="/podcasts"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Podcasts
            </Link>
            <Link
              href="/videos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Videos
            </Link>
            <Link
              href="/articles"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Articles
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
