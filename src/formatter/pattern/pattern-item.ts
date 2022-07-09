import { Formatter } from '../formatter.js'
import { Pattern, Separators } from './pattern.js'

export class PatternItem {
  constructor (
    private readonly sep: Separators,
    private readonly patternProvider: () => Pattern
  ) {
  }

  tryApply (formatter: Formatter): boolean {
    const pattern = this.patternProvider()
    if (pattern.test(formatter)) {
      if (this.sep.before != null) {
        formatter.separate(this.sep.before)
      }
      pattern.apply(formatter)
      if (this.sep.after != null) {
        formatter.separate(this.sep.after)
      }
      return true
    }
    return false
  }
}
