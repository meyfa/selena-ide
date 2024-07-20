// eslint-disable-next-line
import { EventEmitter } from 'events'

const LOCALSTORAGE_SAVED = 'seq.save.input'

export class Storage extends EventEmitter {
  private _saved: boolean = true

  get saved (): boolean {
    return this._saved
  }

  load (): string {
    return localStorage.getItem(LOCALSTORAGE_SAVED) ?? ''
  }

  save (doc: string): void {
    localStorage.setItem(LOCALSTORAGE_SAVED, doc)
    this._saved = true
    this.emit('saved')
  }

  notifyUpdated (): void {
    this._saved = false
    this.emit('updated')
  }
}
