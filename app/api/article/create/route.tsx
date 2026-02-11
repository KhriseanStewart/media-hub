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

    const rawList = Array.isArray(uploaded) ? uploaded : uploaded?.data != null ? [uploaded.data] : []
    const firstFile = rawList[0]
    const imageId = firstFile?.documentId ?? firstFile?.id
    if (!firstFile || (imageId == null && imageId !== 0)) {
      return NextResponse.json(
        { error: "Image upload succeeded but no image ID/documentId returned" },
        { status: 500 }
      )
    }

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
       5️⃣ BODY
       ====================== */
    const bodyRaw = formData.get("body") as string
    let body

    // console.log("Body raw:", bodyRaw);
    // console.log("Body raw type:", JSON.parse(bodyRaw));
    
    try {
      body = bodyRaw ? JSON.parse(bodyRaw) : []
      console.log("Body:", body)
      // Validate it's an array
      if (!Array.isArray(body)) {
        return NextResponse.json(
          { error: "Body must be an array" },
          { status: 400 }
        )
      }
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid body format" },
        { status: 400 }
      )
    }

    /* ======================
       6️⃣ CREATE CONTENT
       ====================== */
    const payload = {
      data: {
        title: formData.get("title"),
        slug: formData.get("slug"),
        body: body, // Send as JSON string
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