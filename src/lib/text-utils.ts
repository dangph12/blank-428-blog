import { stegaClean } from '@sanity/client/stega';

export function preventOrphan(str: string): string {
  return stegaClean(str).trim().replace(/\s(\S+)$/, '\u00A0$1');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
