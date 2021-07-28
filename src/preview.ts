import { BrowserSvgRenderer, compileToSequence, Diagram } from 'selena'

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

export function updatePreview (input: string, outputTo: HTMLElement): boolean {
  let diag
  try {
    diag = Diagram.create(compileToSequence(input))
  } catch (e) {
    return false
  }

  const svgRenderer = new BrowserSvgRenderer(50, 20)
  diag.layout(svgRenderer)
  svgRenderer.prepare(diag.getComputedSize())
  diag.draw(svgRenderer)
  const element = svgRenderer.finish()

  setRenderedElement(outputTo, element)
  return true
}
