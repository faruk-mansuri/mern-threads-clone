import { Outlet, useNavigation, redirect } from 'react-router-dom';
import { Header } from '../Components';
import customFetch from '../utils/customFetch';
import { store } from '../store';
import { setUser } from '../features/user/userSlice';
import { Container } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { removeUser } from '../features/user/userSlice';

export const loader = async () => {
  try {
    const response = await customFetch('/users/current-user');
    store.dispatch(setUser(response.data.user));
    return null;
  } catch (error) {
    const errorMessage = error?.response?.data?.msg || 'Something went wrong';
    // toast.error(errorMessage);
    // console.log('error', error);
    await customFetch('/auth/logout');
    store.dispatch(removeUser());
    return redirect('/login');
  }
};

const HomeLayout = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';
  const { pathname } = useLocation();

  return (
    <Container
      maxW={pathname === '/' ? { base: '678px', md: '900px' } : '678px'}
      position='relative'
    >
      <Header />
      {isPageLoading ? <div className='loading'></div> : <Outlet />}
    </Container>
  );
};

export default HomeLayout;
