import { BrowserSvgRenderer, compileToSequence, Diagram } from 'selena'

import { basicSetup, EditorState } from '@codemirror/basic-setup'
import { Command, EditorView, keymap } from '@codemirror/view'
import { defaultTabBinding } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'

import { selena } from './selena-language-support'

const LOCALSTORAGE_SAVED = 'seq.save.input'

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
        { key: 'Ctrl-s', run: updateDiagram }
      ]),
      EditorState.tabSize.of(2),
      oneDark
    ],
    doc: loadDocument()
  })
})

input.appendChild(editorView.dom)

updateDiagram(editorView)
