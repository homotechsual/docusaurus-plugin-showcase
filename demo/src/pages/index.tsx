import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import styles from './index.module.css'

function Hero() {
  return (
    <header className={clsx('hero hero--primary', styles.hero)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          docusaurus-plugin-showcase
        </Heading>
        <p className="hero__subtitle">
          A swizzleable showcase / directory page plugin for Docusaurus, driven by YAML data files.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/plugins">
            View Demo →
          </Link>
          <Link className="button button--outline button--secondary button--lg" to="/docs/intro">
            Read the Docs
          </Link>
        </div>
      </div>
    </header>
  )
}

type FeatureItem = {
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    title: 'YAML-driven',
    description: 'Each item in your showcase is a separate YAML file. No databases, no APIs — just files you commit alongside your site.',
  },
  {
    title: 'Fully swizzleable',
    description: 'All theme components can be swizzled for full customisation. Override the card, the filters, or the whole page.',
  },
  {
    title: 'Filtering built in',
    description: 'Tag-based and status-based filtering with AND/OR logic, plus free-text search — all URL-driven for deep linking.',
  },
  {
    title: 'Plugins preset',
    description: 'Ship-ready preset for a Docusaurus plugin directory with 12 tags and 3 maintenance statuses, matching the community site.',
  },
]

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <Hero />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map(({ title, description }) => (
                <div key={title} className={clsx('col col--3')}>
                  <div className="padding-horiz--md">
                    <Heading as="h3">{title}</Heading>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
