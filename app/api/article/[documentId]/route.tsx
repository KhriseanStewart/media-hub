import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}article-demos/${documentId}?populate=*`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch article" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      )
    }

    const formData = await req.formData()

    /* ======================
       OPTIONAL IMAGE UPLOAD
       ====================== */
    let imageId: number | undefined

    const file = formData.get("coverImage") as File | null

    if (file && file.size > 0) {
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
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: uploadRes.status }
        )
      }

      const uploaded = await uploadRes.json()
      const rawList = Array.isArray(uploaded) ? uploaded : uploaded?.data != null ? [uploaded.data] : []
      const firstFile = rawList[0]
      imageId = firstFile?.documentId ?? firstFile?.id
    }

    /* ======================
       TAGS
       ====================== */
    const tagsRaw = (formData.get("tags") as string) || ""
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((value) => ({ value }))

    /* ======================
       METADATA
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
       BODY
       ====================== */
    const bodyRaw = formData.get("body") as string
    let body
    try {
      body = bodyRaw ? JSON.parse(bodyRaw) : []
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
       UPDATE PAYLOAD
       ====================== */
    const payload: any = {
      data: {
        title: formData.get("title"),
        slug: formData.get("slug"),
        excerpt: formData.get("excerpt"),
        body: body,
        MetaData: metadata,
        tags: tags,
      },
    }

    // Only update coverImage if a new file was uploaded
    if (imageId) {
      payload.data.coverImage = imageId
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}article-demos/${documentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json(
        { error: `Update failed: ${errorText}` },
        { status: res.status }
      )
    }

    const response = await res.json()

    revalidatePath("/")
    revalidatePath("/articles")
    revalidatePath(`/articles/${documentId}`)

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}article-demos/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to delete article" },
        { status: res.status }
      )
    }

    revalidatePath("/")
    revalidatePath("/articles")

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    )
  }
}
