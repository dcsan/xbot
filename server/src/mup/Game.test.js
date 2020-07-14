const test = require('ava');

const Game = require('./Game.js');

// describe('Game.js', () => {
//   it('can load a story', () => {
//     const game = new Game(1234)
//     game.reset()
//       expect(game).toBeDefined();
//       expect(game.story.room.name).toBe('office');
//       expect(game.sid).toBe(1234);
//   });
// });

//@ts-ignore
test('game loading', t => {

  const game = new Game(1234)
  game.reset(false)
  t.is(game.story.room.name, 'office')
  t.is(game.story.rooms.length, 1)
  t.is(game.story.room.actors.length, 1)

})