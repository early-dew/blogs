const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor, tokenExtractor } = require('../utils/middleware')



// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }


blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)


    // Blog
    //     .find({})
    //     .then(blogs => {
    //         response.json(blogs)
    //     })
})

blogsRouter.post('/', tokenExtractor, userExtractor, async (request, response) => {

    const body = request.body
    const user = request.user
    // const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    // const decodedToken = jwt.verify(request.token, process.env.SECRET)

    // if (!decodedToken.id) {
    //     return response.status(401).json({ error: 'token invalid' })
    // }
    // const user = await User.findById(decodedToken.id)

    // const user = await User.findById(body.userId)

    if (typeof body.likes === 'undefined') {
        return response.status(400).json({ error: 'Likes field is required' })
    }
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user.id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
})


// async function removeBlogsFromUser() {
//     try {
//         const blogIds = ['64aefbc58e1c2a019dd3b99a'];
//         const userId = '64ada08908b8f7840cf437b3';

//         await User.updateOne(
//             { _id: userId },
//             { $pull: { blogs: { $in: blogIds } } }
//         );

//         console.log('Blogs removed from user successfully');
//     } catch (error) {
//         console.error('Error removing blogs from user:', error);
//     }
// }

// removeBlogsFromUser();


blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response) => {
    // await Blog.findByIdAndRemove(request.params.id)
    // response.status(204).end()
    // const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = request.user
    const blogId = request.params.id

    const blog = await Blog.findById(blogId);

    if (blog.user.toString() === user.id.toString()) {
        await Blog.findByIdAndRemove(request.params.id)
        await User.updateOne(
            { _id: user.id },
            { $pull: { blogs: blogId } }

        );
        response.status(204).end()
    }

    if (blog.user.toString() !== user.id) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    response.status(204).end();


})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedBlog)
})

module.exports = blogsRouter