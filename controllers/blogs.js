const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const wrapper = require('../utils/async_wrapper.js')

// Obteniendo todos los blogs
blogsRouter.get('/', wrapper(async(req, res) => {
    const blogs = await Blog.find({})
    res.json(blogs)
}))

// Obteniendo un blog por su ID
blogsRouter.get('/:id', wrapper(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    blog ? res.json(blog) : res.status(404).end()
}))

// Posteando un nuevo blog
blogsRouter.post('/', wrapper(async(req, res) => {
    const body = req.body
    const blog = new Blog({
        title: body.title,
        author: body.author || 'Unknown',
        url: body.url,
        likes: body.likes || 0,
    })
    const result = await blog.save()
    res.status(201).json(result)
}))

// Actualizando un blog por su ID
blogsRouter.put('/:id', wrapper(async(req, res) => {
    const { title, author, url, likes } = req.body
    const updBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { title, author, url, likes },
        { new: true, runValidators: true, context: 'query' }
    )
    updBlog ? res.json(updBlog) : res.status(404).end()
}))

// Eliminando un blog por su ID
blogsRouter.delete('/:id', wrapper(async(req, res) => {
    const deleted = await Blog.findByIdAndDelete(req.params.id)
    deleted ? res.status(204).end() : res.status(404).end()
}))

module.exports = blogsRouter