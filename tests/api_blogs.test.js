const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const helper = require('./test_helper.js')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog.js')
const User = require('../models/user.js')

describe('API Blogs Tests', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        const user = await helper.decodedTUL()
        await Blog.insertMany(helper.initBlogs.map(blog => {
            return { ...blog, user: user.id }
        }))
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
            const token = await helper.tokenUserLoged()
            const user = await helper.decodedTUL()

            const newBlog = {
                title: "Ejemplificando el ejemplo",
                author: "E. Charles White",
                url: "https://techwhispersdaily.net",
                likes: 56527
            }

            const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            const { id, ...rest } = response.body
            assert.deepStrictEqual(rest, { ...newBlog, user: user.id })

            const dbAfter = await helper.blogsInDB()
            assert.strictEqual(dbAfter.length, dbBefore.length + 1)
        })

        test('POST sets "likes" to 0 if not provided', async () => {
            const token = await helper.tokenUserLoged()

            const noLikesBlog = {
                title: "Sin likes, 0 resulta",
                author: "John Doe",
                url: "https://nolikesneeded.com"
            }

            const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(noLikesBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.likes, 0)
            assert.strictEqual(response.body.title, noLikesBlog.title)
        })

        test('POST requires "title" and "url" fields', async () => {
            const token = await helper.tokenUserLoged()

            // Test for missing title
            const noTitleBlog = {
                author: "Jane Doe",
                url: "https://notitle.com",
            }

            const resNoTitle = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
            .send(noUrlBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            assert.strictEqual(resNoUrl.body.error.includes('URL is required'), true)
        })
    })

    describe('Blog Deletion Tests', () => {
        test('DELETE removes a blog by ID', async () => {
            const token = await helper.tokenUserLoged()
            const dbBefore = await helper.blogsInDB()
            const blogToDelete = dbBefore[0]

            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

            const dbAfter = await helper.blogsInDB()
            assert.strictEqual(dbAfter.length, dbBefore.length - 1)
            assert.strictEqual(dbAfter.find(b => b.id === blogToDelete.id), undefined)
        })

        test('Status 404 is returned for a non-existent blog ID', async () => {
            const token = await helper.tokenUserLoged()
            const id = await helper.nonExistingBlogId()  // new mongoose.Types.ObjectId()

            await api
            .delete(`/api/blogs/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
        })

        test('Status 400 is returned for an invalid ID format', async () => {
            const token = await helper.tokenUserLoged()

            await api
            .delete('/api/blogs/77777777')
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
        })

        test('Status 401 is returned if no valid token is provided', async () => {
            const dbBefore = await helper.blogsInDB()
            const blogToDelete = dbBefore[0]
            const expiredTUL = await helper.expiredTUL()
            await helper.sleep(1500)
            
            // No token provided
            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(401)

            // Invalid token
            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', 'Bearer 4702075')
            .expect(401)

            // Expired token
            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${expiredTUL}`)
            .expect(401)
        })

        test('Status 403 is returned if an user is unauthorized to delete', async () => {
            const dbBefore = await helper.blogsInDB()
            const blogToDelete = dbBefore[0]
            const tokenUUL = await helper.tokenUnauthUL()

            await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${tokenUUL}`)
            .expect(403)
        })
    })

    describe('Blog Update Tests', () => {
        test('PUT updates a blog by ID', async () => {
            const dbBefore = await helper.blogsInDB()
            const updatedBlog = { ...dbBefore[0], author: "E. Charles White" }

            const response = await api
            .put(`/api/blogs/${updatedBlog.id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

            assert.deepStrictEqual(response.body, {
                ...updatedBlog,
                user: updatedBlog.user.toString()
            })

            const dbAfter = await helper.blogsInDB()
            assert.strictEqual(dbAfter.length, dbBefore.length)
        })

        test('Status 404 is returned for a non-existent blog ID', async () => {
            const id = await helper.nonExistingBlogId()
            const updatedBlog = { title: "I'm not real, lol", url: "https://nowhere.com" }

            await api
            .put(`/api/blogs/${id}`)
            .send(updatedBlog)
            .expect(404)
        })

        test('Status 400 is returned for an invalid ID format', async () => {
            const updatedBlog = { title: "Who says 77777777 is invalid?", url: "https://invalid.com" }

            await api
            .put('/api/blogs/77777777')
            .send(updatedBlog)
            .expect(400)
        })
    })
})

describe('API Users Tests', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const pwdHash1 = await bcrypt.hash('sikret', 10)
        const primUser = new User({
            username: 'cute_user',
            name: 'E. Charles White',
            password: pwdHash1
        })
        await primUser.save()

        const pwdHash2 = await bcrypt.hash('victoriA', 10)
        const secUser = new User({
            username: 'random_user',
            name: 'Sharon Baraja Tullido',
            password: pwdHash2
        })
        await secUser.save()
    })

    test('toJSON replaces the "_id" property with the "id" one', async () => {
        const response = await api.get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        response.body.forEach(user => {
            Object.hasOwn(user, 'id') && !Object.hasOwn(user, '_id')
            ? assert.ok(true)
            : assert.fail('User object does not have "id" or still has "_id"')
        })
    })

    test('toJSON delete the "passwordHash" property', async () => {
        const response = await api.get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

        response.body.forEach(user => {
            !Object.hasOwn(user, 'passwordHash')
            ? assert.ok(true)
            : assert.fail('User still has "passwordHash"')
        })
    })

    describe('Creating new users', () => {
        test('POST creates a new user with valid data', async () => {
            const usersBefore = await helper.usersInDB()

            const newUser = {
                username: 'someValidUsername_idk',
                name: 'Zoila Masa K.',
                password: 'abduzcan'
            }

            await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

            const usersAfter = await helper.usersInDB()
            assert.strictEqual(usersAfter.length, usersBefore.length + 1)

            const usernames = usersAfter.map(u => u.username)
            assert(usernames.includes(newUser.username))
        })

        test('Status 400 is returned for invalid data', async () => {
            const usersBefore = await helper.usersInDB()

            const newUser = {
                username: 'A',
                name: 'Fulano',
                password: 'oo'
            }

            await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            const usersAfter = await helper.usersInDB()
            assert.strictEqual(usersAfter.length, usersBefore.length)
        })

        test('Status 400 and proper message are returned if username already taken', async () => {
            const usersBefore = await helper.usersInDB()

            const newUser = {
                username: 'cute_user',
                password: 'some_password',
            }

            const resp = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

            assert(resp.body.error.includes('Username must be unique'))

            const usersAfter = await helper.usersInDB()
            assert.strictEqual(usersAfter.length, usersBefore.length)
        })
    })
})

after(() => mongoose.connection.close())