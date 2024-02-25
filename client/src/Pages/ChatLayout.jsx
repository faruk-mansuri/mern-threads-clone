import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Input,
  useColorModeValue,
  Text,
  SkeletonCircle,
  Skeleton,
  Show,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Conversation } from '../Components';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import {
  setConversations,
  addConversations,
  setSelectedConversation,
  updateLastMessageSeenConversations,
  updateEditLastMessageConversations,
  updateLastMessageConversations,
} from '../features/chat/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useGlobalSocketContext } from '../../Context/SocketContext';
import { Outlet, useParams } from 'react-router-dom';

const ChatLayout = () => {
  const { conversationId } = useParams();
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
    socket.on('newConversation', (conversation) => {
      dispatch(addConversations(conversation));
    });

    socket.on('conversationId', (message) => {
      dispatch(
        updateLastMessageConversations({
          messageText: message.text,
          sender: message.sender,
          conversationId: message.conversationId,
          img: message?.img,
        })
      );
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

      const { data } = await customFetch.post('/conversations', {
        userId: searchedUser._id,
      });

      dispatch(
        setSelectedConversation({
          _id: data.conversation._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.avatar,
        })
      );
      dispatch(addConversations(data.conversation));

      setSearchText('');
    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setIsSearchingUser(false);
    }
  };

  const getConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await customFetch.get('/conversations');
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

  if (!conversationId) {
    return (
      <Flex>
        <Box
          w={{ sm: 'full', lg: '60' }}
          h='calc(100vh - 8rem)'
          p={4}
          borderRadius={4}
        >
          <Flex height='full' flex={3} gap={2} flexDirection={'column'}>
            <Text
              fontWeight='700'
              fontSize={'2xl'}
              color={useColorModeValue('gray.600', 'gray.500')}
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
              <Box overflowY={'auto'} px={2}>
                {conversations.length === 0 ? (
                  <Text fontSize={'xl'} color={'gray.300'}>
                    No Conversation has Started
                  </Text>
                ) : (
                  conversations.map((conversation) => {
                    return (
                      <Conversation
                        key={conversation._id}
                        conversation={conversation}
                        isOnline={onlineUsers.includes(
                          conversation.participants[0]._id
                        )}
                      />
                    );
                  })
                )}
              </Box>
            )}
          </Flex>
        </Box>

        <Outlet />
      </Flex>
    );
  }
  return (
    <Flex>
      <Show above='lg'>
        <Box
          w={{ sm: 'full', lg: '60' }}
          h='calc(100vh - 8rem)'
          p={4}
          borderRadius={4}
        >
          <Flex height='full' flex={3} gap={2} flexDirection={'column'}>
            <Text
              fontWeight='700'
              fontSize={'2xl'}
              color={useColorModeValue('gray.600', 'gray.500')}
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
              <Box overflowY={'auto'} px={2}>
                {conversations.length === 0 ? (
                  <Text fontSize={'xl'} color={'gray.300'}>
                    No Conversation has Started
                  </Text>
                ) : (
                  conversations.map((conversation) => {
                    return (
                      <Conversation
                        key={conversation._id}
                        conversation={conversation}
                        isOnline={onlineUsers.includes(
                          conversation.participants[0]._id
                        )}
                      />
                    );
                  })
                )}
              </Box>
            )}
          </Flex>
        </Box>
      </Show>

      <Outlet />
    </Flex>
  );
};

export default ChatLayout;
