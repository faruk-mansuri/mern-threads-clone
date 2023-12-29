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
import SingleFollowerAndFollowings from './SingleFollowerAndFollowings';

const FollowingsContainer = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [followings, setFollowings] = useState([]);

  useEffect(() => {
    const fetchFollowings = async () => {
      const response = await customFetch(`/users/get-followings/${user._id}`);
      setFollowings(response.data.followings);
    };
    fetchFollowings();
  }, []);

  return (
    <>
      <Button onClick={onOpen}>{followings.length} followings</Button>

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
              mx={'auto'}
            >
              <Box>
                {followings.length === 0 && (
                  <Heading as='h4' size='md'>
                    Not following
                  </Heading>
                )}

                {followings.map((following) => {
                  return <SingleFollowerAndFollowings user={following} />;
                })}
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FollowingsContainer;
