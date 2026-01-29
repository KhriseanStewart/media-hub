import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    /* ======================
       1️⃣ GET FILE FROM FORM
       ====================== */
    const file = formData.get("coverImage") as File | null
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Cover image is required" },
        { status: 400 }
      )
    }

    /* ======================
       2️⃣ UPLOAD IMAGE
       ====================== */
    const uploadForm = new FormData()
    uploadForm.append("files", file)

    const imgRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: uploadForm,
    })

    const imgText = await imgRes.text()

    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Image upload failed: ${imgText}` },
        { status: imgRes.status }
      )
    }

    // Parse the response from Strapi's image upload
    let uploaded
    try {
      uploaded = JSON.parse(imgText)
    } catch (e) {
      return NextResponse.json(
        { error: `Failed to parse upload response: ${imgText}` },
        { status: 500 }
      )
    }

    if (!Array.isArray(uploaded) || !uploaded[0] || !uploaded[0].id) {
      return NextResponse.json(
        { error: "Image upload succeeded but no image ID returned" },
        { status: 500 }
      )
    }

    const imageId = uploaded[0].id

    /* ======================
       3️⃣ TAGS
       ====================== */
    const tagsRaw = (formData.get("tags") as string) || ""
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((value) => ({ value }))

    /* ======================
       4️⃣ METADATA
       ====================== */
    const metadataRaw = formData.get("metadata") as string
    let metadata
    try {
      metadata = metadataRaw ? JSON.parse(metadataRaw) : {}
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid metadata format" },
        { status: 400 }
      )
    }

    /* ======================
       5️⃣ CREATE CONTENT
       ====================== */
    const payload = {
      data: {
        title: formData.get("title"),
        slug: formData.get("slug"),
        body: formData.get("body"),
        excerpt: formData.get("excerpt"),
        coverImage: imageId,
        MetaData: metadata,
        tags: tags,
      },
    }

    console.log("Sending payload:", JSON.stringify(payload, null, 2))

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}article-demos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    const resultText = await res.text()

    if (!res.ok) {
      return NextResponse.json(
        { error: `Create failed: ${resultText}` },
        { status: res.status }
      )
    }

    const result = JSON.parse(resultText)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    )
  }
}