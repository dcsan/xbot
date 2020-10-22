import { MakeLogger } from './LogLib'
const logger = new MakeLogger('BasePal')

// emojiCharacters.js
export const EmojiMap = {
  map: {
    a: '🇦', b: '🇧', c: '🇨', d: '🇩',
    e: '🇪', f: '🇫', g: '🇬', h: '🇭',
    i: '🇮', j: '🇯', k: '🇰', l: '🇱',
    m: '🇲', n: '🇳', o: '🇴', p: '🇵',
    q: '🇶', r: '🇷', s: '🇸', t: '🇹',
    u: '🇺', v: '🇻', w: '🇼', x: '🇽',
    y: '🇾', z: '🇿', 0: '0️⃣', 1: '1️⃣',
    2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
    6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣',
    10: '🔟', '#': '#️⃣', '*': '*️⃣',
    '!': '❗',
    '?': '❓',
    help: '❓',
    ok: '🆗',
    next: '▶️',
    mag: '🔎',
    zzz: '💤',
    info: 'ℹ️',
    ask: '💁🏻‍♀️',
    host: '👩🏼‍⚕️'
  },

  find(em): string {
    const emCode = EmojiMap.map[em]
    if (emCode) return emCode
    logger.warn('cannot find emoji for ', em)
    return '❓'
  }

};