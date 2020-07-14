const sum = (a, b) => {
  return a + b
}

test('basic adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

