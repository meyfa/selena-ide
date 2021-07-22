import { BrowserSvgRenderer, compileToSequence, Diagram } from 'selena'

import { basicSetup, EditorState } from '@codemirror/basic-setup'
import { Command, EditorView, keymap } from '@codemirror/view'
import { defaultTabBinding } from '@codemirror/commands'
import { linter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'

import { selena } from './selena-language-support'
import { selenaLinter } from './selena-linter'
import { format } from './formatter/format'
import { addToast, setupToasts, ToastType } from './toasts'

const LOCALSTORAGE_SAVED = 'seq.save.input'

/**
 * Time before linter runs, in milliseconds.
 */
const LINT_DELAY = 250

function update (input: string, outputTo: HTMLElement): void {
  const diag = Diagram.create(compileToSequence(input))

  const svgRenderer = new BrowserSvgRenderer(50, 20)
  // svgRenderer.setColors('#DADADA', '#3A3C3F')
  diag.layout(svgRenderer)
  svgRenderer.prepare(diag.getComputedSize())
  diag.draw(svgRenderer)
  const element = svgRenderer.finish()

  // insert the element in a way that preserves Browser scrolling
  while (outputTo.childNodes.length > 1) {
    outputTo.removeChild(outputTo.childNodes[0])
  }
  if (outputTo.childNodes.length === 1) {
    outputTo.replaceChild(element, outputTo.childNodes[0])
  } else {
    outputTo.appendChild(element)
  }
}

function loadDocument (): string {
  const item = localStorage.getItem(LOCALSTORAGE_SAVED)
  return item != null ? item : ''
}

function saveDocument (doc: string): void {
  localStorage.setItem(LOCALSTORAGE_SAVED, doc)
}

const input = document.getElementById('input') as HTMLElement
const outputContainer = document.getElementById('output') as HTMLElement

const updateDiagram: Command = (view): boolean => {
  const text = view.state.doc.sliceString(0)
  saveDocument(text)
  try {
    update(text, outputContainer)
  } catch (e) {
    console.error(e)
    addToast('Compilation failed. Please check your input for errors.', ToastType.BAD)
  }
  return true
}

const reformat: Command = (view): boolean => {
  const text = view.state.doc.sliceString(0)
  try {
    const formatted = format(text)
    if (text === formatted) {
      addToast('Source code was already properly formatted.', ToastType.GOOD)
      return true
    }
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: formatted
      }
    })
    addToast('Source code has been formatted.', ToastType.GOOD)
  } catch (e) {
    console.error(e)
    addToast('Formatting failed. Please check your input for errors.', ToastType.BAD)
  }
  return true
}

const editorView = new EditorView({
  state: EditorState.create({
    extensions: [
      basicSetup,
      selena(),
      keymap.of([
        defaultTabBinding,
        { key: 'Ctrl-s', run: updateDiagram },
        { key: 'Ctrl-Alt-l', run: reformat }
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

input.appendChild(editorView.dom)

setupToasts(document.getElementById('toasts') as HTMLElement)

const compileButton = document.getElementById('btn-compile') as HTMLButtonElement
compileButton.addEventListener('click', () => updateDiagram(editorView))

const reformatButton = document.getElementById('btn-reformat') as HTMLButtonElement
reformatButton.addEventListener('click', () => reformat(editorView))

updateDiagram(editorView)
