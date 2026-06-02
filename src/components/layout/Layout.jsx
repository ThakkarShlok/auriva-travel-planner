import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatBot from '../ChatBot/ChatBot'

const Layout = () => {
  useEffect(() => {
    const handleOpenChat = () => {
      // Find and click the chat button to open the chatbot
      const chatButton = document.querySelector('.chat-trigger');
      if (chatButton) {
        chatButton.click();
      } else {
        // Alternative: dispatch a custom event that ChatBot listens to
        window.dispatchEvent(new CustomEvent('openChatBot'));
      }
    };
    
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  )
}

export default Layout