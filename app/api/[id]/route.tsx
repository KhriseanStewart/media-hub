export async function getContentById(docId: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}podcast-demos/${docId}`,
      { cache: "no-store" }
    );
  
    if (!res.ok) {
      throw new Error("Failed to fetch content");
    }
  
    return res.json();
  }
  
  async function getIdFromSlug(docId: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}podcast-demos/${docId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );
  
    const json = await res.json();
    return json.data?.[0]?.id;
  }

  export default getIdFromSlug;
  