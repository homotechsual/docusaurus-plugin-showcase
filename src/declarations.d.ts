declare module '*.module.css' {
  const styles: Record<string, string>
  export default styles
}

declare module '@docusaurus/router' {
  export { useHistory, useLocation, Redirect, matchPath } from 'react-router-dom'
}

declare module '@docusaurus/theme-common' {
  export function usePluralForm(): { selectMessage: (count: number, pluralForm: string) => string }
}

declare module '@docusaurus/Translate' {
  import type { ReactNode } from 'react'

  type TranslateProps<Str extends string> = {
    id?: string
    description?: string
    children?: Str
    values?: Record<string, ReactNode>
  }

  export function translate(param: { id?: string; message?: string; description?: string }, values?: Record<string, string | number>): string

  export default function Translate<Str extends string>(props: TranslateProps<Str>): JSX.Element
}

declare module '@docusaurus/Link' {
  import type { ComponentPropsWithoutRef } from 'react'
  type LinkProps = ComponentPropsWithoutRef<'a'> & { href: string }
  export default function Link(props: LinkProps): JSX.Element
}

declare module '@theme/Layout' {
  import type { ReactNode } from 'react'
  type LayoutProps = { title?: string; description?: string; children?: ReactNode }
  export default function Layout(props: LayoutProps): JSX.Element
}
