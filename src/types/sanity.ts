export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  body?: any[];
  imageUrl?: string;
}

export interface SanityPostDetail {
  title: string;
  body: any[];
  publishedAt?: string;
  author?: string;
  excerpt?: string;
}

export interface SanityPostPreview {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  mainImage?: { asset: { url: string } };
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface SanityAuthor {
  _id: string;
  name: string;
  slug: { current: string };
  image?: { asset: { _ref: string }; alt?: string };
  bio?: any[];
}
