import { Token } from 'selena'

export class WhitespaceMemory {
  private readonly input: string

  constructor (input: string) {
    this.input = input
  }

  getLinebreaksBefore (token: Token): number {
    let count = 0
    for (let pos = token.position - 1; pos >= 0; --pos) {
      const c = this.input.charAt(pos)
      if (!/\s/.test(c)) {
        break
      }
      if (c === '\n') {
        ++count
      }
    }
    return count
  }
}
