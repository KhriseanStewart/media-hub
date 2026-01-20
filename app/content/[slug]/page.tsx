


import { fetchContentBySlug, fetchContent } from "@/lib/api";
import { notFound } from "next/navigation";
import { Mic, Video, FileText, Calendar, ExternalLink } from "lucide-react";
import ReactPlayer from "react-player";
import VideoPlayer from "@/components/ui/video-player";

interface ContentPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const content = await fetchContent();
  return content.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: ContentPageProps) {
  const { slug } = await params;
  const content = await fetchContentBySlug(slug);
  if (!content) {
    return {
      title: "Content Not Found",
    };
  }
  return {
    title: `${content.title} - Media Hub`,
    description: content.description,
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const content = await fetchContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const Icon =
    content.contentType === "podcast"
      ? Mic
      : content.contentType === "video"
      ? Video
      : FileText;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if URL is a YouTube link
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  // Check if URL is a Vimeo link
  const getVimeoEmbedUrl = (url: string) => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  // Check if URL is a SoundCloud link
  const isSoundCloudUrl = (url: string) => {
    return url.includes("soundcloud.com");
  };

  // Check if URL is a Spotify link
  const getSpotifyEmbedUrl = (url: string) => {
    const regExp = /spotify.com\/(episode|show|track)\/([a-zA-Z0-9]+)/;
    const match = url.match(regExp);
    return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
  };

  const renderMedia = () => {
    if (!content.link) return null;

    const youtubeUrl = getYouTubeEmbedUrl(content.link);
    const vimeoUrl = getVimeoEmbedUrl(content.link);
    const spotifyUrl = getSpotifyEmbedUrl(content.link);
    const isSoundCloud = isSoundCloudUrl(content.link);

    // YouTube embed
    if (youtubeUrl) {
      return (
        <div className="relative w-full pt-[56.25%] overflow-hidden rounded-lg">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={youtubeUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Vimeo embed
    if (vimeoUrl) {
      return (
        <div className="relative w-full pt-[56.25%] overflow-hidden rounded-lg">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={vimeoUrl}
            title="Vimeo video player"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Spotify embed
    if (spotifyUrl) {
      return (
        <div className="w-full rounded-lg overflow-hidden">
          <iframe
            className="w-full h-[232px]"
            src={spotifyUrl}
            title="Spotify player"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      );
    }

    // SoundCloud embed
    if (isSoundCloud) {
      return (
        <div className="w-full rounded-lg overflow-hidden">
          <iframe
            className="w-full h-[166px]"
            scrolling="no"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
              content.link
            )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
            title="SoundCloud player"
          />
        </div>
      );
    }

    // Generic iframe fallback for other URLs
    return (
      <div className="relative w-full pt-[56.25%] overflow-hidden rounded-lg border-2 border-dashed border-slate-300">
        <ReactPlayer
          src={content.media?.url || content.link}
          controls
          width="100%"
          height="auto"
        />
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={typeof content.media === "string" ? content.media : content.media?.url ?? undefined}
          title="Content preview"
          sandbox="allow-scripts allow-same-origin"
        />
        <a
          href={typeof content.media === "string" ? content.media : content.media?.url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-50 transition"
        >
          Open in new tab
          <ExternalLink size={16} />
        </a>
      </div>
    );
  };

  const renderUploadedMedia = (media: any) => {
    if (!media?.url) return null;
  
    if (media.mime?.startsWith("video")) {
      return (
        <VideoPlayer url={content.media?.url || media.url} />
      );
    }
  
    if (media.mime?.startsWith("audio")) {
      return (
        <audio controls className="w-full p-4">
          <source src={media.url} type={media.mime} />
        </audio>
      );
    }
  
    return (
      <img
        src={media.url}
        alt={media.name || "Uploaded media"}
        className="w-full object-cover"
      />
    );
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <article>
        {/* Content Type Badge */}
        <div className="mb-6 flex items-center gap-3">
          <Icon className="h-5 w-5 text-slate-500" />
          <span className="text-sm font-medium uppercase tracking-wider text-slate-500">
            {content.contentType}
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {content.title}
        </h1>

        {/* Date */}
        <div className="mb-8 flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4" />
          <time>{formatDate(content.publishedAt)}</time>
        </div>

        {/* Media Player / Embed */}
        {(content.link || content.media) && (
          <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
            {content.link ? renderMedia(): renderUploadedMedia(content.media)
            }
          </div>
        )}

        {/*  final name = await getName();    */}

        {/* Description */}
        <div className="prose prose-neutral max-w-none mb-8">
          <p className="text-lg leading-relaxed text-slate-700">
            {content.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {content.tag?.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              {t.value}
            </span>
          ))}
        </div>
      </article>
    </main>
  );
}