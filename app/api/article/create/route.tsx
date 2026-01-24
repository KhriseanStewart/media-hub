export const runtime = "nodejs"
import { NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "http://localhost:1337/api/article-demos"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const dataString = formData.get("data") as string
    const coverImage = formData.get("files.coverImage") as File | null

    // Use mock data for testing, or real data if available
    const USE_MOCK = false // Set to true to test with mock data
    
    let jsonData
    if (USE_MOCK) {
      jsonData = {
        title: "Mock Test Article",
        slug: "mock-test-article",
        excerpt: "This is a mock article",
        body: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Mock body content" }]
          }
        ],
        MetaData: {
          author: "Test Author",
          category: "testing",
          published: new Date().toISOString()
        },
        tags: [{ value: "mock" }, { value: "test" }]
      }
    } else {
      if (!dataString) {
        return NextResponse.json(
          { error: "FormData missing data field" },
          { status: 400 }
        )
      }
      jsonData = JSON.parse(dataString)
    }

    console.log("SENDING DATA:", JSON.stringify(jsonData, null, 2))
    console.log("HAS IMAGE:", !!coverImage)

    let res

    if (coverImage && !USE_MOCK) {
      // WITH FILE: Use FormData
      const arrayBuffer = await coverImage.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`
      const parts: Buffer[] = []
      
      parts.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="data"\r\n\r\n` +
        `${JSON.stringify(jsonData)}\r\n`
      ))
      
      parts.push(Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="files.coverImage"; filename="${coverImage.name}"\r\n` +
        `Content-Type: ${coverImage.type}\r\n\r\n`
      ))
      parts.push(buffer)
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))
      
      const body = Buffer.concat(parts)

      res = await fetch(`${STRAPI_URL}?populate=*`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      })
    } else {
      // WITHOUT FILE: Use JSON
      res = await fetch(`${STRAPI_URL}?populate=*`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: jsonData }),
      })
    }

    const text = await res.text()
    console.log("STRAPI STATUS:", res.status)
    console.log("STRAPI RESPONSE:", text)

    let responseData
    try {
      responseData = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: "Invalid response from Strapi", raw: text },
        { status: res.status }
      )
    }

    return NextResponse.json(responseData, { status: res.status })
    
  } catch (err) {
    console.error("API ROUTE ERROR:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    )
  }
}