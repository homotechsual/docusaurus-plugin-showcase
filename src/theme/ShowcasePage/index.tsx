import React, { useState, useMemo } from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import Translate, { translate } from '@docusaurus/Translate'
import { sortBy } from '../../core/utils.js'
import type { ShowcaseItem, ShowcasePageData } from '../../core/types.js'
import ShowcaseFilters from '../ShowcaseFilters/index.js'
import ShowcaseCard from '../ShowcaseCard/index.js'
import { getIcon } from '../icons.js'
import styles from './styles.module.css'

type Props = {
  showcase: ShowcasePageData
}

export default function ShowcasePage({ showcase }: Props): JSX.Element {
  const { items, options } = showcase

  const sortedItems = useMemo(() => {
    let result = sortBy(items, (item) => item.name.toLowerCase())
    if (options.favouriteTag) {
      result = sortBy(result, (item) => !item.tags.includes(options.favouriteTag!))
    }
    return result
  }, [items, options.favouriteTag])

  const [filteredItems, setFilteredItems] = useState<ShowcaseItem[]>(sortedItems)

  const title = options.pageTitle ?? translate({ id: 'showcase.page.title', message: 'Showcase' })
  const description = options.pageDescription ?? translate({ id: 'showcase.page.description', message: 'A community showcase.' })
  const isFiltered = filteredItems.length !== sortedItems.length

  const favouriteItems = sortedItems.filter(
    (item) => options.favouriteTag && item.tags.includes(options.favouriteTag),
  )
  const otherItems = sortedItems.filter(
    (item) => !options.favouriteTag || !item.tags.includes(options.favouriteTag),
  )

  const FavIcon = getIcon('heart')

  return (
    <Layout title={title} description={description}>
      <main className="margin-vert--lg">
        <section className={clsx('margin-top--lg margin-bottom--lg', styles.pageHeader)}>
          <h1>{title}</h1>
          <p>{description}</p>
          {options.submitUrl && (
            <Link className="button button--primary button--lg" href={options.submitUrl} target="_blank" rel="noreferrer">
              {getIcon('plus-square') && React.createElement(getIcon('plus-square')!, { size: 16, className: 'margin-right--sm' })}
              <Translate id="showcase.header.addButton">Add an item</Translate>
            </Link>
          )}
        </section>

        <ShowcaseFilters
          items={sortedItems}
          options={options}
          onFilter={setFilteredItems}
        />

        {filteredItems.length === 0 ? (
          <section className={styles.noResults}>
            <h2>
              <Translate id="showcase.noResults">No results</Translate>
            </h2>
          </section>
        ) : isFiltered ? (
          <div className="container">
            <ul className={clsx('clean-list', styles.grid)}>
              {filteredItems.map((item) => (
                <ShowcaseCard key={item.id} item={item} options={options} />
              ))}
            </ul>
          </div>
        ) : (
          <>
            {favouriteItems.length > 0 && (
              <div className={styles.favouriteSection}>
                <div className="container">
                  <div className={styles.favouriteHeader}>
                    <h2>
                      <Translate id="showcase.favourites.title">Our favourites</Translate>
                    </h2>
                    {FavIcon && <FavIcon size={28} className={styles.favouriteIcon} />}
                  </div>
                  <ul className={clsx('clean-list', styles.grid)}>
                    {favouriteItems.map((item) => (
                      <ShowcaseCard key={item.id} item={item} options={options} />
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="container margin-top--lg">
              <h2>
                <Translate id="showcase.allItems.title">All items</Translate>
              </h2>
              <ul className={clsx('clean-list', styles.grid)}>
                {otherItems.map((item) => (
                  <ShowcaseCard key={item.id} item={item} options={options} />
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </Layout>
  )
}
