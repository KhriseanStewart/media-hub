import { Gallery } from "@/lib/galleries"

export async function createGallery(gallery: Gallery) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}/api/gallery-setup`, {
    method: 'POST',
    body: JSON.stringify(gallery),
  })
  return response.json()
}

export async function getGallery(){
  try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}/api/gallery-setups`);
    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }
    const data = await response.json();
    console.log('Gallery data:', data);
    return data;
  } catch(error){
    console.error('Error fetching gallery:', error);
    return null;
  }
}