'use client'
import { Box, Heading, Text, Link } from '@chakra-ui/react';
import { useEffect } from 'react';

function HomePage() {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Notification.permission !== 'granted') {
        const result = await Notification.requestPermission();
        if (result !== 'granted') {
          console.warn("User denied notification permission");
        } 
      } 
    };
    
    requestNotificationPermission(); 
  }, []); 

  return (
    <Box p={8} textAlign="center">
      <Heading size="2xl">Welcome</Heading>
      <Text mt={4}>Let's chat with our Study Buddy Bot chatbot!</Text>
      <Link href="/chat" color="blue.500" mt={4}>
        Start Chatting
      </Link>
    </Box>
  );
}

export default HomePage; 
