import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PresetOptions } from '../core/types.js'

export const sitesPreset: PresetOptions = {
  favouriteTag: 'favorite',
  statuses: {},
  schemaPath: join(
    dirname(fileURLToPath(import.meta.url)),
    '../../schema/sites-preset/1.0.0.json',
  ),
  schemaUrl: 'https://cdn.jsdelivr.net/npm/@homotechsual/docusaurus-plugin-showcase/schema/sites-preset/1.0.0.json',
  pageTitle: 'Docusaurus Site Showcase',
  pageDescription: 'List of websites people are building with Docusaurus',
  tags: {
    favorite: {
      label: 'Favorite',
      description: 'Our favorite Docusaurus sites that you must absolutely check out!',
      color: '#e9669e',
      icon: 'heart',
    },
    opensource: {
      label: 'Open-Source',
      description: 'Open-Source Docusaurus sites can be useful for inspiration!',
      color: '#39ca30',
    },
    product: {
      label: 'Product',
      description: 'Docusaurus sites associated to a commercial product!',
      color: '#dfd545',
    },
    design: {
      label: 'Design',
      description: 'Beautiful Docusaurus sites, polished and standing out from the initial template!',
      color: '#a44fb7',
    },
    i18n: {
      label: 'I18n',
      description: 'Translated Docusaurus sites using the internationalization support with more than 1 locale.',
      color: '#127f82',
    },
    versioning: {
      label: 'Versioning',
      description: 'Docusaurus sites using the versioning feature of the docs plugin to manage multiple versions.',
      color: '#fe6829',
    },
    large: {
      label: 'Large',
      description: 'Very large Docusaurus sites, including many more pages than the average!',
      color: '#8c2f00',
    },
    meta: {
      label: 'Meta',
      description: 'Docusaurus sites of Meta (formerly Facebook) projects',
      color: '#4267b2',
    },
    personal: {
      label: 'Personal',
      description: 'Personal websites, blogs and digital gardens built with Docusaurus',
      color: '#14cfc3',
    },
    rtl: {
      label: 'RTL Direction',
      description: 'Docusaurus sites using the right-to-left reading direction support.',
      color: '#ffcfc3',
    },
  },
}
