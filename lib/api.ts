import { TemplateContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type ContentType = "podcast" | "video" | "article";
export interface Tag {
  id: number;
  value: string;
}

export interface Content {
  documentId: string;
  id: number;
  title: string;
  slug: string;
  description: string;
  contentType: ContentType;
  tag: Tag[];
  media?: Media | null;
  publishedAt: string;
  link: string;
}

interface Media {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: any | null;
  height: any;
  formats: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: string | any;
}

interface StrapiContentItem {
  documentId: string;
  slug: string;
  id: number;
  title: string;
  description: string;
  contenttype: ContentType;
  tag: string[];
  publishedAt: string;
  media?: Media | null;
  link?: string;
}

interface StrapiContentResponse {
  data: StrapiContentItem[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1337/api/";

export async function fetchContent(
  contentType?: ContentType
): Promise<Content[]> {
  const response = await fetch(`${API_BASE_URL}podcast-demos?populate=*`);
  const jsonData: StrapiContentResponse = await response.json();

  // In a real application, this would fetch from your Strapi API

  let content: Content[] = jsonData.data.map((item: any) => ({
    documentId: item.documentId,
    id: item.id,
    title: item.title,
    slug: item.slug,
    link: item.link ?? "",
    description: item.description,
    contentType: item.contenttype,
    tag: item.tag,
    publishedAt: item.publishedAt,
    media: item.media ? {...item.media, url: `${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}${item.media.url}`  } : null,
  }));

  // Filter by content type if specified
  if (contentType) {
    content = content.filter((item) => item.contentType === contentType);
  }

  return content;
}

export async function fetchContentBySlug(
  slug: string
): Promise<Content | null> {
  // In a real application: const response = await fetch(`${API_BASE_URL}/api/contents?filters[slug][$eq]=${slug}`)
  const allContent = await fetchContent();
  return allContent.find((item) => item.slug === slug) || null;
}

// export async function fetchContent(
//   contentType?: ContentType
// ): Promise<Content[]> {
//   const url = new URL(`${API_BASE_URL}/api/podcast-demos`)
//   url.searchParams.set("populate", "media")

//   if (contentType) {
//     url.searchParams.set(
//       "filters[contenttype][$eq]",
//       contentType
//     )
//   }

//   const res = await fetch(url.toString(), { cache: "no-store" })

//   if (!res.ok) {
//     throw new Error("Failed to fetch content")
//   }

//   const json: StrapiContentResponse = await res.json()

//   return json.data.map((item) => ({
//     id: item.id,
//     title: item.attributes.title,
//     slug: item.attributes.slug,
//     description: item.attributes.description,
//     contentType: item.attributes.contenttype,
//     tags: item.attributes.tags,
//     publishedAt: item.attributes.publishedAt,
//     mediaUrl: item.attributes.media?.data
//       ? `${API_BASE_URL}${item.attributes.media.data.attributes.url}`
//       : undefined,
//   }))
// }

// export async function fetchContentBySlug(
//   slug: string
// ): Promise<Content | null> {
//   const url = new URL(`${API_BASE_URL}/api/podcast-demos`)
//   url.searchParams.set("populate", "media")
//   url.searchParams.set("filters[slug][$eq]", slug)

//   const res = await fetch(url.toString(), { cache: "no-store" })
//   if (!res.ok) return null

//   const json: StrapiContentResponse = await res.json()
//   const item = json.data[0]

//   if (!item) return null

//   return {
//     id: item.id,
//     title: item.attributes.title,
//     slug: item.attributes.slug,
//     description: item.attributes.description,
//     contentType: item.attributes.contenttype,
//     tags: item.attributes.tags,
//     publishedAt: item.attributes.publishedAt,
//     mediaUrl: item.attributes.media?.data
//       ? `${API_BASE_URL}${item.attributes.media.data.attributes.url}`
//       : undefined,
//   }
// }
