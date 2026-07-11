import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';

process.loadEnvFile();

const {
  PUBLIC_SANITY_STUDIO_URL,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET
} = process.env;

export default defineConfig({
  output: 'server',

  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: '2025-12-28',
      studioUrl: PUBLIC_SANITY_STUDIO_URL,
      stega: {
        studioUrl: PUBLIC_SANITY_STUDIO_URL
      }
    })
  ],
  adapter: netlify(),
  image: {
    domains: ['cdn.sanity.io']
  },
  vite: {
    resolve: {
      alias: {
        '~': '/src'
      },
      conditions: ['browser', 'default']
    },
    optimizeDeps: {
      exclude: ['styled-components']
    }
  }
});
