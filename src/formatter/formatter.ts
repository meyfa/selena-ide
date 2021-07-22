import { Token, TokenStream, TokenType } from 'selena'
import { IndentingStringWriter } from './indenting-string-writer'
import { WhitespaceMemory } from './whitespace-memory'

export enum Separator {
  NONE,
  SPACE,
  NEWLINE
}

export interface FormatterOptions {
  readonly keepEmptyLines: number
}

function separatorToString (sep: Separator): string {
  switch (sep) {
    case Separator.NONE:
      return ''
    case Separator.SPACE:
      return ' '
    case Separator.NEWLINE:
      return '\n'
  }
}

export class Formatter {
  private readonly tokens: TokenStream
  private readonly whitespace: WhitespaceMemory
  private readonly options: FormatterOptions

  private readonly output = new IndentingStringWriter()

  private first: boolean = true
  private bufferedSeparator: Separator = Separator.NONE

  constructor (tokens: TokenStream, whitespace: WhitespaceMemory, options: FormatterOptions) {
    this.tokens = tokens
    this.whitespace = whitespace
    this.options = options
  }

  getResult () {
    return this.output.toString() + '\n'
  }

  hasNext () {
    return this.tokens.hasNext()
  }

  private getAppropriateSeparator (minimumSep: Separator, token: Token, allowMultiline = false): string {
    const newlines = this.whitespace.getLinebreaksBefore(token)
    if (newlines === 0 || !allowMultiline) {
      return separatorToString(minimumSep)
    }
    const newlinesAllowed = this.options.keepEmptyLines + 1
    return '\n'.repeat(Math.min(newlinesAllowed, newlines))
  }

  private appendToken (minimumSep: Separator) {
    const token = this.tokens.next()
    // do not append a separator if this is the first token
    if (!this.first) {
      // empty lines between tokens are allowed to be kept for comments, or for pairs of tokens
      // where the separator is a newline
      // (in other words, tokens normally separated by a space cannot be separated by a newline)
      const multiline = token.type === TokenType.COMMENT || minimumSep === Separator.NEWLINE
      const sep = this.getAppropriateSeparator(minimumSep, token, multiline)
      this.output.write(sep)
    }
    this.output.write(token.value)
    this.first = false
  }

  private processComments (): void {
    while (this.tokens.hasNext()) {
      const token = this.tokens.peek()
      if (token.type !== TokenType.COMMENT) break
      this.appendToken(Separator.SPACE)
      // force a newline after a comment
      this.bufferedSeparator = Separator.NEWLINE
    }
  }

  matches (type: TokenType, value?: string): boolean {
    this.processComments()
    if (!this.tokens.hasNext()) {
      return false
    }
    const next = this.tokens.peek()
    return next.type === type && (value == null || next.value === value)
  }

  append (): this {
    this.processComments()
    if (this.tokens.hasNext()) {
      this.appendToken(this.bufferedSeparator)
      this.bufferedSeparator = Separator.NONE
    }
    return this
  }

  separate (sep: Separator): this {
    // if multiple separators are requested, use the largest one
    this.bufferedSeparator = Math.max(this.bufferedSeparator, sep)
    return this
  }

  indent (): this {
    ++this.output.indentation
    return this
  }

  dedent (): this {
    --this.output.indentation
    return this
  }
}
