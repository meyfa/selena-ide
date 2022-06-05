// @ts-expect-error
import { parser } from '../grammar/selena.js'
import { foldNodeProp, foldInside, LRLanguage, LanguageSupport } from '@codemirror/language'
import { styleTags, tags as t } from '@lezer/highlight'

// The following defines CodeMirror language support for Selena.
// This is used for syntax highlighting, code folding, and perhaps more.

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      String: t.string,
      LineComment: t.lineComment,
      Arrow: t.controlOperator,
      'ObjectDefinition/ObjectKeyword': t.definitionKeyword,
      ReturnKeyword: t.controlKeyword,
      ObjectName: t.local(t.variableName),
      Outside: t.constant(t.variableName),
      Option: t.annotation,
      '( )': t.paren,
      '{ }': t.brace,
      '=': t.definitionOperator
    }),
    foldNodeProp.add({
      MessageBlock: foldInside
    })
  ]
})

export const selenaLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    commentTokens: {
      line: '#'
    }
  }
})

export function selena (): LanguageSupport {
  return new LanguageSupport(selenaLanguage)
}
