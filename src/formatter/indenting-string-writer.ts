export class IndentingStringWriter {
  private readonly indentWith: string

  private out: string = ''
  indentation: number = 0

  constructor (indentWith = '\t') {
    this.indentWith = indentWith
  }

  write (str: string): this {
    const lines = str.split('\n')
    for (let i = 0; i < lines.length - 1; ++i) {
      this.writeLine(lines[i], true)
    }
    this.writeLine(lines[lines.length - 1], false)
    return this
  }

  private writeLine (line: string, terminated: boolean): void {
    if (this.out.length > 0 && this.out.endsWith('\n')) {
      this.out += this.indentWith.repeat(this.indentation)
    }
    this.out += line
    if (terminated) {
      this.out += '\n'
    }
  }

  toString (): string {
    return this.out
  }
}
