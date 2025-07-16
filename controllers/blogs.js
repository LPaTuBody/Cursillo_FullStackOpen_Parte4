const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const wrapper = require('../utils/async_wrapper.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Sacando el token del encabezado
const getToken = (request) => {
    const authorization = request.get('authorization')
    return authorization && authorization.startsWith('Bearer ')
    ? authorization.replace('Bearer ', '') : null
}

// Obteniendo todos los blogs
blogsRouter.get('/', wrapper(async(req, res) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
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
    const decodedToken = jwt.verify(getToken(req), process.env.SECRET)
    if (!decodedToken.id) {
        return res.status(401).json({ error: 'Token invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title.trim(),
        author: body.author.trim() || 'Unknown',
        url: body.url.trim(),
        likes: body.likes || 0,
        user: user._id
    })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
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