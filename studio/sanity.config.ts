import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {presentationTool} from 'sanity/presentation'
import {resolve} from './lib/resolve'

export default defineConfig({
  name: 'default',
  title: 'Blank.428',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || '',

  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      resolve,
      previewUrl: process.env.SANITY_STUDIO_PREVIEWS_URL || 'http://localhost:4321',
    }),
  ],

  schema: schemaTypes,
})
