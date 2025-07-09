const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')

// Obteniendo todos los blogs
blogsRouter.get('/', (req, res) => {
    Blog.find({}).then(blogs => res.json(blogs))
})

// Posteando un nuevo blog
blogsRouter.post('/', (req, res) => {
    const body = req.body
    if (!body.title || !body.url) {
        return res.status(400).json({ error: 'Title or url missing.' })
    }
    const blog = new Blog({
        title: body.title,
        author: body.author || 'Unknown',
        url: body.url,
        likes: body.likes || 0,
    })
    blog.save()
    .then(result => res.status(201).json(result))
    .catch(error => next(error))
})

module.exports = blogsRouter