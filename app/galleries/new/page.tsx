'use client';

import { getGallery } from '@/lib/create-gallery';
import { createGallery, GalleryImage, Gallery } from '@/lib/galleries';
import { useState, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from 'react';

export default function GalleryCreate() {
  const [gallery, setGallery] = useState<{
    title: string;
    description: string;
    tags: string[];
    images: GalleryImage[];
  }>({
    title: '',
    description: '',
    tags: [],
    images: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    async function fetchGallery() {
      const gallery = await getGallery(); // Need to pass a slug
      console.log(gallery);
    }
    fetchGallery();
  }, []);

  //TODO: Title, Caption
  // Add a tag
  const addTag = (): void => {
    if (currentTag.trim() && !gallery.tags.includes(currentTag.trim())) {
      setGallery(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string): void => {
    setGallery(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const newImage: GalleryImage = {
          id: `${Date.now()}-${Math.random()}`,
          src: event.target?.result as string,
          alt: '',
          width: 800, // Default width
          height: 600, // Default height
        };
        setGallery(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Add image by URL
  const addImageByUrl = (): void => {
    if (imageInput.trim()) {
      const newImage: GalleryImage = {
        id: `${Date.now()}`,
        src: imageInput.trim(),
        alt: '',
        width: 800,
        height: 600,
      };
      setGallery(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setImageInput('');
    }
  };

  // Remove an image
  const removeImage = (imageId: string): void => {
    setGallery(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Update image metadata
  const updateImageMetadata = (
    imageId: string,
    field: keyof Pick<GalleryImage, 'alt' | 'width' | 'height'>,
    value: string | number
  ): void => {
    setGallery(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === imageId ? { ...img, [field]: value } : img
      )
    }));
  };

  // Submit gallery data
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Generate slug from title
    const slug = gallery.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const galleryData: Gallery = {
      slug,
      title: gallery.title,
      description: gallery.description,
      images: gallery.images,
    };

    try {
      await createGallery(galleryData);
      console.log('Gallery created successfully:', galleryData);
      console.log('Total Images:', galleryData.images.length);
      
      // Reset form
      setGallery({
        title: '',
        description: '',
        tags: [],
        images: []
      });
    } catch (error) {
      console.error('Error creating gallery:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Gallery</h1>
          <p className="text-gray-600">Add images and metadata for your gallery</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gallery Information</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={gallery.title}
                  onChange={(e) => setGallery(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter gallery title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={gallery.description}
                  onChange={(e) => setGallery(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  placeholder="Describe your gallery"
                  rows={4}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add
                  </button>
                </div>
                {gallery.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {gallery.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-purple-900 transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Images ({gallery.images.length})
            </h2>

            {/* Upload Options */}
            <div className="space-y-4 mb-6">
              {/* File Upload */}
              <div>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-gray-700 font-medium mb-1">Click to upload images</p>
                    <p className="text-gray-500 text-sm">or drag and drop</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageByUrl();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Or paste image URL"
                />
                <button
                  type="button"
                  onClick={addImageByUrl}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Images Grid */}
            {gallery.images.length > 0 && (
              <div className="space-y-4">
                {gallery.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition"
                  >
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                          <img
                            src={image.src}
                            alt={image.alt || `Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Image ID</p>
                            <p className="text-sm text-gray-800 font-medium">{image.id}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Alt Text</label>
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(e) => updateImageMetadata(image.id, 'alt', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                            placeholder="Describe the image"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Width</label>
                            <input
                              type="number"
                              value={image.width}
                              onChange={(e) => updateImageMetadata(image.id, 'width', parseInt(e.target.value) || 800)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Height</label>
                            <input
                              type="number"
                              value={image.height}
                              onChange={(e) => updateImageMetadata(image.id, 'height', parseInt(e.target.value) || 600)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setGallery({ title: '', description: '', tags: [], images: [] })}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium shadow-lg"
            >
              Create Gallery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}