"use client"

import { useEffect, useRef } from "react"
import pell from "pell"
import { contentBlocksToHtml } from "@/lib/content-blocks"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Called when an image is uploaded so the parent can store full Strapi media for body blocks */
  onImageUploaded?: (url: string, media: Record<string, unknown>) => void
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article here...",
  onImageUploaded,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const pellInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Initialize pell editor with full toolbar
    const editor = pell.init({
      element: editorRef.current,
      onChange: (html: string) => {
        onChange(html)
      },
      defaultParagraphSeparator: "div",
      styleWithCSS: true,
      actions: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "heading1",
        "heading2",
        "paragraph",
        "quote",
        "olist",
        "ulist",
        "code",
        "line",
        "link",
        "image",
      ],
      classes: {
        actionbar: "pell-actionbar",
        button: "pell-button",
        content: "pell-content",
        selected: "pell-button-selected",
      },
    })

    pellInstanceRef.current = editor

    // Override the image button to use our custom upload
    const imageButton = editorRef.current.querySelector(
      '.pell-button[title="Image"]'
    ) as HTMLButtonElement

    if (imageButton) {
      // Remove the default click handler
      const newButton = imageButton.cloneNode(true) as HTMLButtonElement
      imageButton.parentNode?.replaceChild(newButton, imageButton)

      // Add custom upload handler
      newButton.onclick = () => {
        const input = document.createElement("input")
        input.setAttribute("type", "file")
        input.setAttribute("accept", "image/*")
        input.click()

        input.onchange = async () => {
          const file = input.files?.[0]
          if (!file) return

          try {
            // Upload image to Strapi
            const formData = new FormData()
            formData.append("file", file)

            const uploadRes = await fetch("/api/image", {
              method: "POST",
              body: formData,
            })

            if (!uploadRes.ok) {
              alert("Failed to upload image")
              return
            }

            const data = await uploadRes.json()
            const imageUrl = data.url || data.data?.url
            const media = data.media || data.data

            if (imageUrl && editor.content) {
              editor.content.focus()
              document.execCommand("insertImage", false, imageUrl)
              // Store full Strapi media on the inserted img so body blocks pass validation
              const imgs = editor.content.getElementsByTagName("img")
              const lastImg = imgs[imgs.length - 1]
              if (lastImg && media && typeof media === "object") {
                lastImg.setAttribute("data-strapi-media", JSON.stringify(media))
              }
              onImageUploaded?.(imageUrl, media)
            } else {
              alert("Image uploaded but URL not returned")
            }
          } catch (error) {
            console.error("Image upload error:", error)
            alert("Failed to upload image")
          }
        }
      }
    }

    // Set initial content
    if (value) {
      editor.content.innerHTML = value
    }

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }
    }
  }, []) // Only run once on mount

  // Update content when value prop changes (but not from user input)
  useEffect(() => {
    if (pellInstanceRef.current && pellInstanceRef.current.content) {
      const currentHtml = pellInstanceRef.current.content.innerHTML
      if (value !== currentHtml) {
        pellInstanceRef.current.content.innerHTML = value || ""
      }
    }
  }, [value])

  return (
    <div className="rich-text-editor border border-slate-300 rounded-lg bg-white overflow-hidden">
      <div
        ref={editorRef}
        className="pell-editor-wrapper"
        style={{ minHeight: "300px" }}
      />
      <style jsx global>{`
        .pell {
          border: none;
          border-radius: 0.5rem;
        }
        .pell-actionbar {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .pell-button {
          background-color: white;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          transition: all 0.2s;
        }
        .pell-button:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
        }
        .pell-button-selected {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .pell-content {
          outline: none;
          padding: 1rem;
          min-height: 300px;
          font-size: 1rem;
          line-height: 1.75;
          color: #1e293b;
        }
        .pell-content:empty:before {
          content: "${placeholder}";
          color: #94a3b8;
        }
        .pell-content p {
          margin: 0.5rem 0;
        }
        .pell-content h1,
        .pell-content h2,
        .pell-content h3 {
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .pell-content h1 {
          font-size: 2rem;
        }
        .pell-content h2 {
          font-size: 1.5rem;
        }
        .pell-content h3 {
          font-size: 1.25rem;
        }
        .pell-content ul,
        .pell-content ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .pell-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .pell-content code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .pell-content blockquote {
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #64748b;
          font-style: italic;
        }
        .pell-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  )
}
