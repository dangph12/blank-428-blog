// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sanity from '@sanity/astro';
import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

import { loadEnv } from 'vite';
const {
  PUBLIC_SANITY_STUDIO_URL,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET
} = loadEnv(process.env.NODE_ENV, process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // Add this line to enable hybrid rendering (SSR + Static)
  output: 'static',

  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false, // See note on using the CDN
      apiVersion: '2025-12-28', // insert the current date to access the latest version of the API,
      studioUrl: PUBLIC_SANITY_STUDIO_URL,
      stega: {
        studioUrl: PUBLIC_SANITY_STUDIO_URL
      }
    }),
    react()
  ],
  adapter: netlify(),
  image: {
    domains: ['https://cdn.sanity.io']
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': '/src'
      }
    }
  }
});
