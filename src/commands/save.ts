import { Command } from '@codemirror/view'
import { saveDocument } from '../storage'

export const saveCommand: Command = (view): boolean => {
  const text = view.state.doc.sliceString(0)
  saveDocument(text)
  return true
}
