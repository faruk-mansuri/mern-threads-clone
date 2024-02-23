import {
  Avatar,
  Flex,
  Text,
  Box,
  Image,
  Skeleton,
  Button,
  Input,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { updateLastMessageConversations } from '../features/chat/chatSlice';
import { BsCheck2All, BsTrash } from 'react-icons/bs';
import { BiEdit } from 'react-icons/bi';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
const DATE_FORMAT = 'd MMM yyyy, HH:mm';

const Message = ({ message, ownMessage, recipientId, isLastMessage }) => {
  const [value, setValue] = useState(message.text);
  const [isEditText, setIsEditText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { selectedConversation } = useSelector((store) => store.chat);
  const currentUser = useSelector((store) => store.user.user);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isUpdated = message.createdAt !== message.updatedAt;

  const dispatch = useDispatch();

  useEffect(() => {
    const closeEditText = (e) => {
      if (e.key === 'Escape') {
        setIsEditText(false);
      }
    };
    window.addEventListener('keydown', closeEditText);
    return () => window.addEventListener('keydown', closeEditText);
  }, []);

  const handleUpdateMessage = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    try {
      setIsLoading(true);
      if (!value) {
        toast.error('Content is required.');
        return;
      }
      const { data } = await customFetch.patch(
        `/messages/${message.conversationId}`,
        { messageId: message._id, recipientId, text: value }
      );
      setIsEditText(false);
      message.text = data.message.text;
      message.createdAt = data.message.createdAt;
      message.updatedAt = data.message.updatedAt;

      console.log({ isLastMessage });

      if (isLastMessage) {
        dispatch(
          updateLastMessageConversations({
            messageText: data.message.text,
            sender: data.message.sender,
            conversationId: data.message.conversationId,
          })
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    try {
      setIsLoading(true);
      if (!window.confirm('Are you sure you want to delete this message'))
        return;
      const { data } = await customFetch.patch(
        `/messages/${message.conversationId}/delete`,
        { messageId: message._id, recipientId }
      );
      message.text = data.message.text;
      message.img = data.message.img;
      message.deleted = data.message.deleted;

      console.log({ isLastMessage });
      if (isLastMessage) {
        dispatch(
          updateLastMessageConversations({
            messageText: data.message.text,
            sender: data.message.sender,
            conversationId: data.message.conversationId,
          })
        );
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
      return errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={'flex-end'}>
          {message.text && (
            <Flex
              role='group'
              position='relative'
              bg={'green.800'}
              p={1}
              borderRadius={'md'}
            >
              <Box wordBreak={'break-word'} color={'white'}>
                {isEditText ? (
                  <form>
                    <Flex gap={2}>
                      <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isLoading}
                        placeholder='Enter your message'
                        focusBorderColor='gray.400'
                      />
                      <Button
                        type='submit'
                        isLoading={isLoading}
                        onClick={handleUpdateMessage}
                      >
                        Save
                      </Button>
                    </Flex>
                    <Text fontSize='xs' color='gray.300'>
                      Press escape cancel, enter to save
                    </Text>
                  </form>
                ) : (
                  <Box>
                    <Box
                      fontStyle={message.deleted && 'italic'}
                      fontSize={message.deleted && 'sm'}
                      color={message.deleted && 'gray.400'}
                    >
                      {message.text}
                      {isUpdated && !message.deleted && (
                        <Text fontSize={'xs'} color={'gray.400'}>
                          (edited text)
                        </Text>
                      )}
                    </Box>
                    <Text
                      fontSize='xs'
                      textAlign='end'
                      color={message.deleted && 'gray.400'}
                    >
                      {format(new Date(message.createdAt), DATE_FORMAT)}
                    </Text>
                  </Box>
                )}

                {!message.deleted && (
                  <Box
                    bgColor={'gray.900'}
                    position='absolute'
                    top={-2}
                    right={0}
                    display='none'
                    _groupHover={{ display: 'block' }}
                  >
                    <Flex>
                      <Button
                        onClick={() => setIsEditText(true)}
                        size='xs'
                        variant='ghost'
                      >
                        <BiEdit />
                      </Button>

                      <Button
                        onClick={handleDeleteMessage}
                        size='xs'
                        variant='ghost'
                      >
                        <BsTrash />
                      </Button>
                    </Flex>
                  </Box>
                )}
              </Box>
              <Box
                alignSelf={'flex-end'}
                ml={1}
                color={message.seen ? 'blue.500' : ''}
                fontWeight={'bold'}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                borderRadius={4}
              />
              <Skeleton w={'200px'} h={'200px'} />
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex role='group' position={'relative'} mt={5} w={'200px'}>
              <Link target='_black' to={message.img}>
                <Image
                  src={message.img}
                  alt='Message image'
                  borderRadius={4}
                  objectFit={'contain'}
                  _hover={{ scale: 2 }}
                  cursor={'pointer'}
                />
              </Link>
              <Box
                alignSelf={'flex-end'}
                ml={1}
                color={message.seen ? 'blue.500' : ''}
                fontWeight={'bold'}
              >
                <BsCheck2All size={16} />
              </Box>

              {/* DELETE BUTTON */}
              <Box
                bgColor={'gray.900'}
                position='absolute'
                top={-2}
                right={0}
                display='none'
                _groupHover={{ display: 'block' }}
              >
                <Button onClick={handleDeleteMessage} size='xs' variant='ghost'>
                  <BsTrash />
                </Button>
              </Box>
            </Flex>
          )}

          <Avatar src={currentUser.avatar} w={12} h={12} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} size={'md'} />
          {message.text && (
            <Box
              wordBreak={'break-word'}
              maxWidth='330px'
              bg='gray.400'
              color='#222'
              p={1}
              borderRadius={'md'}
            >
              <Box
                fontStyle={message.deleted && 'italic'}
                fontSize={message.deleted && 'sm'}
                color={message.deleted && 'gray.700'}
              >
                {message.text}
                {isUpdated && !message.deleted && (
                  <Text fontSize={'xs'} color={'gray.700'}>
                    (edited text)
                  </Text>
                )}
              </Box>
              <Text fontSize='xs'>
                {format(new Date(message.createdAt), DATE_FORMAT)}
              </Text>
            </Box>
          )}

          {message.img && !imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                borderRadius={4}
              />
              <Skeleton w={'200px'} h={'200px'} />
            </Flex>
          )}

          {message.img && imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image
                src={message.img}
                alt='Message image'
                borderRadius={4}
                objectFit={'contain'}
              />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
};

export default Message;
