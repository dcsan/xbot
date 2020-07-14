// const assert = require('chai').assert
// const Game = require('../src/mup/Game')



// const testGame = new Game(123)
// testGame.reload('office-hack', false)
// console.log('game created', testGame)



// function main () {



// }
const test = require('ava');

test('foo', t => {
	t.pass();
});

test('bar', async t => {
	const bar = Promise.resolve('bar');
	t.is(await bar, 'bar');
});

