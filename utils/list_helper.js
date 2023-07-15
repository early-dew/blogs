const dummy = (number) => {
  return 1
}


const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (array) => {
  const Liked = array.sort((a, b) => b - a);
  return Liked[0]

}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,

}
