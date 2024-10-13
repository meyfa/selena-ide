import { TokenType } from 'selena'
import { Formatter } from '../formatter.js'
import { Pattern, RepeatedPattern, SimplePattern } from './pattern.js'
import { BaseSimplePattern } from './base-simple-pattern.js'
import { PatternItem } from './pattern-item.js'

export class BaseRepeatedPattern implements RepeatedPattern {
  private end: TokenType | undefined
  private indent = false

  constructor (
    private readonly start: Pattern,
    private readonly content: PatternItem[]
  ) {
  }

  test (formatter: Formatter): boolean {
    return this.start.test(formatter)
  }

  private applyContent (formatter: Formatter): void {
    if (this.indent) {
      formatter.indent()
    }
    while (formatter.hasNext() && (this.end == null || !formatter.matches(this.end))) {
      this.content.forEach((item) => item.tryApply(formatter))
    }
    if (this.indent) {
      formatter.dedent()
    }
  }

  apply (formatter: Formatter): void {
    // apply the start, then the content, then the closing token (if one is configured)
    this.start.apply(formatter)
    this.applyContent(formatter)
    if (this.end != null) {
      formatter.append()
    }
  }

  until (type: TokenType): SimplePattern {
    this.end = type
    return new BaseSimplePattern(this)
  }

  indentContent (): this {
    this.indent = true
    return this
  }
}
