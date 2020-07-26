import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'

test('parser rules', () => {
  const result: ParserResult | undefined = RexParser.parseCommands('goto cell')
  expect(result?.rule?.cname).toBe('goto')
  expect(result?.parsed?.groups.roomName).toBe('cell')
})
