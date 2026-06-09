import type React from 'react'
import CircleCheck from '../icons/CircleCheck.js'
import CircleMinus from '../icons/CircleMinus.js'
import CircleX from '../icons/CircleX.js'
import DocusaurusIcon from '../icons/Docusaurus.js'
import Heart from '../icons/Heart.js'
import PlusSquare from '../icons/PlusSquare.js'

type IconComponent = React.ComponentType<{ className?: string; size?: number }>

export const SHOWCASE_ICONS: Record<string, IconComponent> = {
  'circle-check': CircleCheck,
  'circle-minus': CircleMinus,
  'circle-x': CircleX,
  'docusaurus': DocusaurusIcon,
  'heart': Heart,
  'plus-square': PlusSquare,
}

export function getIcon(id: string | null | undefined): IconComponent | null {
  if (!id) return null
  return SHOWCASE_ICONS[id] ?? null
}
