import { EventEmitter } from 'events'

/**
 * A WritableStream that collects any chunks written to it.
 * After all data has been written, it can be converted into a Blob or a blob URL.
 */
export interface BlobStream extends NodeJS.WritableStream {
  toBlob: (type: string) => Blob
  toBlobURL: (type: string) => string
}

type StreamCallback = (err?: Error | null) => void

function isCallback (foo: StreamCallback | unknown): foo is StreamCallback {
  return typeof foo === 'function'
}

function encode (data: string | Uint8Array, encoding?: BufferEncoding): Uint8Array {
  if (data instanceof Uint8Array) {
    return data
  }
  if (encoding != null && !/^utf-?8$/i.test(encoding)) {
    throw new Error('This stream only supports UTF-8.')
  }
  return new TextEncoder().encode(data)
}

class BlobStreamImpl extends EventEmitter implements BlobStream {
  readonly writable = true

  private readonly chunks: Uint8Array[] = []
  private blob: Blob | undefined

  private handleError (err: unknown, cb?: (err?: (Error | null)) => void): void {
    if (cb != null) {
      this.once('error', cb)
    }
    this.emit('error', err)
  }

  write (arg0: Uint8Array | string, arg1?: ((err?: (Error | null)) => void) | BufferEncoding, arg2?: (err?: (Error | null)) => void): boolean {
    const cb = [arg1, arg2].find(isCallback)
    try {
      this.chunks.push(encode(arg0, typeof arg1 === 'string' ? arg1 : undefined))
    } catch (err) {
      this.handleError(err, cb)
      return false
    }
    if (cb != null) {
      cb()
    }
    return true
  }

  end (arg0?: (() => void) | string | Uint8Array, arg1?: (() => void) | BufferEncoding, arg2?: () => void): this {
    if (arg0 instanceof Uint8Array || typeof arg0 === 'string') {
      // This will also invoke the callback for us.
      this.write(arg0, arg1, arg2)
    } else {
      const cb = [arg0, arg1, arg2].find(isCallback)
      if (cb != null) {
        cb()
      }
    }
    this.emit('finish')
    this.emit('close')
    return this
  }

  toBlob (type: string = 'application/octet-stream'): Blob {
    if (this.blob == null) {
      this.blob = new Blob(this.chunks, { type })
      // free memory
      this.chunks.splice(0, this.chunks.length)
    }
    if (this.blob.type !== type) {
      this.blob = new Blob([this.blob], { type })
    }
    return this.blob
  }

  toBlobURL (type: string): string {
    return URL.createObjectURL(this.toBlob(type))
  }
}

export function blobStream (): BlobStream {
  return new BlobStreamImpl()
}
