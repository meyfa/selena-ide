export enum ToastType {
  DEFAULT,
  GOOD,
  BAD
}

export const DEFAULT_TOAST_TIMEOUT = 5000

let element: HTMLElement | undefined

function createToastElement (text: string, type: ToastType): HTMLElement {
  const toast = document.createElement('div')
  toast.classList.add('toast')
  if (type === ToastType.GOOD) {
    toast.classList.add('good')
  } else if (type === ToastType.BAD) {
    toast.classList.add('bad')
  }
  toast.append(text)
  return toast
}

export function setupToasts (container: HTMLElement): void {
  element = container
}

export function addToast (text: string, type = ToastType.DEFAULT, timeout = DEFAULT_TOAST_TIMEOUT): void {
  if (element == null) {
    throw new Error('toast container not set up')
  }
  const toast = createToastElement(text, type)
  element.prepend(toast)
  setTimeout(() => toast.remove(), timeout)
}
