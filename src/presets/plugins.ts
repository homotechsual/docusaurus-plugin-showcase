import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PluginOptions } from '../core/types.js'

export const pluginsPreset: Partial<PluginOptions> = {
  favouriteTag: 'favourite',
  schemaPath: join(dirname(fileURLToPath(import.meta.url)), '../../schema/plugins-preset/1.0.0.json'),
  pageTitle: 'Docusaurus Plugin Directory',
  pageDescription: 'A community-sourced list of plugins for Docusaurus',

  tags: {
    favourite: {
      label: 'Favourite',
      description: 'Our favourite Docusaurus plugins you should check out!',
      color: '#e9669e',
      icon: 'heart',
    },
    docusaurus: {
      label: 'Docusaurus',
      description: 'Docusaurus core / official plugins.',
      color: '#3ecc5f',
      icon: 'docusaurus',
    },
    search: {
      label: 'Search',
      description: 'Plugins implementing search functionality.',
      color: '#ca3c25',
    },
    api: {
      label: 'API',
      description: 'Plugins for API documentation and testing.',
      color: '#e6af2e',
    },
    utility: {
      label: 'Utility',
      description: 'Utility plugins such as analytics, SASS support, etc.',
      color: '#baff29',
    },
    content: {
      label: 'Content',
      description: 'Plugins providing content enhancements.',
      color: '#820b8a',
    },
    theme: {
      label: 'Theme',
      description: 'Plugins implementing themes or significant theme enhancements.',
      color: '#7eb2dd',
    },
    markdown: {
      label: 'Markdown',
      description: 'Plugins implementing new markdown features.',
      color: '#49d49d',
    },
    analytics: {
      label: 'Analytics',
      description: 'Plugins implementing analytics (Plausible, Matomo, etc.).',
      color: '#b892ff',
    },
    integration: {
      label: 'Integration',
      description: 'Plugins integrating with external services.',
      color: '#ff7700',
    },
    seo: {
      label: 'SEO',
      description: 'Plugins implementing SEO features.',
      color: '#e128d4',
    },
    editing: {
      label: 'Editing',
      description: 'Plugins implementing editing or contribution features.',
      color: '#ffaaff',
    },
  },

  statuses: {
    maintained: {
      label: 'Maintained',
      description: 'Compatible with the latest Docusaurus stable release.',
      color: '#39ca30',
      icon: 'circle-check',
    },
    unmaintained: {
      label: 'Unmaintained',
      description: 'Not compatible with or not updated for the latest Docusaurus stable release.',
      color: '#ca3c25',
      icon: 'circle-x',
    },
    unknown: {
      label: 'Unknown',
      description: 'Maintenance status could not be determined.',
      color: '#f0ad4e',
      icon: 'circle-minus',
    },
  },
}
