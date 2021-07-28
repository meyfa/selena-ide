import { Command } from '@codemirror/view'
import { Storage } from '../storage'

export function createSaveCommand (storage: Storage): Command {
  return (view): boolean => {
    const text = view.state.doc.sliceString(0)
    storage.save(text)
    return true
  }
}
