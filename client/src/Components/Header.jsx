import { Flex, Image, useColorMode, Box } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import LogoutBtn from './LogoutBtn';
import { Link } from 'react-router-dom';
import { AiFillHome } from 'react-icons/ai';
import { RxAvatar } from 'react-icons/rx';
import { RiChatSmile2Line } from 'react-icons/ri';
import lightLogo from '../assets/images/light-logo.svg';
import darkLogo from '../assets/images/dark-logo.svg';
import { MdOutlineSettings } from 'react-icons/md';

const Header = () => {
  const { user } = useSelector((store) => store.user);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Flex
        height={'2.5rem'}
        alignItems='center'
        justifyContent='space-between'
        mt={'1.5rem'}
        mb={'2rem'}
      >
        {user && (
          <Link to='/'>
            <AiFillHome size={24} />
          </Link>
        )}

        <Flex flex={1} justifyContent='center'>
          <Image
            cursor='pointer'
            alt='logo'
            src={colorMode === 'dark' ? lightLogo : darkLogo}
            onClick={toggleColorMode}
            h={10}
          />
        </Flex>

        {user && (
          <Flex alignItems={'center'} gap={4}>
            <Link to={`/${user.username}`}>
              <RxAvatar size={24} />
            </Link>

            <Link to={`/chat`}>
              <RiChatSmile2Line size={24} />
            </Link>

            <Link to={`/settings`}>
              <MdOutlineSettings size={24} />
            </Link>

            <LogoutBtn />
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default Header;
