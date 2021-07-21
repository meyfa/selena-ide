import { EditorView } from '@codemirror/view'
import { Diagnostic } from '@codemirror/lint'
import { compileToSequence, ParserError, TokenizerError } from 'selena'

function convertError (e: any): Diagnostic {
  let from = 0
  let to = 0
  if (e instanceof TokenizerError) {
    from = to = e.position
  } else if (e instanceof ParserError) {
    from = e.token.position
    to = e.token.position + e.token.value.length
  }
  return { from, to, severity: 'error', message: e?.toString() ?? '' }
}

export function selenaLinter (view: EditorView): Diagnostic[] {
  const input = view.state.doc.sliceString(0)

  try {
    compileToSequence(input)
  } catch (e) {
    return [convertError(e)]
  }

  return []
}
