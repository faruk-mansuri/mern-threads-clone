import { Avatar, Flex, Text, Box, Image, Skeleton } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { BsCheck2All } from 'react-icons/bs';
import { useState } from 'react';

const Message = ({ message, ownMessage }) => {
  const { selectedConversation } = useSelector((store) => store.chat);
  const currentUser = useSelector((store) => store.user.user);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={'flex-end'}>
          {message.text && (
            <Flex bg={'green.800'} maxW={'350px'} p={1} borderRadius={'md'}>
              <Text wordBreak={'break-word'} color={'white'}>
                {message.text}
              </Text>
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
            <Flex mt={5} w={'200px'}>
              <Image
                src={message.img}
                alt='Message image'
                borderRadius={4}
                objectFit={'contain'}
              />
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

          <Avatar src={currentUser.avatar} w={7} h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />
          {message.text && (
            <Text
              wordBreak={'break-word'}
              maxWidth='330px'
              bg='gray.400'
              color='#222'
              p={1}
              borderRadius={'md'}
            >
              {message.text}
            </Text>
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
