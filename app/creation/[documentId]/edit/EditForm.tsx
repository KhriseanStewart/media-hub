"use client";
import { useState } from "react";
import { Upload, Link2, X } from "lucide-react";
import { PUT } from "@/app/api/content/route";
import { useRouter } from "next/navigation";

export default function EditForm({
  slug,
  item,
}: {
  slug: string;
  item: any;
}) {
  let router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">(
    item.videoUrl ? "link" : "file"
  );
  const tags = item.tag?.map((t: any) => t.name).join(", ") ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Simulated API call
    console.log("Form submitted:", Object.fromEntries(formData));
    await PUT(slug, formData);
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Edit Content
          </h1>
          <p className="text-slate-600 mb-8">
            Update your content details below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title
              </label>
              <input
                name="title"
                defaultValue={item.title}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter a catchy title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={item.description}
                rows={4}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Describe your content"
                required
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Content Type
              </label>
              <select
                name="contentType"
                defaultValue={item.contenttype}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            {/* Upload Method Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Video/Media Source
              </label>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                    uploadMethod === "file"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Upload size={20} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("link")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                    uploadMethod === "link"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Link2 size={20} />
                  Add Link
                </button>
              </div>

              {uploadMethod === "file" ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition">
                  <input
                    type="file"
                    name="mediaFile"
                    accept="video/*,audio/*"
                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Supported formats: MP4, MOV, MP3, WAV
                  </p>
                </div>
              ) : (
                <input
                  type="url"
                  name="link"
                  defaultValue={item.videoUrl}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tags
              </label>
              <input
                name="tags"
                defaultValue={tags}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="technology, tutorial, beginner"
              />
              <p className="text-xs text-slate-500 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl"
              >
                Update Content
              </button>
              <button
                type="button"
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}