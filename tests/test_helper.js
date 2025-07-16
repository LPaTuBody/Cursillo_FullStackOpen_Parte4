const Blog = require('../models/blog')
const User = require('../models/user')

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

const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDB = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'equisde', url: 'https://unsitio.com' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

module.exports = { initBlogs, blogsInDB, nonExistingId, usersInDB }