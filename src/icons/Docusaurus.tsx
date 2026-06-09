// Docusaurus SVG — Apache 2.0 — https://github.com/facebook/docusaurus
type IconProps = { className?: string }

export default function DocusaurusIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#3ECC5F" />
    </svg>
  )
}
