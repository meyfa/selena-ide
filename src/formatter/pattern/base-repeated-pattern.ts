import { TokenType } from 'selena'
import { Formatter } from '../formatter'
import { Pattern, RepeatedPattern, SimplePattern } from './pattern'
import { BaseSimplePattern } from './base-simple-pattern'
import { PatternItem } from './pattern-item'

export class BaseRepeatedPattern implements RepeatedPattern {
  private end: TokenType | undefined
  private indent: boolean = false

  constructor (
    private readonly start: Pattern,
    private readonly content: PatternItem[]
  ) {
  }

  test (formatter: Formatter): boolean {
    return this.start.test(formatter)
  }

  apply (formatter: Formatter): void {
    this.start.apply(formatter)
    if (this.indent) {
      formatter.indent()
    }
    while (formatter.hasNext() && (this.end == null || !formatter.matches(this.end))) {
      this.content.forEach(item => item.tryApply(formatter))
    }
    if (this.indent) formatter.dedent()
    if (this.until != null) {
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
