const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper.js')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

describe('API Blogs Tests)', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initBlogs)
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

    describe('Blog Creation Tests', () => {
        test('POST creates a new blog with valid data', async () => {
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

        test('POST sets "likes" to 0 if not provided', async () => {
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
            assert.strictEqual(response.body.title, noLikesBlog.title)
        })

        test('POST requires "title" and "url" fields', async () => {
            // Test for missing title
            const noTitleBlog = {
                author: "Jane Doe",
                url: "https://notitle.com",
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
    })

    describe('Blog Deletion Tests', () => {
        test('DELETE removes a blog by ID', async () => {
            const dbBefore = await helper.blogsInDB()
            const blogToDelete = dbBefore[0]

            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

            const dbAfter = await helper.blogsInDB()
            assert.strictEqual(dbAfter.length, dbBefore.length - 1)
            assert.strictEqual(dbAfter.find(b => b.id === blogToDelete.id), undefined)
        })

        test('DELETE returns 404 for non-existent blog ID', async () => {
            const id = await helper.nonExistingId()  // new mongoose.Types.ObjectId()
            await api
            .delete(`/api/blogs/${id}`)
            .expect(404)
        })

        test('DELETE returns 400 for invalid ID format', async () => {
            await api
            .delete(`/api/blogs/${77777777}`)
            .expect(400)
        })
    })

    describe('Blog Update Tests', () => {
        test('PUT updates a blog by ID', async () => {
            const dbBefore = await helper.blogsInDB()
            const updatedBlog = {...dbBefore[0], author: "E. Charles White" }

            const response = await api
            .put(`/api/blogs/${updatedBlog.id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

            assert.deepStrictEqual(response.body, updatedBlog)

            const dbAfter = await helper.blogsInDB()
            assert.strictEqual(dbAfter.length, dbBefore.length)
        })

        test('PUT returns 404 for non-existent blog ID', async () => {
            const id = await helper.nonExistingId()
            const updatedBlog = { title: "I'm not real, lol", url: "https://nowhere.com" }

            await api
            .put(`/api/blogs/${id}`)
            .send(updatedBlog)
            .expect(404)
        })

        test('PUT returns 400 for invalid ID format', async () => {
            const updatedBlog = { title: "Who says 77777777 is invalid?", url: "https://invalid.com" }

            await api
            .put(`/api/blogs/${77777777}`)
            .send(updatedBlog)
            .expect(400)
        })
    })

    after(() => {
        mongoose.connection.close()
    })
})