import { basicSetup, EditorState } from '@codemirror/basic-setup'
import { EditorView, keymap } from '@codemirror/view'
import { defaultTabBinding } from '@codemirror/commands'
import { linter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'

import { selena } from './selena-language-support'
import { selenaLinter } from './selena-linter'
import { setupToasts } from './toasts'
import { setupPanes } from './panes'
import { createCompileCommand } from './commands/compile'
import { createReformatCommand } from './commands/reformat'
import { createExportPdfCommand } from './commands/export-pdf'
import { loadDocument } from './storage'

/**
 * Time before linter runs, in milliseconds.
 */
const LINT_DELAY = 250

const inputPane = document.getElementById('input') as HTMLElement
const outputPane = document.getElementById('output') as HTMLElement
const panesResizer = document.getElementById('panes-resizer') as HTMLElement

setupPanes(inputPane, outputPane, panesResizer)

const compileCommand = createCompileCommand(outputPane)
const reformatCommand = createReformatCommand()
const exportPdfCommand = createExportPdfCommand()

const editorView = new EditorView({
  state: EditorState.create({
    extensions: [
      basicSetup,
      selena(),
      keymap.of([
        defaultTabBinding,
        { key: 'Ctrl-s', run: compileCommand },
        { key: 'Ctrl-Alt-l', run: reformatCommand },
        { key: 'Ctrl-e', run: exportPdfCommand }
      ]),
      EditorState.tabSize.of(2),
      linter(selenaLinter, {
        delay: LINT_DELAY
      }),
      oneDark
    ],
    doc: loadDocument()
  })
})

inputPane.appendChild(editorView.dom)

setupToasts(document.getElementById('toasts') as HTMLElement)

const compileButton = document.getElementById('btn-compile') as HTMLButtonElement
compileButton.addEventListener('click', () => compileCommand(editorView))

const reformatButton = document.getElementById('btn-reformat') as HTMLButtonElement
reformatButton.addEventListener('click', () => reformatCommand(editorView))

const exportButton = document.getElementById('btn-export') as HTMLButtonElement
exportButton.addEventListener('click', () => exportPdfCommand(editorView))

compileCommand(editorView)
