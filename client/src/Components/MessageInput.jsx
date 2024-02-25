import {
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import customFetch from '../utils/customFetch';
import { updateLastMessageConversations } from '../features/chat/chatSlice';
import { BsFillImageFill } from 'react-icons/bs';
import usePreviewImg from '../hooks/usePreviewImg';

const MessageInput = ({ setMessages }) => {
  const { selectedConversation } = useSelector((store) => store.chat);
  const [messageText, setMessageText] = useState('');
  const dispatch = useDispatch();
  const { onClose } = useDisclosure();
  const imageRef = useRef(null);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);
    try {
      const response = await customFetch.post(`/messages`, {
        message: messageText,
        recipientId: selectedConversation.userId,
        img: imgUrl,
      });

      setMessages((message) => [...message, response.data.newMessage]);
      dispatch(
        updateLastMessageConversations({
          messageText,
          sender: response.data.newMessage.sender,
          conversationId: response.data.newMessage.conversationId,
          img: response.data.newMessage?.img,
        })
      );
      setMessageText('');
      setImgUrl('');
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Something went wrong';
      toast.error(errorMessage);
      return errorMessage;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex flex={1} gap={2} alignItems={'center'}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            border={'2px'}
            borderColor={useColorModeValue('gray.400', 'gray.600')}
            w='full'
            placeholder='Type a message'
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <InputRightElement onClick={handleSendMessage} cursor='pointer'>
            <IoSendSharp color='green.500' />
          </InputRightElement>
        </InputGroup>
      </form>

      {/* IMAGE */}
      <Flex flex={5} cursor={'pointer'}>
        <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
        <Input
          type={'file'}
          hidden
          ref={imageRef}
          onChange={handleImageChange}
        />
      </Flex>

      {/* MODAL */}
      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl('');
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={'full'}>
              <Image src={imgUrl} />
            </Flex>
            <Flex justifyContent={'flex-end'} my={2}>
              {isSending ? (
                <Spinner size={'md'} />
              ) : (
                <IoSendSharp
                  size={24}
                  cursor={'pointer'}
                  onClick={handleSendMessage}
                />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
