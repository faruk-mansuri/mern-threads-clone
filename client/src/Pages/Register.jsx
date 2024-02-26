import { Stack, Heading, useColorModeValue } from '@chakra-ui/react';
import { Form, Link, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FormRow, Header, SubmitBtn } from '../Components';
import customFetch from '../utils/customFetch';

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
    await customFetch.post('/auth/register', data);
    toast.success('register successfully');
    return redirect('/login');
  } catch (error) {
    const errorMessage = error?.response?.data?.msg || 'Something went wrong';
    toast.error(errorMessage);
    return errorMessage;
  }
};
const Register = () => {
  return (
    <Wrapper>
      <Header />
      <Stack mx={'auto'} maxW={'lg'}>
        <Stack bg={useColorModeValue('white', 'grey.dark')}>
          <Form className='form' method='post'>
            <Stack align={'center'} mb={10}>
              <Heading fontSize={'4xl'} textAlign={'center'} mb={3}>
                Sign up
              </Heading>
            </Stack>

            <FormRow name='name' type='text' />

            <FormRow name='username' type='text' labelText='user name' />

            <FormRow name='email' type='email' />

            <FormRow name='password' type='password' />

            <SubmitBtn />

            <p>
              Already a member ?{' '}
              <Link to='/login' className='member-btn'>
                Sign In
              </Link>
            </p>
          </Form>
        </Stack>
      </Stack>
    </Wrapper>
  );
};

export default Register;

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
