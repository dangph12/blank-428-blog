import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import type { ZoomRef } from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import '../styles/gallery.css';

interface ImgData {
  id: string;
  src: string;
  thumb: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
}

function getColCount(): number {
  const w = window.innerWidth;
  if (w < 640) return 1;
  if (w < 1024) return 2;
  return 3;
}

function computeColumns(images: ImgData[], colCount: number): ImgData[][] {
  const cols: ImgData[][] = Array.from({ length: colCount }, () => []);
  const heights: number[] = Array(colCount).fill(0);
  for (const img of images) {
    const ratio = img.height / img.width;
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest].push(img);
    heights[shortest] += ratio;
  }
  return cols;
}

export default function GalleryGrid() {
  const [images, setImages] = useState<ImgData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [colCount, setColCount] = useState(3);

  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const imagesRef = useRef(images);
  const loadMoreRef = useRef<() => Promise<void>>(async () => {});
  const requestSeqRef = useRef(0);
  const zoomRef = useRef<ZoomRef>(null);

  const columns = useMemo(
    () => computeColumns(images, colCount),
    [images, colCount]
  );
  imagesRef.current = images;

  const closeImage = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  loadMoreRef.current = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    const requestId = ++requestSeqRef.current;
    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (cursorRef.current) params.set('cursor', cursorRef.current);
      params.set('limit', '40');

      const res = await fetch(`/api/gallery.json?${params}`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        hasMoreRef.current = false;
        setHasMore(false);
        setError('Không thể tải ảnh');
        return;
      }

      const next: ImgData[] = (data.images || []).map((img: ImgData) => ({
        id: img.id,
        src: img.src,
        thumb: img.thumb,
        srcset: img.srcset,
        width: img.width,
        height: img.height,
        alt: img.alt
      }));

      if (requestId !== requestSeqRef.current) return;

      const loads: Promise<void>[] = [];
      for (const img of next) {
        const el = new Image();
        el.src = img.thumb;
        if (img.srcset) el.srcset = img.srcset;
        loads.push(
          el
            .decode()
            .catch(() => {})
            .then(
              () =>
                new Promise(resolve => requestAnimationFrame(() => resolve()))
            )
        );
      }
      await Promise.all(loads);

      if (requestId !== requestSeqRef.current) return;

      setImages(prev => [...prev, ...next]);
      cursorRef.current = data.nextCursor ?? null;
      if (!data.nextCursor) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (e) {
      if (requestId !== requestSeqRef.current) return;
      console.error('Gallery fetch error:', e);
      hasMoreRef.current = false;
      setHasMore(false);
      setError('Lỗi tải ảnh');
    } finally {
      if (requestId === requestSeqRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMoreRef.current();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => setColCount(getColCount()), 200);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function reset() {
      cursorRef.current = null;
      loadingRef.current = false;
      hasMoreRef.current = true;
      requestSeqRef.current += 1;
      setImages([]);
      setLoading(false);
      setHasMore(true);
      setError('');
      setSelectedImageIndex(null);
      loadMoreRef.current();
    }
    document.addEventListener('astro:page-load', reset);
    return () => document.removeEventListener('astro:page-load', reset);
  }, []);

  return (
    <>
      <div className='gallery-grid' role='region' aria-label='Image gallery'>
        {columns.map((col, i) => (
          <div className='gallery-col' role='none' key={i}>
            {col.map(img => (
              <button
                key={img.id}
                type='button'
                className='gallery-item'
                onClick={() => {
                  const idx = images.indexOf(img);
                  if (idx >= 0) setSelectedImageIndex(idx);
                }}
              >
                <img
                  src={img.thumb}
                  srcSet={img.srcset}
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  alt={img.alt}
                  loading='lazy'
                  decoding='async'
                  width={img.width}
                  height={img.height}
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className='gallery-loader'>
        {error ? (
          <span>{error}</span>
        ) : loading ? (
          <span>Đang tải...</span>
        ) : !hasMore ? (
          <span>Đã tải hết</span>
        ) : (
          <button
            type='button'
            className='gallery-load-more'
            onClick={() => loadMoreRef.current()}
          >
            Tải thêm ảnh
          </button>
        )}
      </div>

      <Lightbox
        open={selectedImageIndex !== null}
        close={closeImage}
        index={selectedImageIndex ?? 0}
        slides={images.map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
        }))}
        plugins={[Zoom]}
        zoom={{ ref: zoomRef, scrollToZoom: false, doubleClickMaxStops: 0 }}
        animation={{ swipe: 0, navigation: 0 }}
        carousel={{ padding: 0, spacing: 0, preload: 3 }}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
        on={{
          click: () => {
            const z = zoomRef.current?.zoom ?? 1;
            if (z <= 1) zoomRef.current?.zoomIn();
            else zoomRef.current?.zoomOut();
          },
          view: ({ index }) => {
            setSelectedImageIndex(index);
            const shouldPrefetch = hasMoreRef.current && !loadingRef.current && index >= imagesRef.current.length - 2;
            if (shouldPrefetch) loadMoreRef.current();
          },
        }}
      />
    </>
  );
}
