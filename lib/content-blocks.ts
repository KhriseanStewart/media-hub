// Utility functions for converting between HTML and Strapi ContentBlock format
// These can be used in both client and server components

// Optional map: image URL -> full Strapi media object (for validation: name, width, height, formats, hash, ext, mime, size, etc.)
export function htmlToContentBlocks(html: string, imageMetadataMap?: Record<string, any>) {
  if (!html || html.trim() === "") return []

  // Check if we're in a browser environment
  if (typeof document === "undefined") {
    // Fallback for SSR - return simple paragraph
    const plainText = html.replace(/<[^>]*>/g, "").trim()
    if (plainText) {
      return [
        {
          type: "paragraph",
          children: [{ type: "text", text: plainText }],
        },
      ]
    }
    return []
  }

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  const blocks: any[] = []

  // Helper to extract plain text from an element (removes all HTML tags)
  const getPlainText = (element: HTMLElement): string => {
    return element.textContent?.trim() || ""
  }

  // Helper: emit blocks from an element that may contain text and/or images in order
  const pushBlocksFromElement = (element: HTMLElement, defaultType: "paragraph" | "h1" | "h2" | "h3") => {
    const imgs = element.querySelectorAll("img")
    if (imgs.length === 0) {
      const text = getPlainText(element)
      if (text) {
        blocks.push({
          type: defaultType,
          children: [{ type: "text", text }],
        })
      }
      return
    }
    // Walk child nodes in order: text -> paragraph, img -> image block
    let textBuffer = ""
    const flushText = () => {
      const t = textBuffer.trim()
      if (t) {
        blocks.push({
          type: defaultType,
          children: [{ type: "text", text: t }],
        })
      }
      textBuffer = ""
    }
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        textBuffer += child.textContent || ""
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (el.tagName.toLowerCase() === "img") {
          flushText()
          const src = el.getAttribute("src")
          if (src) {
            const mediaJson = el.getAttribute("data-strapi-media")
            const media = mediaJson ? (() => { try { return JSON.parse(mediaJson) } catch { return null } })() : (imageMetadataMap?.[src] ?? null)
            const imagePayload = media && typeof media === "object" && (media.name != null || media.url != null)
              ? media
              : { url: src, alternativeText: el.getAttribute("alt") || "" }
            blocks.push({
              type: "image",
              image: imagePayload,
              children: [],
            })
          }
        } else {
          textBuffer += getPlainText(el)
        }
      }
    })
    flushText()
  }

  // Process each top-level element
  Array.from(tempDiv.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        blocks.push({
          type: "paragraph",
          children: [{ type: "text", text }],
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()

      if (tagName === "img") {
        const src = element.getAttribute("src")
        if (src) {
          const mediaJson = element.getAttribute("data-strapi-media")
          const media = mediaJson ? (() => { try { return JSON.parse(mediaJson) } catch { return null } })() : (imageMetadataMap?.[src] ?? null)
          const imagePayload = media && typeof media === "object" && (media.name != null || media.url != null)
            ? media
            : { url: src, alternativeText: element.getAttribute("alt") || "" }
          blocks.push({
            type: "image",
            image: imagePayload,
            children: [],
          })
        }
      } else if (tagName === "p" || tagName === "div") {
        pushBlocksFromElement(element, "paragraph")
      } else if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
        pushBlocksFromElement(element, tagName as "h1" | "h2" | "h3")
      } else if (tagName === "ul" || tagName === "ol") {
        const listItems = element.querySelectorAll("li")
        listItems.forEach((li) => {
          const text = getPlainText(li)
          if (text) {
            blocks.push({
              type: "list-item",
              children: [{ type: "text", text }],
            })
          }
        })
      }
    }
  })

  // If no blocks created, create a paragraph with the plain text
  if (blocks.length === 0 && html.trim()) {
    const plainText = html.replace(/<[^>]*>/g, "").trim()
    if (plainText) {
      blocks.push({
        type: "paragraph",
        children: [{ type: "text", text: plainText }],
      })
    }
  }

  return blocks
}

// Convert Strapi ContentBlock format to HTML
export function contentBlocksToHtml(blocks: any[]): string {
  if (!blocks || blocks.length === 0) return ""

  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        const text = block.children
          ?.map((child: any) => {
            let text = child.text || ""
            if (child.marks) {
              child.marks.forEach((mark: any) => {
                if (mark.type === "bold") {
                  text = `<strong>${text}</strong>`
                } else if (mark.type === "italic") {
                  text = `<em>${text}</em>`
                } else if (mark.type === "underline") {
                  text = `<u>${text}</u>`
                }
              })
            }
            return text
          })
          .join("") || ""
        return `<p>${text}</p>`
      } else if (block.type === "heading") {
        const level = block.level || 1
        const text = block.children?.map((c: any) => c.text || "").join("") || ""
        return `<h${level}>${text}</h${level}>`
      } else if (block.type === "h1" || block.type === "h2" || block.type === "h3") {
        const text = block.children?.map((c: any) => c.text || "").join("") || ""
        return `<${block.type}>${text}</${block.type}>`
      } else if (block.type === "list-item") {
        const text = block.children?.map((c: any) => c.text || "").join("") || ""
        return `<li>${text}</li>`
      } else if (block.type === "image") {
        const img = block.image || block
        const url = img.url || ""
        const alt = (img.alternativeText || img.alt || "").replace(/"/g, "&quot;")
        if (!url) return ""
        return `<img src="${url.replace(/"/g, "&quot;")}" alt="${alt}" />`
      }
      return ""
    })
    .join("")
}
