import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">Content Not Found</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        {"The content you're looking for doesn't exist or has been removed."}
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </main>
  )
}
