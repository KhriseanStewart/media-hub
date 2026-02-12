export async function uploadImageToStrapi(file: File) {
    if (!file || file.size === 0) {
      throw new Error("No file provided for upload");
    }
  
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
  
    const uploadText = await uploadRes.text();
  
    if (!uploadRes.ok) {
      throw new Error(`Image upload failed: ${uploadText}`);
    }
  
    let uploaded;
    try {
      uploaded = JSON.parse(uploadText);
    } catch {
      throw new Error(`Failed to parse upload response: ${uploadText}`);
    }
  
    if (!Array.isArray(uploaded) || !uploaded[0]?.id) {
      throw new Error("Upload succeeded but no image ID returned");
    }
  
    return {
      imageId: uploaded[0].id,
      fullResponse: uploaded[0],
    };
  }
  