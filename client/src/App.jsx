import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  Register,
  Login,
  HomeLayout,
  Home,
  User,
  SinglePost,
  UpdateProfile,
  Chat,
  Error,
  Settings,
} from './Pages';

// loader
import { loader as registerLoader } from './Pages/Register';
import { loader as loginLoader } from './Pages/Login';
import { loader as homeLayoutLoader } from './Pages/HomeLayout';
import { loader as userPage } from './Pages/User';
import { loader as homePageLoader } from './Pages/Home';
import { loader as postPageLoader } from './Pages/SinglePost';
// import { loader as chatPageLoader } from './Pages/Chat';

// action
import { action as registerAction } from './Pages/Register';
import { action as loginAction } from './Pages/Login';
import { action as updateProfileAction } from './Pages/UpdateProfile';

import SocketContext from '../Context/SocketContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    loader: homeLayoutLoader,
    errorElement: <Error />,
    children: [
      { index: true, element: <Home />, loader: homePageLoader },
      { path: ':username', element: <User />, loader: userPage },
      {
        path: 'update',
        element: <UpdateProfile />,
        action: updateProfileAction,
      },
      {
        path: ':username/post/:postId',
        element: <SinglePost />,
        loader: postPageLoader,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: 'login',
    element: <Login />,
    loader: registerLoader,
    action: loginAction,
  },
  {
    path: 'register',
    element: <Register />,
    loader: loginLoader,
    action: registerAction,
  },
]);

const App = () => {
  return (
    <SocketContext>
      <RouterProvider router={router} />
    </SocketContext>
  );
};

export default App;
