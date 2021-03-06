import { Command } from '@codemirror/view'
import { addToast, ToastType } from '../toasts.js'
import { compileToSequence, Diagram } from 'selena'
import { PdfRenderer } from '../pdf-renderer/pdf-renderer.js'
import { blobStream } from '../util/blob-stream.js'

function triggerDownload (url: string): void {
  const download = document.createElement('a')
  download.download = 'diagram.pdf'
  download.href = url
  download.target = '_blank'
  download.click()
}

function exportPdf (input: string): void {
  const diag = Diagram.create(compileToSequence(input))

  const pdfRenderer = new PdfRenderer(50, 20)

  const stream = pdfRenderer.pipe(blobStream())
  stream.on('finish', () => {
    const url = stream.toBlobURL('application/pdf')
    triggerDownload(url)
  })

  diag.layout(pdfRenderer)
  pdfRenderer.prepare(diag.getComputedSize())
  diag.draw(pdfRenderer)
  pdfRenderer.finish()
}

export const exportPdfCommand: Command = (view): boolean => {
  const text = view.state.doc.sliceString(0)
  try {
    exportPdf(text)
  } catch (e) {
    console.error(e)
    addToast('Export failed. Please check your input for errors.', ToastType.BAD)
  }
  return true
}
