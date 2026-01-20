"use server";
import { revalidatePath } from "next/cache";
import getIdFromSlug from "../[id]/route" 

export async function POST(formData: FormData) {
  /* ======================
     1️⃣ GET FILE FROM FORM
     ====================== */
  const file = formData.get("media") as File | null;
  const urlLink = formData.get("link") as String | null;

  if ((!file || file.size === 0) && (!urlLink || urlLink === "")) {
    throw new Error("Media is required");
  }

  /* ======================
     2️⃣ UPLOAD IMAGE
     ====================== */
  const uploadForm = new FormData();
  if(file != null){uploadForm.append("files", file);}

  const imgRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: uploadForm,
    }
  );

  const imgText = await imgRes.text();

  if (!imgRes.ok) {
    throw new Error(`Image upload failed: ${imgText}`);
  }

  // Parse the response from Strapi's image upload
  let uploaded;
  try {
    uploaded = JSON.parse(imgText);
  } catch (e) {
    throw new Error(`Failed to parse upload response: ${imgText}`);
  }

  if (!Array.isArray(uploaded) || !uploaded[0] || !uploaded[0].id) {
    throw new Error("Image upload succeeded but no image ID returned");
  }
  const imageId = uploaded[0].id;

  /* ======================
     3️⃣ TAGS
     ====================== */
  const tagsRaw = (formData.get("tags") as string) || "";

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((value) => ({ value }));

  /* ======================
     4️⃣ DATE
     ====================== */
  const isoDate = new Date("2026-01-22").toISOString();

  /* ======================
     5️⃣ CREATE CONTENT
     ====================== */
  const payload = {
    data: {
      title: formData.get("title"),
      description: formData.get("description"),
      contenttype: formData.get("contentType"),
      tag: tags,
      media: imageId, // ✅ REQUIRED FIELD
      publishedAt: isoDate,
      link: formData.get("link")
    },
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}podcast-demos`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const resultText = await res.text();

  if (!res.ok) {
    throw new Error(`Create failed: ${resultText}`);
  }

  const result = JSON.parse(resultText);
  return result;
}

export async function GET(id: number) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}podcast-demos/${id}?populate=*`,
      { cache: "no-store" }
    );
  
    if (!res.ok) {
      throw new Error("Failed to fetch content");
    }
  
    return res.json();
  }
  

  export async function PUT(docId: string, formData: FormData) {
  
    if (!docId) {
      throw new Error("Content not found");
    }
  
    /* ======================
       OPTIONAL IMAGE UPLOAD
       ====================== */
    let imageId: number | undefined;
  
    // FIXED: Changed from "image" to "mediaFile" to match the form field name
    const file = formData.get("mediaFile") as File | null;
  
    if (file && file.size > 0) {
      const uploadForm = new FormData();
      uploadForm.append("files", file);
  
      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
          body: uploadForm,
        }
      );
  
      const uploaded = await uploadRes.json();
      imageId = uploaded[0].id;
    }
  
    /* ======================
       TAGS
       ====================== */
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
      .map(value => ({ value }));
  
    /* ======================
       UPDATE PAYLOAD
       ====================== */
    const payload: any = {
      data: {
        title: formData.get("title"),
        description: formData.get("description"),
        contenttype: formData.get("contentType"),
        tag: tags,
        link: formData.get("link")
      },
    };
  
    // Only update media if a new file was uploaded
    if (imageId) {
      payload.data.media = imageId;
    }
  
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}podcast-demos/${docId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  
    if (!res.ok) {
      throw new Error(await res.text());
    }

    const response = await res.json();

    revalidatePath("/");
  
    return response;
  }
  
  export async function DELETE(docId: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}podcast-demos/${docId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );
  
    if (!res.ok) {
      throw new Error("Delete failed");
    }
    
  
    revalidatePath("/"); // refresh homepage
  }