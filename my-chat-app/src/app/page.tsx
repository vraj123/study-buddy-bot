import { Box, Heading, Text, Link } from '@chakra-ui/react';

function HomePage() {
  return (
    <Box p={8} textAlign="center">
      <Heading size="2xl">Welcome</Heading>
      <Text mt={4}>Let's chat with our helpful chatbot!</Text>
      <Link href="/chat" color="blue.500" mt={4}>
        Start Chatting
      </Link>
    </Box>
  );
}

export default HomePage; 
