import {
  Avatar,
  Flex,
  Image,
  useColorModeValue,
  Text,
  Divider,
  SkeletonCircle,
  Skeleton,
  Box,
  Hide,
  Button,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Message from '../Components/Message';
import MessageInput from '../Components/MessageInput';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import { useDispatch, useSelector } from 'react-redux';
import verifiedLogo from '../assets/images/verified.png';
import { useGlobalSocketContext } from '../../Context/SocketContext';
import {
  removeSelectedConversation,
  updateLastMessageConversations,
} from '../features/chat/chatSlice';
import { useNavigate } from 'react-router-dom';
import messageSound from '../assets/sounds/message.mp3';
import { IoIosArrowBack } from 'react-icons/io';

const ConversationPage = () => {
  const navigate = useNavigate();
  const { socket } = useGlobalSocketContext();
  const { selectedConversation } = useSelector((store) => store.chat);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const currentUser = useSelector((store) => store.user.user);
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);
  const [isEditTextId, setIsEditTextId] = useState();

  useEffect(() => {
    const closeEditText = (e) => {
      if (e.key === 'Escape') {
        setIsEditTextId('');
      }
    };
    window.addEventListener('keydown', closeEditText);
    return () => window.addEventListener('keydown', closeEditText);
  }, []);

  useEffect(() => {
    socket.on('newMessage', (message) => {
      if (selectedConversation?._id === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }
    });

    return () => socket.off('newMessage');
  }, [socket, selectedConversation]);

  if (!selectedConversation.userId) {
    return navigate('/chat');
  }

  const getMessages = async () => {
    if (!selectedConversation?.userId) return;
    setMessagesLoading(true);
    try {
      const response = await customFetch.get(
        `/messages/${selectedConversation?.userId}`
      );
      setMessages(response.data.messages);
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
      return errorMessage;
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    getMessages();
  }, [selectedConversation?.userId]);

  useEffect(() => {
    socket.on('updatedMessage', (updatedMessage) => {
      setMessages((preMessages) => {
        const newMessages = preMessages?.map((message, i) => {
          if (message?._id === updatedMessage?._id) {
            if (i === preMessages.length - 1) {
              dispatch(
                updateLastMessageConversations({
                  messageText: updatedMessage.text,
                  sender: updatedMessage.sender,
                  conversationId: updatedMessage.conversationId,
                  img: updatedMessage.img,
                  createdAt: updatedMessage.createdAt,
                })
              );
            }
            return updatedMessage;
          }
          return message;
        });
        return newMessages;
      });
    });
  }, [socket, selectedConversation, messages]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit('markMessagesAsSeen', {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }
    socket.on('messagesSeen', ({ conversationId }) => {
      if (selectedConversation._id == conversationId) {
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((message) => {
            if (!message.seen) {
              return { ...message, seen: true };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser?._id, messages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Flex
      bg={useColorModeValue('gray.200', 'grey.dark')}
      borderRadius={'md'}
      flexDirection={'column'}
      p={2}
      h={'calc(100vh - 8rem)'}
      w={'100%'}
    >
      {/* MESSAGE HEADER */}
      <Flex flex={1} w='full' h={12} alignItems={'center'} gap={2}>
        <Hide above='lg'>
          <Button
            variant='ghost'
            onClick={() => {
              dispatch(removeSelectedConversation());
              navigate('/chat');
            }}
          >
            <IoIosArrowBack size={30} _hover={{ bgColor: 'blue' }} />
          </Button>
        </Hide>
        <Avatar src={selectedConversation.userProfilePic} size='md' />
        <Text display={'flex'} alignItems={'center'}>
          {selectedConversation.username}
          <Image src={verifiedLogo} w={4} h={4} ml={1} />
        </Text>
      </Flex>

      <Divider paddingTop={2} />

      {/* MESSAGES */}
      <Flex
        flex={8}
        flexDirection={'column'}
        gap={4}
        h='400px'
        overflowY={'auto'}
        p={2}
      >
        {messagesLoading
          ? [0, 1, 2, 3, 4].map((_, i) => {
              return (
                <Flex
                  key={i}
                  gap={2}
                  alignItems={'center'}
                  p={1}
                  borderRadius={'md'}
                  alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                >
                  {i % 2 === 0 && <SkeletonCircle size={10} />}

                  <Flex flexDirection={'column'} gap={2}>
                    <Skeleton
                      alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                      h='12px'
                      w='200px'
                    />
                    <Skeleton
                      alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                      h='12px'
                      w='220px'
                    />
                    <Skeleton
                      alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                      h='12px'
                      w='170px'
                    />
                  </Flex>

                  {i % 2 !== 0 && <SkeletonCircle size={10} />}
                </Flex>
              );
            })
          : messages.map((message, i) => {
              return (
                <Flex
                  key={message._id}
                  direction={'column'}
                  ref={messages.length - 1 === i ? messageEndRef : null}
                >
                  <Message
                    message={message}
                    ownMessage={currentUser?._id === message.sender}
                    recipientId={selectedConversation?.userId}
                    isLastMessage={i === messages?.length - 1}
                    isEditTextId={isEditTextId}
                    setIsEditTextId={setIsEditTextId}
                  />
                </Flex>
              );
            })}
      </Flex>

      <Box flex={1}>
        <MessageInput setMessages={setMessages} />
      </Box>
    </Flex>
  );
};

export default ConversationPage;
