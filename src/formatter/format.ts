import { tokenize, TokenType } from 'selena'
import { Formatter, Separator } from './formatter'
import { WhitespaceMemory } from './whitespace-memory'
import { matching, matchingAnything, matchingNothing } from './pattern/patterns'
import { Pattern } from './pattern/pattern'

function formatOptions (): Pattern {
  return matching(TokenType.PAREN_LEFT)
    .any({})
    .repeat()
    .until(TokenType.PAREN_RIGHT)
}

function formatReturn (): Pattern {
  return matching(TokenType.WORD, 'return')
    .matching({ before: Separator.SPACE }, TokenType.STRING)
}

function formatMessageBlock (): Pattern {
  return matching(TokenType.BLOCK_LEFT)
    .withOneOf({ before: Separator.NEWLINE, after: Separator.NEWLINE }, [
      formatReturn,
      formatFoundMessage,
      formatMessage,
      matchingAnything
    ])
    .repeat()
    .indentContent()
    .until(TokenType.BLOCK_RIGHT)
}

function formatMessage (): Pattern {
  return matching(TokenType.ARROW)
    .with({ after: Separator.SPACE }, formatOptions)
    .any({}) // target
    .matching({ before: Separator.SPACE }, TokenType.STRING)
    .with({ before: Separator.SPACE }, formatMessageBlock)
}

function formatFoundMessage (): Pattern {
  return matching(TokenType.WORD, '*')
    .with({}, formatMessage)
}

function formatObject (): Pattern {
  return matching(TokenType.WORD, 'object')
    .with({}, formatOptions)
    .any({ before: Separator.SPACE }) // name
    .any({ before: Separator.SPACE, after: Separator.SPACE }) // '='
    .any({}) // label
}

function formatAll (): Pattern {
  return matchingNothing()
    .withOneOf({ after: Separator.NEWLINE }, [
      formatObject,
      formatFoundMessage,
      formatMessage,
      matchingAnything
    ])
    .repeat()
}

export function format (input: string): string {
  const tokens = tokenize(input)
  const formatter = new Formatter(tokens, new WhitespaceMemory(input), {
    keepEmptyLines: 1
  })

  formatAll().apply(formatter)

  return formatter.getResult()
}
