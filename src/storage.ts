const LOCALSTORAGE_SAVED = 'seq.save.input'

export function loadDocument (): string {
  const item = localStorage.getItem(LOCALSTORAGE_SAVED)
  return item != null ? item : ''
}

export function saveDocument (doc: string): void {
  localStorage.setItem(LOCALSTORAGE_SAVED, doc)
}
