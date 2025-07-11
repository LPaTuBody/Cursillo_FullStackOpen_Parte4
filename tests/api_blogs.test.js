const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper.js')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

describe('API Blogs Tests', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        for (const b of helper.initBlogs) {
            let blogObject = new Blog(b)
            await blogObject.save()
        }
    })

    test('GET /api/blogs returns all blogs', async () => {
        const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        const blogsInDB = await helper.blogsInDB()
        assert.strictEqual(response.body.length, blogsInDB.length)
    })

    after(() => {
        mongoose.connection.close()
    })
})