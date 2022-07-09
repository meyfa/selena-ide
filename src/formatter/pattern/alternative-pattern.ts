import { Formatter } from '../formatter.js'
import { Pattern } from './pattern.js'

export class AlternativePattern implements Pattern {
  constructor (
    private readonly options: Array<() => Pattern>
  ) {
  }

  test (formatter: Formatter): boolean {
    return this.options.some(option => option().test(formatter))
  }

  apply (formatter: Formatter): void {
    for (const option of this.options) {
      const pattern = option()
      if (pattern.test(formatter)) {
        pattern.apply(formatter)
        return
      }
    }
  }
}
