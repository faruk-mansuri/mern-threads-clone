import {
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Heading,
  Box,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import customFetch from '../utils/customFetch';
import SingleSuggestedUser from './SingleSuggestedUser';
import { useSelector } from 'react-redux';

const Followings = () => {
  const { _id } = useSelector((store) => store.user.user);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [followings, setFollowings] = useState([]);

  useEffect(() => {
    const fetchFollowings = async () => {
      const response = await customFetch(`/users/get-followings/${_id}`);
      setFollowings(response.data.followings);
    };
    fetchFollowings();
  }, []);

  return (
    <>
      <Button onClick={onOpen}>Followings</Button>

      <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Followings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              maxHeight={'96'}
              overflow={'scroll'}
              flex={3}
              gap={2}
              flexDirection={'column'}
              maxW={{ sm: '250px', md: 'full' }}
              mx={'auto'}
            >
              <Box>
                {followings.length === 0 && (
                  <Heading as='h4' size='md'>
                    Not following
                  </Heading>
                )}
                <VStack>
                  {followings.map((following) => {
                    return <SingleSuggestedUser user={following} />;
                  })}
                </VStack>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Followings;
