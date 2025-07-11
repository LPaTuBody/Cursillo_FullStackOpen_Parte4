const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const wrapper = require('../utils/async_wrapper.js')

// Obteniendo todos los blogs
blogsRouter.get('/', wrapper(async(req, res) => {
    const blogs = await Blog.find({})
    res.json(blogs)
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
    const updBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true, context: 'query' }
    )
    res.json(updBlog)
}))

// Eliminando un blog por su ID
blogsRouter.delete('/:id', wrapper(async(req, res) => {
    await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
}))

module.exports = blogsRouter