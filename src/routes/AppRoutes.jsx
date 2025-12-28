import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ChatRoom from '../pages/ChatRoom';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:roomId" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes
