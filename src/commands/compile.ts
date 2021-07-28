import { Command, EditorView } from '@codemirror/view'
import { addToast, ToastType } from '../toasts'
import { BrowserSvgRenderer, compileToSequence, Diagram } from 'selena'
import { saveDocument } from '../storage'

function setRenderedElement (parent: HTMLElement, element: Element): void {
  // insert the element in a way that preserves Browser scrolling
  while (parent.childNodes.length > 1) {
    parent.childNodes[0].remove()
  }
  if (parent.childNodes.length === 1) {
    parent.childNodes[0].replaceWith(element)
  } else {
    parent.appendChild(element)
  }
}

function update (input: string, outputTo: HTMLElement): void {
  const diag = Diagram.create(compileToSequence(input))

  const svgRenderer = new BrowserSvgRenderer(50, 20)
  diag.layout(svgRenderer)
  svgRenderer.prepare(diag.getComputedSize())
  diag.draw(svgRenderer)
  const element = svgRenderer.finish()

  setRenderedElement(outputTo, element)
}

export function createCompileCommand (outputParent: HTMLElement): Command {
  return (view: EditorView): boolean => {
    const text = view.state.doc.sliceString(0)
    saveDocument(text)
    try {
      update(text, outputParent)
    } catch (e) {
      console.error(e)
      addToast('Compilation failed. Please check your input for errors.', ToastType.BAD)
    }
    return true
  }
}
