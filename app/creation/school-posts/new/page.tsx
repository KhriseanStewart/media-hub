"use client";
import { useState } from "react";
import { Upload, Link2, Image, Sparkles } from "lucide-react";
import { POST } from "@/app/api/content/route";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file");

  async function handleSubmit(e: React.FormEvent<HTMLDivElement>) {
    e.preventDefault();
    const form = e.currentTarget.querySelector('div[data-form="true"]');
    const formData = new FormData();
    
    // Collect form data
    const inputs = form?.querySelectorAll('input, textarea, select');
    inputs?.forEach((input: any) => {
      if (input.name && input.value) {
        if (input.type === 'file' && input.files?.[0]) {
          formData.append(input.name, input.files[0]);
        } else {
          formData.append(input.name, input.value);
        }
      }
    });
    
    console.log("Form submitted:", Object.fromEntries(formData));
    await POST(formData);
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Create Content
          </h1>
          <p className="text-slate-600">
            Share your amazing content with the world
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div data-form="true" className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                placeholder="Enter a captivating title"
                required
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Tell us what your content is about"
                required
                rows={4}
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Content Type <span className="text-red-500">*</span>
              </label>
              <select
                name="contentType"
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white"
                required
              >
                <option value="">Select type</option>
                <option value="video">🎥 Video</option>
                <option value="podcast">🎙️ Podcast</option>
                <option value="audio">📝 Audio</option>
              </select>
            </div>

            {/* Upload Method Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Media Source <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                    uploadMethod === "file"
                      ? "bg-violet-600 text-white shadow-md"
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
                      ? "bg-violet-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Link2 size={20} />
                  Add Link
                </button>
              </div>

              {uploadMethod === "file" ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-violet-400 transition bg-slate-50">
                  <div className="text-center">
                    <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                    <input
                      type="file"
                      name="media"
                      accept="video/*,audio/*"
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 file:font-medium"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      MP4, MOV, MP3, WAV (max. 100MB)
                    </p>
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  name="link"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
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
                placeholder="technology, tutorial, beginner"
                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
              <p className="text-xs text-slate-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={(e) => {
                  const formDiv = e.currentTarget.closest('[data-form="true"]');
                  if (formDiv) {
                    const event = {
                      preventDefault: () => {},
                      currentTarget: formDiv.parentElement
                    } as any;
                    handleSubmit(event);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-violet-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
              >
                Create Content
              </button>
              <button
                type="button"
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-slate-600">
          <p>Your content will be reviewed before publishing</p>
        </div>
      </div>
    </main>
  );
}