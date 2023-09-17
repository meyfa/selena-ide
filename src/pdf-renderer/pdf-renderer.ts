import { Size, Point, DirectRenderer, LineMarker, StrokeOptions } from 'selena'
// @ts-expect-error - missing type definitions for this import
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'

function computeAngle (a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.atan2(dy, dx) * 180 / Math.PI
}

/**
 * Selena renderer implementation for rendering to a PDFKit PDFDocument.
 * Right after construction, the pipe() method should be called to stream PDF data to some output.
 */
export class PdfRenderer implements DirectRenderer<PDFKit.PDFDocument> {
  private readonly measureDoc: PDFKit.PDFDocument
  private readonly doc: PDFKit.PDFDocument
  private readonly hPadding: number
  private readonly vPadding: number

  constructor (hPadding: number, vPadding: number) {
    this.measureDoc = new PDFDocument()
    this.doc = new PDFDocument({
      autoFirstPage: false
    })
    this.hPadding = hPadding
    this.vPadding = vPadding
  }

  prepare (diagramSize: Size): void {
    this.doc.addPage({
      size: [diagramSize.width + 2 * this.hPadding, diagramSize.height + 2 * this.vPadding]
    })
    this.doc.translate(this.hPadding, this.vPadding)
  }

  finish (): PDFKit.PDFDocument {
    this.doc.end()
    return this.doc
  }

  pipe<T extends NodeJS.WritableStream> (stream: T): T {
    return this.doc.pipe(stream)
  }

  measureText (str: string, fontSize: number): Size {
    this.measureDoc.fontSize(fontSize)
    return new Size(this.measureDoc.widthOfString(str), this.measureDoc.heightOfString(str))
  }

  renderBox (start: Point, size: Size, options?: StrokeOptions): void {
    this.doc.save()
    this.doc.lineWidth(options?.lineWidth ?? 1)
    if (options?.dashed === true) {
      this.doc.dash(4, {})
    }
    this.doc.rect(start.x, start.y, size.width, size.height)
      .fillAndStroke('white', 'black')
    this.doc.restore()
  }

  renderLine (start: Point, end: Point, options?: StrokeOptions): void {
    this.doc.save()
    this.doc.lineWidth(options?.lineWidth ?? 1)
    if (options?.dashed === true) {
      this.doc.dash(4, {})
    }
    this.doc.moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      .stroke('black')
    this.doc.restore()
  }

  private renderMarker (marker: LineMarker, position: Point, rotation: number, lineWidth: number): void {
    if (marker === LineMarker.NONE) {
      return
    }
    this.doc.save()
      .translate(position.x, position.y)
      .rotate(rotation)
      .lineWidth(lineWidth)
    switch (marker) {
      case LineMarker.CIRCLE_FULL:
        this.doc.path('M-6,0 A6,6 0 1 0 6,0 M-6,0 A6,6 0 1 1 6,0').fill()
        break
      case LineMarker.ARROW_OPEN:
        this.doc.path('M-12,-6 L0,0 L-12,6').stroke()
        break
      case LineMarker.ARROW_FULL:
        this.doc.path('M-12,-6 L0,0 L-12,6').fill()
        break
      case LineMarker.ARROW_INTO_CIRCLE_FULL:
        this.doc.path('M-18,-6 L-6,0 L-18,6 Z M-6,0 A6,6 0 1 0 6,0 M-6,0 A6,6 0 1 1 6,0').fill()
        break
    }
    this.doc.restore()
  }

  renderPolyline (points: Point[], end1: LineMarker, end2: LineMarker, options?: StrokeOptions): void {
    this.doc.save()
    const lineWidth = options?.lineWidth ?? 1
    this.doc.lineWidth(lineWidth)
    if (options?.dashed === true) {
      this.doc.dash(4, {})
    }
    this.doc.moveTo(points[0].x, points[0].y)
    for (const { x, y } of points) {
      this.doc.lineTo(x, y)
    }
    this.doc.stroke('black')
    this.doc.restore()
    this.renderStartMarker(points, end1, lineWidth)
    this.renderEndMarker(points, end2, lineWidth)
  }

  private renderStartMarker (points: Point[], marker: LineMarker, lineWidth: number): void {
    const position = points.at(0)
    const nextPosition = points.at(1)
    if (position != null && nextPosition != null) {
      this.renderMarker(marker, position, computeAngle(position, nextPosition), lineWidth)
    }
  }

  private renderEndMarker (points: Point[], marker: LineMarker, lineWidth: number): void {
    const position = points.at(-1)
    const previousPosition = points.at(-2)
    if (position != null && previousPosition != null) {
      this.renderMarker(marker, position, computeAngle(previousPosition, position), lineWidth)
    }
  }

  renderPath (data: string, offset: Point, options?: StrokeOptions): void {
    this.doc.save()
    this.doc.lineWidth(options?.lineWidth ?? 1)
    if (options?.dashed === true) {
      this.doc.dash(4, {})
    }
    this.doc.translate(offset.x, offset.y)
      .path(data)
      .stroke('black')
    this.doc.restore()
  }

  renderText (text: string, position: Point, fontSize: number): void {
    this.doc.save()
    this.doc
      .fontSize(fontSize)
      .text(text, position.x, position.y, {
        align: 'left',
        baseline: 'bottom',
        lineBreak: false
      })
      .fill('black')
    this.doc.restore()
  }
}
