import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { pluginsPreset } from '@homotechsual/docusaurus-plugin-showcase/presets'

const config: Config = {
  title: 'Docusaurus Plugin Showcase',
  tagline: 'A swizzleable showcase page plugin for Docusaurus',
  favicon: 'img/favicon.ico',
  url: 'https://homotechsual.github.io',
  baseUrl: '/docusaurus-plugin-showcase/',
  organizationName: 'homotechsual',
  projectName: 'docusaurus-plugin-showcase',
  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
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
      title: 'Plugin Showcase',
      items: [
        { to: '/plugins', label: 'Demo', position: 'left' },
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
        {
          href: 'https://github.com/homotechsual/docusaurus-plugin-showcase',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Plugin',
          items: [
            { label: 'Demo', to: '/plugins' },
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
      copyright: `Copyright © ${new Date().getFullYear()} Mikey O'Toole. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
