import './style.css'

import { basicSetup, EditorView } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { linter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'
import debounce from 'debounce'

import { Storage } from './storage.js'
import { selena } from './selena-language-support.js'
import { selenaLinter } from './selena-linter.js'
import { setupToasts } from './toasts.js'
import { setupPanes } from './panes.js'
import { updatePreview } from './preview.js'
import { createSaveCommand } from './commands/save.js'
import { reformatCommand } from './commands/reformat.js'
import { exportPdfCommand } from './commands/export-pdf.js'

/**
 * Time before linter runs, in milliseconds.
 */
const LINT_DELAY = 250

/**
 * Time delay after the source text changed, before the diagram is updated.
 */
const AUTO_RECOMPILE_DELAY = 500

function assertNonNull<T> (value: T): NonNullable<T> {
  if (value == null) {
    throw new Error('Expected non-null value')
  }
  return value
}

const storage = new Storage()
storage.load()

const inputPane = assertNonNull(document.getElementById('pane-input'))
const previewPane = assertNonNull(document.getElementById('pane-preview'))
const panesResizer = assertNonNull(document.getElementById('panes-resizer'))

setupPanes(inputPane, previewPane, panesResizer)

const previewContainer = assertNonNull(document.getElementById('preview'))
const previewErrorBox = assertNonNull(document.getElementById('preview-compile-error'))

const debouncedPreview = debounce(() => {
  const text = editorView.state.doc.sliceString(0)
  const success = updatePreview(text, previewContainer)
  previewContainer.classList.toggle('invalid', !success)
  previewErrorBox.classList.toggle('show', !success)
}, AUTO_RECOMPILE_DELAY)

const saveCommand = createSaveCommand(storage)

const editorView: EditorView = new EditorView({
  state: EditorState.create({
    extensions: [
      basicSetup,
      selena(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          storage.notifyUpdated()
          debouncedPreview()
        }
      }),
      keymap.of([
        indentWithTab,
        { key: 'Ctrl-s', run: saveCommand },
        { key: 'Ctrl-Alt-l', run: reformatCommand },
        { key: 'Ctrl-e', run: exportPdfCommand }
      ]),
      EditorState.tabSize.of(2),
      linter(selenaLinter, {
        delay: LINT_DELAY
      }),
      oneDark
    ],
    doc: storage.load()
  })
})

inputPane.appendChild(editorView.dom)

setupToasts(assertNonNull(document.getElementById('toasts')))

const saveButton = document.getElementById('btn-save') as HTMLButtonElement
saveButton.addEventListener('click', () => saveCommand(editorView))

const reformatButton = document.getElementById('btn-reformat') as HTMLButtonElement
reformatButton.addEventListener('click', () => reformatCommand(editorView))

const exportButton = document.getElementById('btn-export') as HTMLButtonElement
exportButton.addEventListener('click', () => exportPdfCommand(editorView))

// preview immediately
debouncedPreview()
debouncedPreview.flush()

window.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) {
    return
  }
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveCommand(editorView)
  } else if (event.ctrlKey && event.altKey && event.key === 'l') {
    event.preventDefault()
    reformatCommand(editorView)
  } else if (event.ctrlKey && event.key === 'e') {
    event.preventDefault()
    exportPdfCommand(editorView)
  }
})

// only allow save if document is not currently saved

storage.on('updated', () => {
  saveButton.disabled = false
})

storage.on('saved', () => {
  saveButton.disabled = true
})

saveButton.disabled = storage.saved
