const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: "64a1d8797db1663657a7fc8b",
      title: "Against Pronatalism",
      author: "Sally June",
      url: "www.childfreereflections.com",
      likes: 187,
      __v: 0
    },
    {
      _id: "64a2cdc9bb7fe4b3fca5d1ab",
      title: "Chicken Dishes",
      author: "Ken Foodie",
      url: "www.tastyandfast.com",
      likes: 434,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(621)
  })
})

describe('favorite blog', () => {
  const blogUnits = [
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    },
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 28
    }
  ]

  test('compare most liked blogs', () => {
    const blogLikes = blogUnits.map(blogUnit => blogUnit.likes)
    const mostLiked = listHelper.favoriteBlog(blogLikes)
    expect(mostLiked).toEqual(28)
  })
})

