'use client'
import { useState } from 'react';
import {
  Box,
  Button,
  Textarea,
  Text,
  VStack,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react';

export default function ChatPage() {
  const [theInput, setTheInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey, this is StudyBuddyBot! How can I help you today?',
    },
  ]);

  const toast = useToast();

  const callServerSideOpenAIEndpoint = async () => {
    setIsLoading(true);
    const userMessage = { role: 'user', content: theInput };
    setMessages([...messages, userMessage]);
    setTheInput('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      const { output } = data;

      setMessages((prevMessages) => [...prevMessages, output]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch response from the server.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      callServerSideOpenAIEndpoint();
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minHeight="100vh" // Ensures the Flex container fills the viewport height
      padding="6"
      width="full"
      background="gray.100" // Example color, can be changed as needed
    >
      <Box width={{ base: "90%", md: "60%", lg: "40%" }} textAlign="center" mb="4">
        <Text fontSize="4xl" fontWeight="bold">
          Study Buddy Bot
        </Text>
        <Text fontSize="md" color="gray.600">
          Ask any questions you want to learn about
        </Text>
      </Box>
  
      <VStack
        spacing="4"
        width={{ base: "90%", md: "60%", lg: "40%" }}
        maxHeight="70vh" // Adjusts the max height for the chat container
        overflowY="auto"
        bg="gray.600"
        rounded="xl"
        padding="4"
        boxShadow="xl"
      >
        {messages.map((message, index) => (
            <Box
              key={index}
              bg={message.role === 'assistant' ? 'gray.200' : 'gray.800'}
              color={message.role === 'assistant' ? 'gray.800' : 'gray.50'}
              borderRadius="md"
              padding="3"
              alignSelf={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              maxWidth="80%" // Makes sure messages don't stretch too wide
              marginX="4" // Adds some horizontal spacing
            >
              {message.content}
            </Box>
          ))}

          {isLoading && (
            <Spinner color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" size="xl" />
          )}  
      </VStack>
  
      <Flex
        marginTop="4"
        width={{ base: "90%", md: "60%", lg: "40%" }}
        align="center"
        justify="space-between"
      >
        <Textarea
          value={theInput}
          onChange={(e) => setTheInput(e.target.value)}
          placeholder="Type your message here..."
          bg="gray.300"
          roundedLeft="md"
          resize="none"
          marginRight="2"
          onKeyDown={handleSubmit}
        />
        <Button
          onClick={callServerSideOpenAIEndpoint}
          bg="blue.500"
          roundedRight="md"
          isLoading={isLoading}
          loadingText="Sending"
        >
          Send
        </Button>
      </Flex>
    </Flex>
  );
  
  
}
