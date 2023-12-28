import User from '../models/UserModel.js';
import Post from '../models/PostModal.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from 'cloudinary';
import { formatImage } from '../middleware/multerMiddleware.js';
import { BadRequestError } from '../errors/customError.js';
import { hashPassword } from '../utils/passwordUtils.js';
import mongoose from 'mongoose';

export const getCurrentUser = async (req, res) => {
  // const user = await User.findOne({ _id: req.user.userId }).select('-password');

  const user = await User.findOne({ _id: req.user.userId });
  const userWithoutPassword = user.toJSON();
  res.status(StatusCodes.OK).json({ user: userWithoutPassword });
};

export const getUserProfile = async (req, res) => {
  // const user = await User.findOne({ _id: req.user.userId });
  // const userWithoutPassword = user.toJSON();

  const { query } = req.params;

  let user;
  if (mongoose.Types.ObjectId.isValid(query)) {
    user = await User.findOne({ _id: query })
      .select('-password')
      .select('-updatedAt');
  } else {
    user = await User.findOne({ username: query })
      .select('-password')
      .select('-updatedAt');
  }
  if (!user) throw new BadRequestError('User not found');
  res.status(StatusCodes.OK).json({ user });
};

export const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;

  let user = await User.findById(req.user.userId);

  if (password) user.password = await hashPassword(password);

  if (req.file) {
    if (user.avatar) {
      await cloudinary.v2.uploader.destroy(
        user.avatar.split('/').pop().split('.')[0]
      );
    }
    const file = formatImage(req.file);
    const response = await cloudinary.v2.uploader.upload(file);
    user.avatar = response.secure_url;
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.username = username || user.username;
  user.bio = bio || user.bio;

  user = await user.save();

  // password should be null in response
  user.password = null;

  // find all posts that user replies and update username and avatar
  await Post.updateMany(
    { 'replies.userId': user._id },
    {
      $set: {
        'replies.$[reply].username': user.username,
        'replies.$[reply].userAvatar': user.avatar,
      },
    },
    { arrayFilters: [{ 'reply.userId': user._id }] }
  );

  res.status(StatusCodes.OK).json({ user });
};

export const followUnFollowUser = async (req, res) => {
  if (req.user.userId === req.params.id)
    throw new BadRequestError('You can not follow/unFollow yourself');

  const currentUser = await User.findById(req.user.userId);
  const userToModify = await User.findById(req.params.id);

  if (!userToModify) throw new BadRequestError('User not found');

  const isFollowing = currentUser.following.includes(req.params.id);

  if (isFollowing) {
    // UnFollow User
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { following: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.userId },
    });
    res.status(StatusCodes.OK).json({ msg: 'UnFollow successfully' });
  } else {
    // Follow
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { following: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.userId },
    });
    res.status(StatusCodes.OK).json({ msg: 'Follow successfully' });
  }
};

export const getSuggestedUsers = async (req, res) => {
  // exclude current user from suggested users array and also include users that current user is already following
  const userId = req.user.userId;

  const usersFollowedByYou = await User.findById(userId).select('following');

  const randomUsers = await User.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(userId) },
        isFrozen: false,
      },
    },
    {
      $sample: { size: 10 }, // selecting random documents from a collection.
    },
  ]);

  const filteredUsers = randomUsers.filter(
    (user) => !usersFollowedByYou.following.includes(user._id)
  );

  const suggestedUsers = filteredUsers.slice(0, 5);

  suggestedUsers.forEach((user) => delete user.password);

  res.status(StatusCodes.OK).json({ suggestedUsers });
};

export const freezeAccount = async (req, res) => {
  const user = await User.findById(req.user.userId);
  user.isFrozen = true;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'your account is frozen' });
};

export const getFollowers = async (req, res) => {
  const user = await User.findById(req.params.id);
  const followers = await User.find({ _id: { $in: user.followers } });
  res.status(StatusCodes.OK).json({ followers });
};

export const getFollowings = async (req, res) => {
  const user = await User.findById(req.params.id);
  const followings = await User.find({ _id: { $in: user.following } });
  res.status(StatusCodes.OK).json({ followings });
};
