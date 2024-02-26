import { Stack, Heading, useColorModeValue } from '@chakra-ui/react';
import { Form, Link, redirect } from 'react-router-dom';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FormRow, Header, SubmitBtn } from '../Components';

export const loader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    return redirect('/');
  }
  return null;
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post('/auth/login', data);
    return redirect('/');
  } catch (error) {
    const errorMessage = error?.response?.data?.msg || 'Something went wrong';
    toast.error(errorMessage);
    return errorMessage;
  }
};

const Login = () => {
  return (
    <Wrapper>
      <Header />
      <Stack mx={'auto'} maxW={'lg'}>
        <Stack bg={useColorModeValue('white', 'grey.dark')}>
          <Form className='form' method='post'>
            <Stack align={'center'} mb={10}>
              <Heading fontSize={'4xl'} textAlign={'center'} mb={3}>
                Sign In
              </Heading>
            </Stack>
            <FormRow name='username' type='text' />

            <FormRow name='password' type='password' />

            <SubmitBtn />

            <p>
              Don't have an account ?{' '}
              <Link to='/register' className='member-btn'>
                Sign Up
              </Link>
            </p>
          </Form>
        </Stack>
      </Stack>
    </Wrapper>
  );
};

export default Login;

const Wrapper = styled.section`
  display: grid;
  align-items: center;
  .logo {
    display: block;
    margin: 0 auto;
    margin-bottom: 1.38rem;
  }
  .form {
    max-width: 450px;
    border-top: 5px solid #222;
  }
  h4 {
    text-align: center;
    margin-bottom: 1.38rem;
  }
  p {
    margin-top: 1rem;
    text-align: center;
    line-height: 1.5;
  }
  .btn {
    margin-top: 1rem;
  }
  .member-btn {
    letter-spacing: 1px;
    margin-left: 0.25rem;
  }
`;
