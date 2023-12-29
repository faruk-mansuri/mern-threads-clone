import { Avatar, Box, Button, Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import useFollowUnFollow from '../hooks/useFollowUnFollow';
import { useSelector } from 'react-redux';

const SingleFollowerAndFollowings = ({ user }) => {
  const { _id: currentUserId } = useSelector((store) => store.user.user);
  const { handleFollowAndUnFollow, following, updating } =
    useFollowUnFollow(user);

  return (
    <Flex
      gap={2}
      justifyContent={'space-between'}
      alignItems={'center'}
      marginBottom={'5'}
    >
      {/* left side */}
      <Flex gap={2} as={Link} to={`/${user.username}`}>
        <Avatar src={user.avatar} />
        <Box>
          <Text fontSize={'sm'} fontWeight={'bold'}>
            {user.username}
          </Text>
          <Text color={'gray.light'} fontSize={'sm'}>
            {user.name}
          </Text>
        </Box>
      </Flex>
      {/* right side */}
      {currentUserId !== user._id && (
        <Button
          size={'sm'}
          color={following ? 'black' : 'white'}
          bg={following ? 'white' : 'blue.400'}
          onClick={handleFollowAndUnFollow}
          isLoading={updating}
          _hover={{
            color: following ? 'black' : 'white',
            opacity: '.8',
          }}
        >
          {following ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </Flex>
  );
};

export default SingleFollowerAndFollowings;
