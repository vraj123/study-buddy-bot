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

  // Assuming this is inside your `Home` component function

return (
  <Box className="flex min-h-screen flex-col items-center justify-between p-6">
    <Text fontSize="5xl" fontFamily="sans-serif">ChatterBot</Text>

    <VStack spacing={4} h="35rem" w="40rem" bg="gray.600" rounded="xl" p={4} overflowY="auto">
      {messages.map((message, index) => (
        <Flex key={index} align="start" direction="column" w="full">
          <Box
            p={3}
            bg={message.role === 'assistant' ? 'gray.200' : 'gray.800'}
            color={message.role === 'assistant' ? 'gray.800' : 'gray.50'}
            borderRadius="md"
            alignSelf={message.role === 'assistant' ? 'start' : 'end'}
            maxW="18rem"
          >
            {message.content}
          </Box>
        </Flex>
      ))}

      {isLoading && (
        <Box alignSelf="start" p={3}>
          <Spinner color="blue.500" 
                      thickness='4px'
                      speed='0.65s'
                      emptyColor='gray.200'
                      size='xl'/>
        </Box>
      )}
    </VStack>

    <Flex w="80%" justify="center" position="absolute" bottom="4">
      <Textarea
        value={theInput}
        onChange={(e) => setTheInput(e.target.value)}
        placeholder="Type your message here..."
        bg="gray.300"
        roundedLeft="md"
        onKeyDown={handleSubmit}
        resize="none"
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
  </Box>
);

}
