import { TokenType } from 'selena'
import { Formatter } from '../formatter.js'
import { Pattern, RepeatedPattern, Separators, SimplePattern } from './pattern.js'
import { SingleTokenPattern } from './single-token-pattern.js'
import { BaseRepeatedPattern } from './base-repeated-pattern.js'
import { AlternativePattern } from './alternative-pattern.js'
import { PatternItem } from './pattern-item.js'

export class BaseSimplePattern implements SimplePattern {
  private readonly next: PatternItem[] = []

  constructor (
    private readonly start: Pattern
  ) {
  }

  test (formatter: Formatter): boolean {
    return this.start.test(formatter)
  }

  apply (formatter: Formatter): void {
    this.start.apply(formatter)
    this.next.forEach(item => item.tryApply(formatter))
  }

  any (sep: Separators): this {
    const pattern = new SingleTokenPattern(undefined, undefined, true)
    this.next.push(new PatternItem(sep, () => pattern))
    return this
  }

  matching (sep: Separators, type: TokenType, value?: string): this {
    const pattern = new SingleTokenPattern(type, value, true)
    this.next.push(new PatternItem(sep, () => pattern))
    return this
  }

  with (sep: Separators, fn: () => Pattern): this {
    this.next.push(new PatternItem(sep, fn))
    return this
  }

  withOneOf (sep: Separators, fns: Array<() => Pattern>): this {
    const pattern = new AlternativePattern(fns)
    this.next.push(new PatternItem(sep, () => pattern))
    return this
  }

  repeat (): RepeatedPattern {
    return new BaseRepeatedPattern(this.start, this.next)
  }
}
