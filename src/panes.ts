/**
 * Minimum width of any pane as a fraction of the viewport width.
 */
const MINIMUM_PANE_WIDTH = 0.15

/**
 * Default resizer position, and where it snaps to, as a fraction of the viewport width.
 */
const PREFERRED_PANE_POSITION = 0.42

/**
 * Radius around the preferred position for which the pane size will snap to it.
 */
const SNAP_RADIUS = 0.01

let inputPane: HTMLElement | undefined
let outputPane: HTMLElement | undefined
let resizerElement: HTMLElement | undefined

let resizing = false

function snapPosition (pos: number): number {
  if (pos < MINIMUM_PANE_WIDTH) {
    return MINIMUM_PANE_WIDTH
  }
  if (pos > (1 - MINIMUM_PANE_WIDTH)) {
    return 1 - MINIMUM_PANE_WIDTH
  }
  // snap to preferred position
  if (Math.abs(pos - PREFERRED_PANE_POSITION) < SNAP_RADIUS) {
    return PREFERRED_PANE_POSITION
  }
  return pos
}

function startResize (): void {
  resizing = true
}

function stopResize (): void {
  resizing = false
}

function setPosition (position: number): void {
  const resizerWidth = resizerElement?.offsetWidth ?? 0
  if (inputPane != null && outputPane != null) {
    inputPane.style.width = `calc(${position * 100}% - ${resizerWidth / 2}px)`
    outputPane.style.width = `calc(${(1 - position) * 100}% - ${resizerWidth / 2}px)`
  }
}

function resizeToPosition (position: number): void {
  if (resizing) {
    const pos = snapPosition(position)
    setPosition(pos)
  }
}

export function setupPanes (input: HTMLElement, output: HTMLElement, resizer: HTMLElement): void {
  inputPane = input
  outputPane = output
  resizerElement = resizer

  setPosition(PREFERRED_PANE_POSITION)

  resizerElement?.addEventListener('pointerdown', event => {
    event.preventDefault()
    startResize()
  })

  window.addEventListener('pointerup', event => {
    if (resizing) {
      event.preventDefault()
      stopResize()
    }
  })

  window.addEventListener('pointermove', (event) => {
    if (resizing) {
      event.preventDefault()
      resizeToPosition(event.clientX / document.body.clientWidth)
    }
  })
}
