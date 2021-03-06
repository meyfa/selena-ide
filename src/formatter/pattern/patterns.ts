import { TokenType } from 'selena'
import { BaseSimplePattern } from './base-simple-pattern.js'
import { SingleTokenPattern } from './single-token-pattern.js'
import { SimplePattern } from './pattern.js'

export function matching (type: TokenType, value?: string): SimplePattern {
  return new BaseSimplePattern(new SingleTokenPattern(type, value, true))
}

export function matchingAnything (): SimplePattern {
  return new BaseSimplePattern(new SingleTokenPattern(undefined, undefined, true))
}

export function matchingNothing (): SimplePattern {
  return new BaseSimplePattern(new SingleTokenPattern(undefined, undefined, false))
}
