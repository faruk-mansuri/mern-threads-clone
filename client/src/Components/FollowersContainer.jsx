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
import SingleFollowerAndFollowings from './SingleFollowerAndFollowings';

const FollowersContainer = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      const response = await customFetch(`/users/get-followers/${user._id}`);
      setFollowers(response.data.followers);
    };
    fetchFollowers();
  }, []);

  return (
    <>
      <Button onClick={onOpen}>{followers.length} followers</Button>

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
              mx={'auto'}
            >
              {followers.map((follower) => {
                return <SingleFollowerAndFollowings user={follower} />;
              })}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FollowersContainer;
