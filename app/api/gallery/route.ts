import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageId = formData.get('imageId') as string;
    const alt = formData.get('alt') as string;
    const slug = formData.get('slug') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create form data for Strapi
    const strapiFormData = new FormData();
    strapiFormData.append('files', file);
    strapiFormData.append('fileInfo', JSON.stringify({
      name: `gallery-${slug}-${imageId}`,
      alternativeText: alt || '',
    }));

    // Upload to Strapi
    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: strapiFormData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error('Strapi upload error:', errorText);
      return NextResponse.json(
        { error: `Upload failed: ${errorText}` },
        { status: uploadRes.status }
      );
    }

    const uploadedData = await uploadRes.json();
    return NextResponse.json(uploadedData[0]);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}