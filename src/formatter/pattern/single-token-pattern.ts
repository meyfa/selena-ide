import { TokenType } from 'selena'
import { Formatter } from '../formatter.js'
import { Pattern } from './pattern.js'

export class SingleTokenPattern implements Pattern {
  constructor (
    private readonly type: TokenType | undefined,
    private readonly value: string | undefined,
    private readonly consume: boolean
  ) {
  }

  test (formatter: Formatter): boolean {
    return this.type == null || formatter.matches(this.type, this.value)
  }

  apply (formatter: Formatter): void {
    if (this.consume) {
      formatter.append()
    }
  }
}
