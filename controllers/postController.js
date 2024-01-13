import Post from '../models/PostModal.js';
import User from '../models/UserModel.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthorizedError } from '../errors/customError.js';
import cloudinary from 'cloudinary';

export const getPost = async (req, res) => {
  const post = await Post.findById(req.params.postId);
  res.status(StatusCodes.OK).json({ post });
};

export const createPost = async (req, res) => {
  const newPost = req.body;
  newPost.postedBy = req.user.userId;

  const maxLength = 500;
  if (newPost.text > maxLength)
    throw new BadRequestError(`Text must be less than ${maxLength} characters`);

  if (newPost.img) {
    const response = await cloudinary.v2.uploader.upload(newPost.img);
    newPost.img = response.secure_url;
  }

  const post = await Post.create(newPost);

  res.status(StatusCodes.CREATED).json({ post });
};

export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (post.postedBy.toString() !== req.user.userId)
    throw new UnauthorizedError('Unauthorized to delete post');

  if (post.img) {
    const imgId = post.img.split('/').pop().split('.')[0];
    await cloudinary.v2.uploader.destroy(imgId);
  }

  await Post.findByIdAndDelete(req.params.postId);

  res.status(StatusCodes.OK).json({ msg: 'post deleted successfully' });
};

export const likeUnlikePost = async (req, res) => {
  const currentPost = await Post.findById(req.params.postId);

  const isLiked = currentPost.likes.includes(req.user.userId);

  if (isLiked) {
    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { likes: req.user.userId },
    });
    res.status(StatusCodes.OK).json({ msg: 'post unLiked' });
  } else {
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { likes: req.user.userId },
    });
    res.status(StatusCodes.OK).json({ msg: 'post liked' });
  }
};

export const replyToPost = async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post)
    throw new BadRequestError(
      `no post with postID ${req.params.postId} exists`
    );

  const user = await User.findById(req.user.userId);
  const reply = {
    userId: user._id,
    userAvatar: user.avatar,
    username: user.username,
    text,
  };

  post.replies.unShift(reply);
  await post.save();

  res.status(StatusCodes.OK).json({ msg: 'post added successfully', reply });
};

export const getFeedPosts = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const following = user.following;

  const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
    createdAt: -1,
  });

  res.status(StatusCodes.OK).json({ feedPosts });
};

export const getAllPosts = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user)
    throw new BadRequestError(`No user found with username : ${username}`);

  const posts = await Post.find({ postedBy: user._id }).sort('-createdAt');
  res.status(StatusCodes.OK).json({ posts });
};
