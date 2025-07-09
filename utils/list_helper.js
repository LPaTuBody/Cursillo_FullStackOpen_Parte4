const dummy = () => { return 1 }

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favBlog = (blogs) => {
  if (blogs.length === 0) return null
  const favBlog = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])
  return {
    title: favBlog.title,
    author: favBlog.author,
    likes: favBlog.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  const authorBlogCount = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + 1
    // console.log(acc, "-", blog)
    return acc
  }, {})
  const mba = Object.entries(authorBlogCount).reduce((max, current) => {
    // console.log(max, "-", current)
    return current[1] > max[1] ? current : max
  }, ["", 0])
  return { author: mba[0], blogs: mba[1] }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  const authorLikesCount = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})
  const mla = Object.entries(authorLikesCount).reduce((max, current) => {
    return current[1] > max[1] ? current : max
  }, ["", 0])
  return { author: mla[0], likes: mla[1] }
}

module.exports = { dummy, totalLikes, favBlog, mostBlogs, mostLikes }