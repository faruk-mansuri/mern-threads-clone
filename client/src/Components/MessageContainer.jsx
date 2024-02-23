import {
  Avatar,
  Flex,
  Image,
  useColorModeValue,
  Text,
  Divider,
  SkeletonCircle,
  Skeleton,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import { useDispatch, useSelector } from 'react-redux';
import verifiedLogo from '../assets/images/verified.png';
import { useGlobalSocketContext } from '../../Context/SocketContext';
import { updateLastMessageConversations } from '../features/chat/chatSlice';
import { Link } from 'react-router-dom';
import messageSound from '../assets/sounds/message.mp3';

const MessageContainer = () => {
  const { socket } = useGlobalSocketContext();
  const { selectedConversation } = useSelector((store) => store.chat);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const currentUser = useSelector((store) => store.user.user);
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.on('newMessage', (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      dispatch(
        updateLastMessageConversations({
          messageText: message.text,
          sender: message.sender,
          conversationId: message.conversationId,
        })
      );
    });

    return () => socket.off('newMessage');
  }, [socket, selectedConversation]);

  const getMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await customFetch.get(
        `/messages/${selectedConversation.userId}`
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
    getMessages();
  }, [selectedConversation.userId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Flex
      flex={7}
      bg={useColorModeValue('gray.200', 'grey.dark')}
      borderRadius={'md'}
      flexDirection={'column'}
      p={2}
    >
      {/* MESSAGE HEADER */}
      <Link to={`/${selectedConversation.username}`}>
        <Flex w='full' h={12} alignItems={'center'} gap={2}>
          <Avatar src={selectedConversation.userProfilePic} size='sm' />
          <Text display={'flex'} alignItems={'center'}>
            {selectedConversation.username}
            <Image src={verifiedLogo} w={4} h={4} ml={1} />
          </Text>
        </Flex>
      </Link>

      <Divider />

      {/* MESSAGES */}
      <Flex
        flexDirection={'column'}
        gap={4}
        my={4}
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
                    ownMessage={currentUser._id === message.sender}
                  />
                </Flex>
              );
            })}
      </Flex>

      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
