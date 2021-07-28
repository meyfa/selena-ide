import { Command, EditorView } from '@codemirror/view'
import { format } from '../formatter/format'
import { addToast, ToastType } from '../toasts'

function setEditorContent (view: EditorView, content: string): void {
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: content
    }
  })
}

export const reformatCommand: Command = (view): boolean => {
  const text = view.state.doc.sliceString(0)
  try {
    const formatted = format(text)
    if (text === formatted) {
      addToast('Source code was already properly formatted.', ToastType.GOOD)
      return true
    }
    setEditorContent(view, formatted)
    addToast('Source code has been formatted.', ToastType.GOOD)
  } catch (e) {
    console.error(e)
    addToast('Formatting failed. Please check your input for errors.', ToastType.BAD)
  }
  return true
}
