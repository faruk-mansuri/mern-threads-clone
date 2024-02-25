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
  Hide,
  Show,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BsCheck2All, BsFillImageFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedConversation,
  updateLastMessageConversations,
} from '../features/chat/chatSlice';
import verifiedLogo from '../assets/images/verified.png';
import { useGlobalSocketContext } from '../../Context/SocketContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
const DATE_FORMAT = 'd MMM yyyy, HH:mm';

const Conversation = ({ conversation, isOnline, updatedAt }) => {
  const { socket } = useGlobalSocketContext();
  const currentUser = useSelector((store) => store.user.user);
  const { conversations } = useSelector((store) => store.chat);

  const user = conversation.participants.filter(
    (user) => user?._id !== currentUser?._id
  )[0];

  const [lastMessage, setLastMessage] = useState(conversation.lastMessage);
  const { selectedConversation } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const color = useColorMode();

  const [time, setTime] = useState(lastMessage?.createdAt || updatedAt);
  useEffect(() => {
    if (lastMessage.createdAt) {
      setTime(lastMessage.createdAt);
    }
  }, [lastMessage.createdAt]);

  useEffect(() => {
    socket.on('newMessage', (newMessage) => {
      if (newMessage.conversationId === conversation._id) {
        setLastMessage(newMessage);
      }
    });

    socket.on('updatedMessage', (updatedMessage) => {
      if (updatedMessage.conversationId === conversation._id) {
        // const conversation = conversations.find(
        //   (c) => c._id === updatedMessage.conversationId
        // );
        dispatch(
          updateLastMessageConversations({
            messageText: updatedMessage.text,
            sender: updatedMessage.sender,
            conversationId: updatedMessage.conversationId,
            img: updatedMessage.img,
            createdAt: updatedMessage.createdAt,
            updatedAt: updatedMessage.updatedAt,
          })
        );
      }
    });
  }, [socket, selectedConversation]);

  useEffect(() => {
    setLastMessage(conversation.lastMessage);
  }, [conversation]);

  return (
    <Link to={`${conversation._id}`}>
      <Flex
        mb={2}
        gap={4}
        alignItems={'center'}
        px={1}
        py={2}
        _hover={{
          cursor: 'pointer',
          bg: useColorModeValue('gray.200', 'gray.900'),
          color: useColorModeValue('gray.700', '#fff'),
        }}
        borderRadius={'md'}
        onClick={() =>
          dispatch(
            setSelectedConversation({
              _id: conversation._id,
              userId: user._id,
              username: user.username,
              userProfilePic: user.avatar,
            })
          )
        }
        bg={
          selectedConversation._id === conversation._id
            ? color.colorMode === 'light'
              ? 'gray.300'
              : 'grey.dark'
            : ''
        }
      >
        <WrapItem>
          <Avatar size={{ base: 'xs', sm: 'sm', md: 'md' }} src={user.avatar}>
            {isOnline && <AvatarBadge boxSize='1rem' bg='green.500' />}
          </Avatar>
        </WrapItem>

        <Stack direction={'column'} fontSize='sm' w={'full'}>
          <Text fontWeight='700' display='flex' alignItems='center'>
            <Flex justifyContent={'space-between'} w={'full'}>
              <Flex alignItems={'center'}>
                {user?.username.substring(0, 10)}
                <Image src={verifiedLogo} w={4} h={4} ml={1} />
              </Flex>

              <Hide above='lg'>{format(new Date(time), DATE_FORMAT)}</Hide>
            </Flex>
          </Text>

          <Box fontSize='sm' display={'flex'} alignItems='center' gap={1}>
            {currentUser?._id === lastMessage?.sender ? (
              <Box color={lastMessage?.seen ? 'blue.400' : ''}>
                <BsCheck2All size={16} />
              </Box>
            ) : (
              ''
            )}

            {!lastMessage?.text && !lastMessage?.img && (
              <p>Start conversation</p>
            )}

            <Hide above='lg'>{lastMessage.text}</Hide>

            <Show above='lg'>
              {lastMessage.text && lastMessage?.text?.length > 15
                ? lastMessage?.text.substring(0, 10) + '...'
                : lastMessage?.text}
            </Show>

            {lastMessage?.img && <BsFillImageFill size={16} />}
          </Box>
        </Stack>
      </Flex>
    </Link>
  );
};

export default Conversation;
