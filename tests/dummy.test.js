const { test } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = [1, 3]

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})