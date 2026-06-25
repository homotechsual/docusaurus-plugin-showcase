// Heroicons MIT License — https://github.com/tailwindlabs/heroicons
type IconProps = { className?: string; size?: number }

export default function PlusSquare({ className, size = 24 }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM11 9v2H9v2h2v2h2v-2h2v-2h-2V9z"
        clipRule="evenodd"
      />
    </svg>
  )
}
