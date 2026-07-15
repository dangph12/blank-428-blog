export interface ImgData {
  id: string;
  src: string;
  thumb: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

function cldUrl(
  cloudName: string,
  publicId: string,
  width: number,
  crop = 'limit'
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_${crop},w_${width}/${publicId}`;
}

function buildImageData(cloudName: string, resource: any): ImgData {
  return {
    id: resource.public_id,
    src: cldUrl(cloudName, resource.public_id, 1200),
    thumb: cldUrl(cloudName, resource.public_id, 400),
    srcset: [
      `${cldUrl(cloudName, resource.public_id, 400)} 400w`,
      `${cldUrl(cloudName, resource.public_id, 800)} 800w`,
      `${cldUrl(cloudName, resource.public_id, 1200)} 1200w`,
    ].join(', '),
    width: resource.width,
    height: resource.height,
    alt: resource.public_id.split('/').pop() || '',
  };
}

function err(msg: string, status = 500): Response {
  return new Response(
    JSON.stringify({ error: msg, images: [], nextCursor: null }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export default async (request: Request): Promise<Response> => {
  const cloudName = Deno.env.get('PUBLIC_CLOUDINARY_CLOUD_NAME');
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    return err('Cloudinary credentials not configured');
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);

  try {
    const auth = btoa(`${apiKey}:${apiSecret}`);
    const body: Record<string, unknown> = {
      expression: 'folder:blank-428-blog/gallery',
      sort_by: [{ created_at: 'desc' }],
      max_results: limit,
    };
    if (cursor) body.next_cursor = cursor;

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return err(`Cloudinary API error: ${res.status} ${text}`, 502);
    }

    const data = await res.json();
    const images = (data.resources || []).map((r: any) =>
      buildImageData(cloudName, r)
    );

    return new Response(
      JSON.stringify({ images, nextCursor: data.next_cursor || null }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return err(e.message || 'Failed to fetch gallery');
  }
};
