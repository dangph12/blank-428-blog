import { v2 as cloudinary } from 'cloudinary';

export interface ImgData {
  id: string;
  src: string;
  thumb: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

export function buildImageData(resource: any, cloudBase: string): ImgData {
  const t = (w: number) => `f_auto,q_auto,w_${w}`;
  const url = (w: number) =>
    `${cloudBase}/${t(w)}/${resource.public_id}.${resource.format}`;
  return {
    id: resource.public_id,
    src: url(1200),
    thumb: url(400),
    srcset: `${url(400)} 400w, ${url(800)} 800w, ${url(1200)} 1200w`,
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

  const CLOUD_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  const result = await cloudinary.search
    .expression('folder:blank-428-blog/gallery')
    .sort_by('created_at', 'desc')
    .max_results(limit)
    .next_cursor(cursor)
    .execute();

  return {
    images: result.resources.map((r: any) => buildImageData(r, CLOUD_BASE)),
    nextCursor: result.next_cursor || null,
  };
}
