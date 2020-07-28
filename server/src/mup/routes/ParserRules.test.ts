import { RexParser, ParserResult } from './RexParser'
import Logger from '../../lib/Logger'

test('parser rules', () => {
  const pres: ParserResult | undefined = RexParser.parseCommands('goto cell')
  expect(pres?.rule?.cname).toBe('goto')
  expect(pres?.parsed?.groups.roomName).toBe('cell')
})
