import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Flex, Box, Text, Image } from '@chakra-ui/react';
import { Actions } from '../Components';
import { useEffect, useState } from 'react';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { DeleteIcon } from '@chakra-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../features/post/postSlice';
import verifiedLogo from '../assets/images/verified.png';
import { format } from 'date-fns';

const DATE_FORMAT = 'd MMM yyyy';

const Post = ({ post }) => {
  const { user: currentUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [user, setUser] = useState([]);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await customFetch(`/users/profile/${post.postedBy}`);
      setUser(response.data.user);
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
      return errorMessage;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleDeletePost = async (e) => {
    e.preventDefault();

    try {
      if (!window.confirm('Are you sure you want to delete this post')) return;
      const response = await customFetch.delete(`/posts/${post._id}`);
      toast.success('Post deleted successfully');
      dispatch(deletePost(post._id));
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
      return errorMessage;
    }
  };

  if (!user) return null;

  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={4}>
        <Flex flexDirection={'column'} alignItems={'center'}>
          <Avatar
            size='md'
            name={user.name}
            src={user.avatar}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${user.username}`);
            }}
          />

          <Box w='1px' h='full' bg='grey.light' my={2}></Box>

          <Box position='relative' w='full'>
            {post.replies.length === 0 && <Text textAlign={'center'}>🥱</Text>}
            {post.replies[0] && (
              <Avatar
                size='xs'
                name='username'
                src={post.replies[0].userAvatar}
                position='absolute'
                top='0px'
                left='15px'
                padding='2px'
              />
            )}

            {post.replies[1] && (
              <Avatar
                size='xs'
                name='username'
                src={post.replies[1].userAvatar}
                position='absolute'
                bottom='0px'
                right='-5px'
                padding='2px'
              />
            )}
            {post.replies[2] && (
              <Avatar
                size='xs'
                name='username'
                src={post.replies[2].userAvatar}
                position='absolute'
                bottom='0px'
                left='4px'
                padding='2px'
              />
            )}
          </Box>
        </Flex>

        <Flex flex={1} flexDirection={'column'} gap={2}>
          {/* POST HEADER */}
          <Flex justifyContent={'space-between'}>
            <Flex w='full' alignItems='center'>
              <Text
                fontSize='sm'
                fontWeight='bold'
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${user.username}`);
                }}
              >
                {user.username}
              </Text>
              <Image src={verifiedLogo} h={4} ml={1} />
            </Flex>
            <Flex gap={4} alignItems='center'>
              <Text
                fontSize={'xs'}
                width={36}
                textAlign={'right'}
                color={'gray.light'}
              >
                {format(new Date(post.createdAt), DATE_FORMAT)}
              </Text>
              {currentUser?._id === user._id && (
                <DeleteIcon
                  cursor='pointer'
                  size={20}
                  onClick={handleDeletePost}
                />
              )}
            </Flex>
          </Flex>

          {/* POST BODY */}
          <Text fontSize='sm'>{post.text}</Text>
          {post.img && (
            <Box borderRadius={6} border='1px solid' borderColor='grey.light'>
              <Image src={post.img} w='full' borderRadius={6} />
            </Box>
          )}

          <Flex gap={3} my={1}>
            <Actions post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default Post;
