import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Upload to Strapi
    const uploadForm = new FormData()
    uploadForm.append("files", file)

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: uploadForm,
      }
    )

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text()
      return NextResponse.json(
        { error: `Upload failed: ${errorText}` },
        { status: uploadRes.status }
      )
    }

    const uploaded = await uploadRes.json()

    // Strapi 5 returns array of files; support both Strapi 4 (id) and Strapi 5 (documentId)
    const rawList = Array.isArray(uploaded) ? uploaded : uploaded?.data != null ? [uploaded.data] : []
    const imageData = rawList[0]
    if (!imageData) {
      return NextResponse.json(
        { error: "Invalid upload response" },
        { status: 500 }
      )
    }

    const fileId = imageData.documentId ?? imageData.id
    const imageUrl = imageData.url
      ? `${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL || ""}${imageData.url}`
      : imageData.url

    // Fetch full file so body blocks pass validation (Strapi 5: name, width, height, formats, hash, ext, mime, size, provider, createdAt, updatedAt)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    const fileRes = await fetch(`${baseUrl.replace(/\/$/, "")}/upload/files/${fileId}`, {
      headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    })
    let fullMedia = imageData
    if (fileRes.ok) {
      const fileJson = await fileRes.json()
      fullMedia = fileJson?.data ?? fileJson
    }

    return NextResponse.json({
      url: imageUrl,
      id: fileId,
      documentId: imageData.documentId ?? fileId,
      media: fullMedia,
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
