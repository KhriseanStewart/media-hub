"use client"

import { useState } from "react"
import { Upload, X, Tag, Calendar, User, FileText, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/components/rich-text-editor"
import { htmlToContentBlocks } from "@/lib/content-blocks"

const API_URL = "/api/article/create"

export default function CreateArticlePage() {
  const router = useRouter()
  
  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [excerpt, setExcerpt] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("")
  const [published, setPublished] = useState("")
  const [body, setBody] = useState("")
  const [bodyImageMap, setBodyImageMap] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Tags state
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  
  // Image state
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Convert title to slug format
  const titleToSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    // Auto-generate slug only if it hasn't been manually edited
    if (!slugManuallyEdited) {
      setSlug(titleToSlug(newTitle))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value)
    setSlugManuallyEdited(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setCoverImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl("")
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      alert("Please enter a title")
      return false
    }
    if (!slug.trim()) {
      alert("Please enter a slug")
      return false
    }
    return true
  }

  const resetForm = () => {
    setTitle("")
    setSlug("")
    setExcerpt("")
    setBody("")
    setBodyImageMap({})
    setAuthor("")
    setCategory("")
    setPublished("")
    setTags([])
    setCoverImage(null)
    setPreviewUrl("")
  }

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!coverImage) {
      alert("Please upload a cover image")
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare article data
      const publishedDate = published
        ? new Date(published).toISOString()
        : new Date().toISOString()

      const metadataObj = {
        author: author || "",
        category: category || "",
        published: publishedDate,
      }

      // Convert HTML from rich text editor to Strapi ContentBlock format (bodyImageMap supplies full media for images)
      const bodyArray = body ? htmlToContentBlocks(body, bodyImageMap) : []

      // Create FormData matching the API structure
      const formData = new FormData()
      formData.append("title", title)
      formData.append("slug", slug)
      formData.append("excerpt", excerpt || "")
      formData.append("body", JSON.stringify(bodyArray))
      formData.append("coverImage", coverImage)
      formData.append("metadata", JSON.stringify(metadataObj))
      formData.append("tags", tags.join(","))

      // Submit article
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Error response:", data)
        alert(`Failed to create article: ${data.error || JSON.stringify(data)}`)
        return
      }

      alert("Article published successfully!")
      resetForm()
      router.push("/")
    } catch (error) {
      console.error("Submit error:", error)
      alert("An error occurred while publishing")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Create New Article
          </h1>
          <p className="text-slate-600">Share your thoughts with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Cover Image
            </label>

            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mb-3" />
                <span className="text-sm font-medium text-slate-600">
                  Click to upload cover image
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  PNG, JPG up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Title & Slug */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Article Title *
              </label>
              <input
                required
                type="text"
                placeholder="Enter a compelling title..."
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder:text-slate-400"
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL Slug *
              </label>
              <input
                required
                type="text"
                placeholder="article-url-slug"
                className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder:text-slate-400 font-mono text-sm"
                value={slug}
                onChange={handleSlugChange}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Excerpt
            </label>
            <textarea
              placeholder="Write a brief summary of your article..."
              className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder:text-slate-400 resize-none"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Article Content
            </label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your article here..."
              onImageUploaded={(url, media) => setBodyImageMap((prev) => ({ ...prev, [url]: media }))}
            />
          </div>

          {/* Metadata Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Metadata
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Author
                </label>
                <input
                  type="text"
                  placeholder="Author name"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder:text-slate-400"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technology, Lifestyle"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder:text-slate-400"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Publication Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900"
                  value={published}
                  onChange={(e) => setPublished(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a tag..."
                className="flex-1 border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-slate-900 placeholder:text-slate-400"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publishing..." : "Publish Article"}
            </button>
            <button
              type="button"
              onClick={() => alert("Draft saved!")}
              className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}