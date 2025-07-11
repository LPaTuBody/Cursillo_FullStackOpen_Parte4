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

    test('toJSON replaces the "_id" property with the "id" one', async () => {
        const response = await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        response.body.forEach(blog => {
            Object.hasOwn(blog, 'id') && !Object.hasOwn(blog, '_id')
            ? assert.ok(true)
            : assert.fail('Blog object does not have "id" or still has "_id"')
        })
    })

    test('POST /api/blogs creates a new blog', async () => {
        const dbBefore = await helper.blogsInDB()

        const newBlog = {
            title: "Ejemplificando el ejemplo",
            author: "E. Charles White",
            url: "https://techwhispersdaily.net",
            likes: 56527
        }

        const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

        const { id, ...rest } = response.body
        assert.deepStrictEqual(rest, newBlog)

        const dbAfter = await helper.blogsInDB()
        assert.strictEqual(dbAfter.length, dbBefore.length + 1)
    })

    test('POST /api/blogs sets "likes" to 0 if not provided', async () => {
        // Test for missing likes 
        const noLikesBlog = {
            title: "Sin likes, 0 resulta",
            author: "John Doe",
            url: "https://nolikesneeded.com"
        }

        const response = await api
        .post('/api/blogs')
        .send(noLikesBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, 0)

        // Test for likes provided
        const withLikes = {
            ...noLikesBlog,
            title: "Con likes, pues pon los likes",
            likes: 16
        }

        const responseWithLikes = await api
        .post('/api/blogs')
        .send(withLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/)

        assert.strictEqual(responseWithLikes.body.likes, withLikes.likes)
    })

    test('POST /api/blogs requires "title" and "url" fields', async () => {
        // Test for missing title
        const noTitleBlog = {
            author: "Jane Doe",
            url: "https://notitle.com",
            likes: 42
        }

        const resNoTitle = await api
        .post('/api/blogs')
        .send(noTitleBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        assert.strictEqual(resNoTitle.body.error.includes('Title is required'), true)

        // Test for missing URL
        const noUrlBlog = {
            title: "No URL provided",
            author: "Jane Doe"
        }

        const resNoUrl = await api
        .post('/api/blogs')
        .send(noUrlBlog)
        .expect(400)
        .expect('Content-Type', /application\/json/)

        assert.strictEqual(resNoUrl.body.error.includes('URL is required'), true)
    })

    after(() => {
        mongoose.connection.close()
    })
})