const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const initBlogs = [
    {
        title: "Me enamoré de un PNG",
        author: "Ulises del Campo Wi-Fi",
        url: "https://renderanddespair.art.blog",
        likes: 1328
    },
    {
        title: "Crónicas de un scroll eterno",
        author: "Jazmín Dorsal Arremangada",
        url: "https://doomscrollanddie.substack.com",
        likes: 8042
    },
    {
        title: "La vez que vi Evangelion y me volví comunista",
        author: "Lautaro Inédito Pérez",
        url: "https://fujoshisyndrome.biz",
        likes: 42069
    }
]

// Relacionadas a la BD
const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDB = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const nonExistingBlogId = async () => {
    const blog = new Blog({ title: 'equisde', url: 'https://unsitio.com' })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

// Relacionadas a tokens
const tokenUserLoged = async () => {
    const user = await User.findOne({ username: 'cute_user' })
    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
        },
        process.env.SECRET
    )
    return token
}

const tokenUnauthUL = async () => {
    const user = await User.findOne({ username: 'random_user' })
    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
        },
        process.env.SECRET
    )
    return token
}

const expiredTUL = async () => {
    const user = await User.findOne({ username: 'cute_user' })
    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
        },
        process.env.SECRET,
        { expiresIn: 1 }
    )
    return token
}

const decodedTUL = async () => {
    const token = await tokenUserLoged()
    return jwt.verify(token, process.env.SECRET)
}

// misceláneo
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
    initBlogs, blogsInDB, nonExistingBlogId, usersInDB, sleep,
    tokenUserLoged, decodedTUL, tokenUnauthUL, expiredTUL
}