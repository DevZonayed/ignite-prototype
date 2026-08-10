/* Line icons used for table row actions. 24x24 grid, stroked, no fills. */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconEye({ size = 16 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconPencil({ size = 16 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

export function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

/** Suspend: a person with a slash. */
export function IconUserOff({ size = 16 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <circle cx="10" cy="8" r="4" />
      <path d="M2 21c0-4 4-6 8-6 1 0 2 .1 2.9.4" />
      <path d="M16 16l6 6M22 16l-6 6" />
    </svg>
  )
}

/** Activate: a person with a tick. */
export function IconUserCheck({ size = 16 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <circle cx="10" cy="8" r="4" />
      <path d="M2 21c0-4 4-6 8-6 1 0 2 .1 2.9.4" />
      <path d="M16 19l2 2 4-4" />
    </svg>
  )
}

export function IconKey({ size = 16 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2 20 3M17 6l3 3M15 8l2 2" />
    </svg>
  )
}

export function IconPlus({ size = 15 }) {
  return (
    <svg width={size} height={size} {...base} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
