const { test, describe } = require('node:test')
const assert = require('node:assert')
const favBlog = require('../utils/list_helper').favBlog

describe('favorite blog', () => {
    const oneFavBlog = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        }
    ]

    const twoFavBlog = [
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 41,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 37,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 41,
            __v: 0
        }
    ]

    const oneBlog = [{
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 23,
        __v: 0
    }]

    test('when list has only one blog, equals that blog', () => {
        const result = favBlog(oneBlog)
        const espected = {
            title: oneBlog[0].title,
            author: oneBlog[0].author,
            likes: oneBlog[0].likes
        }
        assert.deepStrictEqual(result, espected)
    })

    test('when list has only one favorite blog, equals that blog', () => {
        const result = favBlog(oneFavBlog)
        const expected = {
            title: oneFavBlog[2].title,
            author: oneFavBlog[2].author,
            likes: oneFavBlog[2].likes
        }
        assert.deepStrictEqual(result, expected)
    })

    test('when list has two or more blogs with the same amount of likes, returns one of them', () => {
        const result = favBlog(twoFavBlog)
        const expected = {
            title: twoFavBlog[0].title,
            author: twoFavBlog[0].author,
            likes: twoFavBlog[0].likes
        }
        assert.deepStrictEqual(result, expected)
    })
})