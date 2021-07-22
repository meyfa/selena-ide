import { Formatter } from '../formatter'
import { Pattern } from './pattern'

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
