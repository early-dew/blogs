const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();


const api = supertest(app)

const initialBlogs = [
  {
    title: "Reversed crunches",
    author: "Anna Funk",
    url: "www.gymrat.com",
    likes: 22
  },
  {
    title: "Healthy gums",
    author: "Ron Teethy",
    url: "www.mynewtheeth.com",
    likes: 18
  },
]



describe('tests without deletion', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(initialBlogs);
  })


  // beforeEach(async () => {
  //   await Blog.deleteMany({});
  //   await Blog.insertMany(initialBlogs);
  // })

  // let blogObject = new Blog(initialBlogs[0])
  // await blogObject.save()
  // blogObject = new Blog(initialBlogs[1])
  // await blogObject.save()


  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('blog key id', async () => {
    const response = await api.get('/api/blogs')
    const blogKeysArr = response.body.map(b => Object.keys(b))
    const blogId = blogKeysArr.map(keys => keys.includes('id') && !keys.includes('_id'))
    expect(blogId).toBeDefined()
  })



  test('blog without likes is not added', async () => {

    const newBlog = {
      title: 'Best appartments for students',
      author: 'Lily Little',
      url: 'www.findaflat.ee',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })


  test('blog without title or url is not added', async () => {
    const newBlog = {
      title: 'Best appartments for students',
      author: 'Lily Little',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('update blog', async () => {

    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      title: "Reversed crunches",
      author: "Anna Funk",
      url: "www.gymrat.com",
      likes: 222
    }

    console.log(newBlog)
    console.log(blogToUpdate)
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)


    const updatedBlog = await Blog.findById(blogToUpdate.id);
    expect(updatedBlog.title).toBe(newBlog.title)
    expect(updatedBlog.author).toBe(newBlog.author)
    expect(updatedBlog.url).toBe(newBlog.url)
    expect(updatedBlog.likes).toBe(newBlog.likes)
  })


  //USER

  describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('expected `username` to be unique')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toEqual(usersAtStart)
    })
  })



  // test('add blog', async () => {

  //   const userId = '' //Add user id to test
  //   const token = jwt.sign({ id: userId }, process.env.SECRET);

  //   console.log("TOKEN", token)

  //   const newBlog = {
  //     title: "AI is more human than humans",
  //     author: "Ben Berry",
  //     url: "www.writtenessays.de",
  //     likes: 39,
  //     user: userId,
  //   }

  //   await api
  //     .post('/api/blogs')
  //     .send(newBlog)
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect(201)
  //     .expect('Content-Type', /application\/json/)

  //   const response = await api.get('/api/blogs')
  //   const titles = response.body.map(b => b.title)
  //   expect(response.body).toHaveLength(initialBlogs.length + 1)
  //   expect(titles).toContain('AI is more human than humans')
  // })

})



describe('adding and deleting', () => {
  //DELETE BLOG - WORKS WITH ADD TOGETHER
  // ADD NEW USER ID
  let userId


  test('add blog', async () => {

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root2', passwordHash })
    userId = user.id

    await user.save()

    const token = jwt.sign({ id: userId }, process.env.SECRET);

    console.log("TOKEN", token)

    const newBlog = {
      title: "AI is more human than humans",
      author: "Ben Berry",
      url: "www.writtenessays.de",
      likes: 39,
      user: userId,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)
    expect(titles).toContain('AI is more human than humans')
    expect(response.body).toHaveLength(initialBlogs.length + 1)
  })

  test('delete blog', async () => {

    const token = jwt.sign({ id: userId }, process.env.SECRET);


    // const user = request.user

    // const notesInDb = async () => {
    //   const notes = await Note.find({})
    //   return notes.map(note => note.toJSON())
    // }
    // const blogsAtStart = await Blog.find({})
    // const response = await blogsAtStart[0].deleteOne()
    // const blogToDelete = blogsAtStart[0]
    const currentUser = await User.findById(userId)
    const blogToDelete = currentUser.blogs.length > 0 ? currentUser.blogs[0].toString() : null;

    console.log('UserID', currentUser)
    console.log('blogToDelete', blogToDelete)

    await User.updateOne(
      { _id: userId },
      { $pull: { blogs: blogToDelete } }
    );

    await api
      .delete(`/api/blogs/${blogToDelete}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    // expect(currentUser.blogs.length).toHaveLength(0)
    // const notesAtEnd = await Blog.find({})
    // expect(notesAtEnd).toHaveLength(initialBlogs.length - 1)
  })


  test('adding blog fails when the user is unauthorized', async () => {
    // const unauthorizedUserId = ''
    // const token = jwt.sign({ id: '' }, process.env.SECRET);
    const token = ''
    console.log("TOKEN", token)

    const newBlog = {
      title: "AI is more human than humans",
      author: "Ben Berry",
      url: "www.writtenessays.de",
      likes: 39,
      user: userId,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })
})



afterAll(async () => {
  await mongoose.connection.close()
})
