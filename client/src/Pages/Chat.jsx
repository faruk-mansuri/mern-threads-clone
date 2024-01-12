import { SearchIcon } from '@chakra-ui/icons';
import { PiWechatLogoFill } from 'react-icons/pi';
import {
  Box,
  Button,
  Flex,
  Input,
  useColorModeValue,
  Text,
  SkeletonCircle,
  Skeleton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Conversation, MessageContainer } from '../Components';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import {
  setConversations,
  addConversations,
  setSelectedConversation,
  updateLastMessageSeenConversations,
} from '../features/chat/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useGlobalSocketContext } from '../../Context/SocketContext';

const Chat = () => {
  const { socket, onlineUsers } = useGlobalSocketContext();
  const currentUser = useSelector((store) => store.user.user);
  const { conversations, selectedConversation } = useSelector(
    (store) => store.chat
  );
  const [searchText, setSearchText] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const dispatch = useDispatch();
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  useEffect(() => {
    socket.on('messagesSeen', ({ conversationId }) => {
      dispatch(updateLastMessageSeenConversations(conversationId));
    });
  }, [socket]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();

    if (!searchText) return;
    setIsSearchingUser(true);
    try {
      const response = await customFetch(`/users/profile/${searchText}`);
      const searchedUser = response.data.user;

      const messagingYourself = searchedUser._id === currentUser._id;
      if (messagingYourself) {
        toast.error('can not message your self');
        return;
      }

      const conversationAlreadyExists = conversations.find(
        (conversation) => conversation.participants[0]._id === searchedUser._id
      );
      if (conversationAlreadyExists) {
        dispatch(
          setSelectedConversation({
            _id: conversationAlreadyExists._id,
            userId: searchedUser._id,
            username: searchedUser.username,
            userProfilePic: searchedUser.avatar,
          })
        );
        setSearchText('');
        return;
      }

      const mockConversation = {
        mock: true,
        newConversation: true,
        lastMessage: {
          text: '',
          sender: '',
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            userProfilePic: searchedUser.userProfilePic,
          },
        ],
      };
      setSearchText('');
      dispatch(addConversations(mockConversation));
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setIsSearchingUser(false);
    }
  };

  const getConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await customFetch.get('/messages/conversations');
      dispatch(setConversations(response.data.conversations));
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
      return errorMessage;
    } finally {
      setIsLoadingConversations(false);
    }
  };
  useEffect(() => {
    getConversations();
  }, []);

  return (
    <Box
      transform={'translateX(50%)'}
      right={'50%'}
      position='absolute'
      width={{ base: '100%', md: '80%', lg: '750px' }}
      p={4}
    >
      <Flex
        gap={4}
        flexDirection={{ base: 'column', md: 'row' }}
        maxW={{ sm: '400px', md: 'full' }}
        mx={'auto'} //middle
      >
        <Flex
          maxHeight={{ sm: '72', md: '96' }}
          overflow={'scroll'}
          flex={3}
          gap={2}
          flexDirection={'column'}
          maxW={{ sm: '250px', md: 'full' }}
          mx={'auto'}
        >
          <Text
            fontWeight='700'
            color={useColorModeValue('gray.600', 'gray.400')}
          >
            Your Conversations
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems='center' gap={2}>
              <Input
                placeholder='Search for a user'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                size='sm'
                onClick={handleConversationSearch}
                isLoading={isSearchingUser}
              >
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {isLoadingConversations ? (
            [0, 1, 2, 3, 4].map((_, i) => {
              return (
                <Flex
                  key={i}
                  gap={4}
                  alignItems={'center'}
                  p={1}
                  borderRadius={'md'}
                >
                  <Box>
                    <SkeletonCircle size={10} />
                  </Box>
                  <Flex w={'full'} flexDirection='column' gap={3}>
                    <Skeleton h='10px' w='80px' />
                    <Skeleton h='8px' w='90%' />
                  </Flex>
                </Flex>
              );
            })
          ) : (
            <>
              {conversations.map((conversation) => {
                return (
                  <Conversation
                    key={conversation._id}
                    conversation={conversation}
                    isOnline={onlineUsers.includes(
                      conversation.participants[0]._id
                    )}
                  />
                );
              })}
            </>
          )}
        </Flex>

        {selectedConversation._id ? (
          <MessageContainer />
        ) : (
          <Flex
            flex={7}
            borderRadius={'md'}
            p={2}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            h={'400px'}
          >
            <PiWechatLogoFill size={100} />
            <Text fontSize={20}>Select a conversation to start messaging</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Chat;
