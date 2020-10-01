// emojiCharacters.js
export const Emoji = {
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
    '!': '❗', '?': '❓',
    ok: '🆗',
    next: '▶️',
    mag: '🔎',
    zzz: '💤',
    info: 'ℹ️',
    ask: '💁🏻‍♀️',
    host: '👩🏼‍⚕️'
  },

  findName(em): string | undefined {
    for (const [key, val] of Object.entries(Emoji.map)) {
      if (em === val) return key
    }
    return undefined
  }

};