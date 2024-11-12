import React from 'react';
import { UserButton } from '@clerk/nextjs';

const Home = () => {
  return (
    <div>
      <p>Home</p>
      <UserButton afterSignUpUrl="/" />
    </div>
  );
};

export default Home;
