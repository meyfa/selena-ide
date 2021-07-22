import { TokenType } from 'selena'
import { Formatter, Separator } from '../formatter'

export interface Separators {
  before?: Separator
  after?: Separator
}

export interface Pattern {
  test: (formatter: Formatter) => boolean

  apply: (formatter: Formatter) => void
}

export interface SimplePattern extends Pattern {
  any: (sep: Separators) => this

  matching: (sep: Separators, type: TokenType, value?: string) => this

  with: (sep: Separators, fn: () => Pattern) => this

  withOneOf: (sep: Separators, fns: Array<() => Pattern>) => this

  repeat: () => RepeatedPattern
}

export interface RepeatedPattern extends Pattern {
  until: (type: TokenType) => SimplePattern

  indentContent: () => this
}
