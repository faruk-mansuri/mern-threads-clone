import {
  Box,
  Flex,
  VStack,
  Avatar,
  Text,
  MenuButton,
  Portal,
  MenuList,
  MenuItem,
  Menu,
  Button,
  HStack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { BsInstagram } from 'react-icons/bs';
import { CgMoreO } from 'react-icons/cg';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import useFollowUnFollow from '../hooks/useFollowUnFollow';
import FollowersContainer from './FollowersContainer';
import FollowingsContainer from './FollowingsContainer';

// import
const UserHeader = ({ user }) => {
  const { user: currentUser } = useSelector((store) => store.user); // logged in user

  const { handleFollowAndUnFollow, following, updating } =
    useFollowUnFollow(user);

  const copyURL = async () => {
    const currentURL = window.location.href;
    await navigator.clipboard.writeText(currentURL);
    toast.success('link copied');
  };

  return (
    <VStack gap={4} alignItems='start'>
      <Flex justifyContent='space-between' w='full'>
        <Box>
          <Text fontWeight='bold' fontSize={'2xl'}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems='center'>
            <Text fontSize='sm'> {user.username}</Text>
            <Text
              fontSize='xs'
              bg='grey.dark'
              color='grey.light'
              p={2}
              paddingRight={3}
              paddingLeft={3}
              borderRadius={'full'}
            >
              thread.net
            </Text>
          </Flex>
        </Box>
        {user.avatar ? (
          <Avatar
            name={user.name}
            src={user.avatar}
            size={{ base: 'md', md: 'xl' }}
          />
        ) : (
          <Avatar
            name={user.name}
            src={user.avatar}
            size={{ base: 'md', md: 'xl' }}
          />
        )}
      </Flex>

      <Text> {user.bio}</Text>

      <HStack justify={'space-between'}>
        <HStack>
          <FollowersContainer user={user} />
          <FollowingsContainer user={user} />
        </HStack>

        {currentUser?._id === user._id ? (
          <Link to='/update'>
            <Button size='md'>update profile</Button>
          </Link>
        ) : (
          <Button
            size='md'
            onClick={handleFollowAndUnFollow}
            isLoading={updating}
          >
            {following ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </HStack>

      <Flex w={'full'} justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text color='grey.light'>{user.followers.length} followers</Text>
          <Box w='1' h='1' bg='grey.light' borderRadius='full'></Box>
          <Link color={'grey.light'}>instagram.com</Link>
        </Flex>

        <Flex gap={2}>
          <Box className='icon-container'>
            <BsInstagram size={24} cursor={'pointer'} />
          </Box>

          <Box className='icon-container'>
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={'pointer'} />
              </MenuButton>
              <Portal>
                <MenuList bg='grey.dark'>
                  <MenuItem bg='grey.dark' color='grey.light' onClick={copyURL}>
                    Copy link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={'full'}>
        <Flex
          flex={1}
          borderBottom={'1.5px solid white'}
          justifyContent={'center'}
          pb='3'
          cursor={'pointer'}
        >
          <Text fontWeight={'bold'}> Threads</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={'1px solid gray'}
          justifyContent={'center'}
          color={'gray.light'}
          pb='3'
          cursor={'pointer'}
        >
          <Text fontWeight={'bold'}> Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
