import { Flex, Show, Text, useColorModeValue } from '@chakra-ui/react';
import { PiWechatLogoFill } from 'react-icons/pi';

const Chat = () => {
  return (
    <Show above='lg'>
      <Flex
        flex={7}
        borderRadius={'md'}
        p={2}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        height={'f'}
        bgColor={'gray.400'}
        bg={useColorModeValue('gray.200', 'gray.900')}
        color={useColorModeValue('gray.700', '#fff')}
      >
        <PiWechatLogoFill size={100} />
        <Text fontSize={20}>Select a conversation to start messaging</Text>
      </Flex>
    </Show>
  );
};

export default Chat;
