import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { pluginsPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'
import { sitesPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

// Import the Docusaurus version.
import { DOCUSAURUS_VERSION } from '@docusaurus/utils'

const config: Config = {
  title: 'Docusaurus Showcase Plugin',
  tagline: 'A swizzleable showcase page plugin for Docusaurus',
  favicon: 'img/favicon.ico',
  url: 'https://showcase.docusaurus.homotechsual.dev',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [
    [
      '@homotechsual/docusaurus-plugin-showcase',
      {
        ...pluginsPreset,
        dataDir: 'data/plugins',
        routeBasePath: 'plugins',
        submitUrl: 'https://github.com/homotechsual/docusaurus-plugin-showcase/issues',
      },
    ],
    [
      '@homotechsual/docusaurus-plugin-showcase',
      {
        id: 'sites',
        ...sitesPreset,
        dataDir: 'data/sites',
        routeBasePath: 'sites',
        submitUrl: 'https://github.com/homotechsual/docusaurus-plugin-showcase/issues',
      },
    ],
    [
      '@homotechsual/docusaurus-plugin-showcase',
      {
        id: 'tools',
        dataDir: 'data/tools',
        routeBasePath: 'tools',
        pageTitle: 'Documentation Frameworks',
        pageDescription: 'A showcase of frameworks and platforms for building documentation sites.',
        favouriteTag: 'featured',
        submitUrl: 'https://github.com/homotechsual/docusaurus-plugin-showcase/issues',
        tags: {
          featured: {
            label: 'Featured',
            description: 'Our recommended documentation frameworks.',
            color: '#e9669e',
            icon: 'heart',
          },
          'open-source': {
            label: 'Open Source',
            description: 'Free and open-source tools you can self-host or contribute to.',
            color: '#39ca30',
          },
          paid: {
            label: 'Paid / Freemium',
            description: 'Commercial or freemium platforms.',
            color: '#e6af2e',
          },
          react: {
            label: 'React',
            description: 'Built with or designed for React.',
            color: '#61dafb',
          },
          vue: {
            label: 'Vue',
            description: 'Built with or designed for Vue.',
            color: '#42b883',
          },
          python: {
            label: 'Python',
            description: 'Built with Python.',
            color: '#3776ab',
          },
          astro: {
            label: 'Astro',
            description: 'Built with Astro.',
            color: '#ff5d01',
          },
          markdown: {
            label: 'Markdown',
            description: 'Primarily uses Markdown for content authoring.',
            color: '#083fa1',
          },
        },
        statuses: {
          active: {
            label: 'Active',
            description: 'Actively maintained and developed.',
            color: '#39ca30',
            icon: 'circle-check',
          },
          beta: {
            label: 'Beta',
            description: 'Currently in beta or early access.',
            color: '#e6af2e',
            icon: 'circle-minus',
          },
          archived: {
            label: 'Archived',
            description: 'No longer actively maintained.',
            color: '#ca3c25',
            icon: 'circle-x',
          },
        },
      },
    ],
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Showcase Plugin',
      items: [
        { to: '/plugins', label: 'Plugin Preset Demo', position: 'left' },
        { to: '/sites', label: 'Sites Preset Demo', position: 'left' },
        { to: '/tools', label: 'Custom Showcase Demo', position: 'left' },
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        {
          to: 'https://github.com/homotechsual/docusaurus-plugin-showcase',
          label: 'GitHub',
          position: 'right',
          target: '_blank',
          className: 'github-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Plugin',
          items: [
            { label: 'Plugins Preset Demo', to: '/plugins' },
            { label: 'Sites Preset Demo', to: '/sites' },
            { label: 'Custom Showcase Demo', to: '/tools' },
            { label: 'Documentation', to: '/docs/intro' },
          ],
        },
        {
          title: 'Links',
          items: [
            { label: 'GitHub', href: 'https://github.com/homotechsual/docusaurus-plugin-showcase' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@homotechsual/docusaurus-plugin-showcase' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Mikey O'Toole.<br />Built with <a href="https://docusaurus.io">Docusaurus v${DOCUSAURUS_VERSION}</a>.<br /><span class="designedBy">Designed with <svg xmlns="http://www.w3.org/2000/svg" class="heart" width="24" height="24" viewBox="0 0 24 24"><path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z"/></svg>
        by <a href="https://homotechsual.dev">homotechsual</a></span>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    markdown: {
      hooks: {
        onBrokenMarkdownLinks: 'warn',
      }
    },
    future: {
      faster: true,
      v4: true,
    },
    storage: {
      type: 'localStorage',
      namespace: true,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
