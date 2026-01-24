import { TemplateContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type ContentType = "podcast" | "video" | "article";
export interface Tag {
  id: number;
  value: string;
}

export interface MetaData {
  author: string;
  published: Date;
  category: string;
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

export interface ContentBlock {
  type: string;
  children: {
    text: string;
  }[];
}


export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body: ContentBlock[]; // NOT string
  excerpt: string;
  createdAt: string;
  publishedAt: string;
  coverImage?: Media | null;
  metadata?: MetaData
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

interface StrapiArticleData{
  
}

interface StrapiContentResponse {
  data: StrapiContentItem[];
}

interface StrapiArticleResponse{
  data: Article[]
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

export async function fetchArticle(){
  let response = await fetch(`${API_BASE_URL}article-demos?populate=*`);

  // Properly get JSON data from the response
  let res = await response.json();

  let article: Article[] = res.data.map((item: any) => ({
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    body: item.body,
    createdAt: item.createdAt,
    publishedAt: item.publshedAt,
    slug: item.slug,
    excerpt: item.excerpt,
    coverImage: item.coverImage ? {...item.coverImage, url: `${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}${item.coverImage.url}`  } : null,
    metadata: {
      author: item.MetaData?.author,
      published: item.MetaData?.published,
      category: item.MetaData?.category,
    }
  }));

  return article;
}