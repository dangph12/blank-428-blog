import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

function err(msg: string, status = 500) {
  return new Response(JSON.stringify({ error: msg, images: [], nextCursor: null }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ url }) => {
  const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return err('Cloudinary credentials not configured in .env');
  }

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

  const CLOUD_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);

  try {
    const result = await cloudinary.search
      .expression('folder:blank-428-blog/gallery')
      .sort_by('created_at', 'desc')
      .max_results(limit)
      .next_cursor(cursor)
      .execute();

    const images = result.resources.map((r: any) => {
      const t = (w: number) => `f_auto,q_auto,w_${w}`;
      const url = (w: number) => `${CLOUD_BASE}/${t(w)}/${r.public_id}.${r.format}`;
      return {
        id: r.public_id,
        src: url(1200),
        thumb: url(400),
        srcset: `${url(400)} 400w, ${url(800)} 800w, ${url(1200)} 1200w`,
        width: r.width,
        height: r.height,
        alt: r.public_id.split('/').pop() || '',
      };
    });

    return new Response(JSON.stringify({
      images,
      nextCursor: result.next_cursor || null,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return err(err.message || 'Failed to fetch gallery');
  }
};
