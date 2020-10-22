
import { SynManager } from './Synonyms';

it('should reduce vocab', async () => {
  const input = 'take robe'
  const out = SynManager.replaceSyns(input)
  expect(out).toBe('get robe')
})



it('should pass some basic regex stuff', () => {
  const line = "termsandconds|ask about terms|and"
  const rex = SynManager.makeRexFromLine(line)
  expect(rex.test('ask about terms')).toBe(true)
})


it('should reduce vocab', async () => {
  const clean = SynManager.replaceSyns('take gown')
  expect(clean).toBe('get gown')
})

it('should not mess up embedded words', async () => {
  const clean = SynManager.replaceSyns('take closet')
  expect(clean).toBe('get closet')
})

