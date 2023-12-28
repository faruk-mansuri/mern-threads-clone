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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import customFetch from '../utils/customFetch';
import SingleSuggestedUser from './SingleSuggestedUser';
import { useSelector } from 'react-redux';

const Followers = () => {
  const { _id } = useSelector((store) => store.user.user);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      const response = await customFetch(`/users/get-followers/${_id}`);
      const followings = await customFetch(`/users/get-followings/${_id}`);
      setFollowers(response.data.followers);
    };
    fetchFollowers();
  }, []);

  return (
    <>
      <Button onClick={onOpen}>Followers</Button>

      <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Followers</ModalHeader>
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
              {followers.map((follower) => {
                return <SingleSuggestedUser user={follower} />;
              })}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Followers;
