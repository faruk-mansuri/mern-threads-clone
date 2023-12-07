import {
  Avatar,
  AvatarBadge,
  Flex,
  WrapItem,
  Stack,
  Image,
  Text,
  useColorMode,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import { BsCheck2All, BsFillImageFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedConversation } from '../features/chat/chatSlice';
import verifiedLogo from '../assets/images/verified.png';

const Conversation = ({ conversation, isOnline }) => {
  const user = conversation.participants[0];
  const lastMessage = conversation.lastMessage;
  const currentUser = useSelector((store) => store.user.user);
  const { selectedConversation } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const color = useColorMode();

  return (
    <Flex
      gap={4}
      alignItems={'center'}
      p={1}
      _hover={{
        cursor: 'pointer',
        bg: useColorModeValue('gray.600', 'grey.dark'),
        color: '#fff',
      }}
      borderRadius={'md'}
      onClick={() =>
        dispatch(
          setSelectedConversation({
            _id: conversation._id,
            userId: user._id,
            username: user.username,
            userProfilePic: user.avatar,
            mock: conversation.mock,
          })
        )
      }
      bg={
        selectedConversation._id === conversation._id
          ? color.colorMode === 'light'
            ? 'gray.600'
            : 'grey.dark'
          : ''
      }
    >
      <WrapItem>
        <Avatar size={{ base: 'xs', sm: 'sm', md: 'md' }} src={user.avatar}>
          {isOnline && <AvatarBadge boxSize='1rem' bg='green.500' />}
        </Avatar>
      </WrapItem>

      <Stack direction={'column'} fontSize='sm'>
        <Text fontWeight='700' display='flex' alignItems='center'>
          {user?.username.substring(0, 10)}
          <Image src={verifiedLogo} w={4} h={4} ml={1} />
        </Text>
        <Box fontSize='sm' display={'flex'} alignItems='center' gap={1}>
          {currentUser?._id === lastMessage.sender ? (
            <Box color={lastMessage.seen ? 'blue.400' : ''}>
              <BsCheck2All size={16} />
            </Box>
          ) : (
            ''
          )}
          {lastMessage.text.length > 15
            ? lastMessage.text.substring(0, 15) + '...'
            : lastMessage.text || <BsFillImageFill size={16} />}
        </Box>
      </Stack>
    </Flex>
  );
};

export default Conversation;
