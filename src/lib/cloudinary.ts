import { v2 as cloudinary } from 'cloudinary';
import { getCldImageUrl } from 'astro-cloudinary/helpers';

export interface ImgData {
  id: string;
  src: string;
  thumb: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export function buildImageData(resource: any): ImgData {
  const opts = (w: number) => ({
    src: resource.public_id,
    width: w,
    format: 'auto' as const,
    quality: 'auto' as const,
  });
  return {
    id: resource.public_id,
    src: getCldImageUrl({ ...opts(1200), crop: 'limit' }),
    thumb: getCldImageUrl({ ...opts(400), crop: 'limit' }),
    srcset: [
      `${getCldImageUrl(opts(400))} 400w`,
      `${getCldImageUrl(opts(800))} 800w`,
      `${getCldImageUrl(opts(1200))} 1200w`,
    ].join(', '),
    width: resource.width,
    height: resource.height,
    alt: resource.public_id.split('/').pop() || '',
  };
}

export async function fetchGalleryImages(
  limit: number,
  cursor?: string
): Promise<{
  images: ImgData[];
  nextCursor: string | null;
}> {
  const CLOUD_NAME = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return { images: [], nextCursor: null };
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });

  const result = await cloudinary.search
    .expression('folder:blank-428-blog/gallery')
    .sort_by('created_at', 'desc')
    .max_results(limit)
    .next_cursor(cursor)
    .execute();

  return {
    images: result.resources.map((r: any) => buildImageData(r)),
    nextCursor: result.next_cursor || null,
  };
}
