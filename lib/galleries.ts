export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Gallery = {
  slug: string;
  title: string;
  description: string;
  images: GalleryImage[];
};

const demoImages: GalleryImage[] = [
  {
    id: "01",
    src: "/demo-galleries/01.svg",
    alt: "Abstract demo image 01",
    width: 800,
    height: 1200,
  },
  {
    id: "02",
    src: "/demo-galleries/02.svg",
    alt: "Abstract demo image 02",
    width: 900,
    height: 700,
  },
  {
    id: "03",
    src: "/demo-galleries/03.svg",
    alt: "Abstract demo image 03",
    width: 800,
    height: 1000,
  },
  {
    id: "04",
    src: "/demo-galleries/04.svg",
    alt: "Abstract demo image 04",
    width: 900,
    height: 1200,
  },
  {
    id: "05",
    src: "/demo-galleries/05.svg",
    alt: "Abstract demo image 05",
    width: 900,
    height: 650,
  },
  {
    id: "06",
    src: "/demo-galleries/06.svg",
    alt: "Abstract demo image 06",
    width: 800,
    height: 900,
  },
  {
    id: "07",
    src: "/demo-galleries/07.svg",
    alt: "Abstract demo image 07",
    width: 900,
    height: 1100,
  },
  {
    id: "08",
    src: "/demo-galleries/08.svg",
    alt: "Abstract demo image 08",
    width: 900,
    height: 750,
  },
];

export const galleries: Gallery[] = [
  {
    slug: "creative-studio",
    title: "Creative Studio",
    description: "Posters, patterns, and high-contrast layouts.",
    images: demoImages,
  },
  {
    slug: "city-walks",
    title: "City Walks",
    description: "Urban moods, warm gradients, and street textures.",
    images: [...demoImages].reverse(),
  },
];

export function getGallery(slug: string): Gallery | undefined {
  return galleries.find((g) => g.slug === slug);
}

export async function createGallery(gallery: Gallery) {
  try {
    // Step 1: Upload all images through our API route
    const uploadedImages = await Promise.all(
      gallery.images.map(async (image) => {
        // Check if the image is a base64 data URL
        if (image.src.startsWith('data:')) {
          // Convert base64 to Blob
          const response = await fetch(image.src);
          const blob = await response.blob();
          
          // Create form data
          const formData = new FormData();
          formData.append('file', blob, `image-${image.id}.jpg`);
          formData.append('imageId', image.id);
          formData.append('alt', image.alt);
          formData.append('slug', gallery.slug);
          
          // Upload through our API route
          const uploadRes = await fetch('/api/upload-gallery', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(`Failed to upload image ${image.id}: ${errorData.error}`);
          }
          
          const uploadedData = await uploadRes.json();
          
          // Return the uploaded image data with our metadata
          return {
            id: uploadedData.id,
            url: uploadedData.url,
            alt: image.alt,
            width: image.width,
            height: image.height,
          };
        } else {
          // If it's already a URL, return as-is
          return {
            url: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
          };
        }
      })
    );

    // Step 2: Create the gallery entry through our API route
    const response = await fetch('/api/create-gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: gallery.title,
        description: gallery.description,
        slug: gallery.slug,
        images: uploadedImages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create gallery: ${errorData.error}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
}

// Get all galleries from Strapi
export async function getGalleries() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}/api/gallery-setups?populate=*`,
      {
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch galleries');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return null;
  }
}

// Get single gallery by slug
export async function getGalleryBySlug(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}/api/gallery-setups?filters[slug][$eq]=${slug}&populate=*`,
      {
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }
    
    const data = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return null;
  }
}