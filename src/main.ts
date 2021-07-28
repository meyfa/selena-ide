import { basicSetup, EditorState } from '@codemirror/basic-setup'
import { EditorView, keymap } from '@codemirror/view'
import { defaultTabBinding } from '@codemirror/commands'
import { linter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'
import { debounce } from 'debounce'

import { Storage } from './storage'
import { selena } from './selena-language-support'
import { selenaLinter } from './selena-linter'
import { setupToasts } from './toasts'
import { setupPanes } from './panes'
import { updatePreview } from './preview'
import { createSaveCommand } from './commands/save'
import { reformatCommand } from './commands/reformat'
import { exportPdfCommand } from './commands/export-pdf'

/**
 * Time before linter runs, in milliseconds.
 */
const LINT_DELAY = 250

/**
 * Time delay after the source text changed, before the diagram is updated.
 */
const AUTO_RECOMPILE_DELAY = 500

const storage = new Storage()
storage.load()

const inputPane = document.getElementById('pane-input') as HTMLElement
const previewPane = document.getElementById('pane-preview') as HTMLElement
const panesResizer = document.getElementById('panes-resizer') as HTMLElement

setupPanes(inputPane, previewPane, panesResizer)

const previewContainer = document.getElementById('preview') as HTMLElement
const previewErrorBox = document.getElementById('preview-compile-error') as HTMLElement

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
        defaultTabBinding,
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

setupToasts(document.getElementById('toasts') as HTMLElement)

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
