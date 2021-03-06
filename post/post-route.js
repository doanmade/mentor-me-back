// env access
require('dotenv').config();

// package imports
const express = require('express');

// router extension
const router = express.Router();

// data imports
const posts = require('./post-model');
const users = require('../user/user-model');

// middleware
// const { checkRole } = require('../auth/checkRole'); // could use for admin panel if implemented

// incoming /api

// create post
router.post('/posts', async (req, res) => {
  const { post, category, type, user_fk } = req.body;
  const newPost = req.body;

  if ((!post, !category, !type, !user_fk)) {
    res
      .status(400)
      .json({ message: 'Missing required field, please try again.' });
  }

  try {
    const post = await posts.add(newPost);

    if (post) {
      res.status(201).json({
        post_id: post.id
        // FE may want more post content returned?
      });
    } else {
      res.status(500).json({ message: 'Post creation failure' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// create post with type answer
router.post('/answers', async (req, res) => {
  const { post, category, user_fk, post_fk } = req.body;
  let newAnswer = req.body;

  if ((!post, !category, !user_fk, !post_fk)) {
    res
      .status(400)
      .json({ message: 'Missing required field, please try again.' });
  }

  try {
    newAnswer = {
      ...newAnswer,
      type: 'answer'
    };

    const answer = await posts.add(newAnswer);
    const user = await users.getById(answer.user_fk);
    if (answer) {
      res.status(201).json({
        post_id: answer.id,
        post: answer.post,
        category: answer.category,
        type: answer.type,
        user_id: user.id,
        name: user.name,
        photo: user.photo
      });
    } else {
      res.status(500).json({ message: 'Post creation failure' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get all posts
router.get('/posts', (req, res) => {
  posts
    .get()
    .then(posts => {
      res.json({ posts });
    })
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Internal server error or invalid token' })
    );
});

// get questions with user information included
router.get('/questions', (req, res) => {
  posts
    .getQuestionsWithUsers()
    .then(questions => res.status(200).json(questions))

    //   })
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Internal server error or invalid token' })
    );
});

// get answers with user information included
router.get('/answers', (req, res) => {
  posts
    .getAnswers()
    .then(answers => res.status(200).json(answers))

    //   })
    .catch(err =>
      res
        .status(500)
        .json({ message: 'Internal server error or invalid token' })
    );
});

// get answers for question by question id
router.get('/answers/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const answers = await posts.getQuestionAnswers(id);
    if (!answers) {
      res
        .status(404)
        .json({ message: `No post with matching id, please try again.` });
    } else {
      res.status(200).json(answers);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error or invalid token' });
  }
});

// get post by id
router.get('/posts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const post = await posts.getPostById(id);
    if (!post) {
      res
        .status(404)
        .json({ message: `No post with matching id, please try again.` });
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error or invalid token' });
  }
});

// patch post by id
router.patch('/posts/:id', async (req, res) => {
  const id = req.params.id;
  const changes = req.body;

  try {
    const count = await posts.update(id, changes);

    if (count === 0) {
      res.status(404).json({ message: 'Post count not be found' });
    } else {
      res.status(200).json({ message: 'Update successful' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error or invalid token' });
  }
});

// delete post by id
router.delete('/posts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const count = await posts.remove(id);
    if (count === 1) {
      res.status(202).json({ deleted: id });
    } else {
      res
        .status(404)
        .json({ message: `No post with matching id, please try again.` });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// logout handles on client side, must destroy token
module.exports = router;
