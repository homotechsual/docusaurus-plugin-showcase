import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import Translate from '@docusaurus/Translate'
import { sortBy } from '../../core/utils.js'
import { getIcon } from '../icons.js'
import type { ShowcaseItem, PluginOptions } from '../../core/types.js'
import ShowcaseTooltip from '../ShowcaseTooltip/index.js'
import { DEFAULT_PLACEHOLDER_PREVIEW, normaliseCardUrl, resolveCardPreviewImage } from './utils.js'
import styles from './styles.module.css'

type Props = {
  item: ShowcaseItem
  options: PluginOptions
}

export default function ShowcaseCard({ item, options }: Props): React.JSX.Element {
  const initialImage = resolveCardPreviewImage(item, options.screenshotUrl)
  const [image, setImage] = useState<string | null>(initialImage)

  useEffect(() => {
    setImage(initialImage)
  }, [initialImage])

  const website = normaliseCardUrl(item.website)
  const imageAlt = `${item.name} preview`

  function handleImageError() {
    setImage((current) => {
      if (current === DEFAULT_PLACEHOLDER_PREVIEW) return null
      return DEFAULT_PLACEHOLDER_PREVIEW
    })
  }

  const isFavourite = options.favouriteTag ? item.tags.includes(options.favouriteTag) : false

  const sortedTags = sortBy(
    item.tags.filter((t) => t in options.tags),
    (t) => Object.keys(options.tags).indexOf(t),
  )

  const statusDef = item.status ? options.statuses[item.status] : null
  const StatusIcon = statusDef?.icon ? getIcon(statusDef.icon) : null
  const FavIcon = getIcon('heart')

  return (
    <li className={clsx('card shadow--md', styles.card)}>
      {image && (
        <div className={clsx('card__image', styles.cardImage)}>
          <img src={image} alt={imageAlt} loading="lazy" onError={handleImageError} />
        </div>
      )}
      <div className="card__body">
        <div className={styles.cardHeader}>
          <h4 className={styles.cardTitle}>
            {website ? (
              <Link href={website} className={styles.cardLink}>
                {item.name}
              </Link>
            ) : (
              <span className={styles.cardTitleText}>{item.name}</span>
            )}
          </h4>
          {isFavourite && FavIcon && (
            <FavIcon size={14} className={styles.favouriteIcon} />
          )}
          {item.source && (
            <Link
              href={item.source}
              className={clsx('button button--secondary button--sm', styles.sourceBtn)}
            >
              <Translate id="showcase.card.sourceLink">source</Translate>
            </Link>
          )}
        </div>
        <p className={styles.cardBody}>{item.description}</p>
        {item.author && (
          <p className={styles.cardAuthor}>
            <span className={styles.authorLabel}>Author:</span>
            <span>{item.author}</span>
          </p>
        )}
        {statusDef && (
          <p className={styles.statusRow}>
            <span className={styles.statusLabel}>Status:</span>
            <span>{statusDef.label}</span>
            {StatusIcon && <StatusIcon size={14} />}
          </p>
        )}
      </div>
      <ul className={clsx('card__footer', styles.cardFooter)}>
        {sortedTags.map((tagKey) => {
          const tagDef = options.tags[tagKey]
          if (!tagDef) return null
          const TooltipId = `card-tag-${item.id}-${tagKey}`
          const TagIcon = tagDef.icon ? getIcon(tagDef.icon) : null
          return (
            <ShowcaseTooltip key={tagKey} id={TooltipId} text={tagDef.description} anchorEl="#__docusaurus">
              <li className={styles.tag}>
                <span className={styles.tagColor} style={{ backgroundColor: tagDef.color }} />
                {tagDef.label.toLowerCase()}
                {TagIcon && <TagIcon size={12} />}
              </li>
            </ShowcaseTooltip>
          )
        })}
      </ul>
    </li>
  )
}
