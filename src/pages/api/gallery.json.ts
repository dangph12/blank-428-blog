// Dev fallback — unused in production (edge function handles this path)
import type { APIRoute } from 'astro';
import { fetchGalleryImages } from '~/lib/cloudinary';

function err(msg: string, status = 500) {
  return new Response(
    JSON.stringify({ error: msg, images: [], nextCursor: null }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export const GET: APIRoute = async ({ url }) => {
  const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return err('Cloudinary credentials not configured in .env');
  }

  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);

  try {
    const { images, nextCursor } = await fetchGalleryImages(limit, cursor);
    return new Response(JSON.stringify({ images, nextCursor }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return err(e.message || 'Failed to fetch gallery');
  }
};
