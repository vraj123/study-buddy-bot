import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast
} from '@chakra-ui/react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage = { id: uuidv4(), text: input, sender: 'user' };
    setInput('');
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    respond();
  };

  const respond = (userInput) => {
    const prompt = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: ${userInput}\nAI:`;
  
    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-davinci-003', // Or whichever model you prefer
        prompt: prompt,
        max_tokens: 60,
        temperature: 0.5,
      }),
    })
    .then(response => response.json())
    .then(data => {
      let botMessageText = data.choices[0].text.trim();
      // Check if the response is empty or not useful, use a predefined response
      if (!botMessageText) {
        const predefinedResponses = [
          "Hello! How can I assist you today?",
          "I'm sorry, could you rephrase that?",
          "Interesting point!",
          "Can you provide more details?",
          "Thanks for sharing that with me."
        ];
        botMessageText = predefinedResponses[Math.floor(Math.random() * predefinedResponses.length)];
      }
      const botMessage = { id: uuidv4(), text: botMessageText, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    })
    .catch((error) => {
      console.error('Error:', error);
      // If there's an error (e.g., network issue, API limit reached), use a predefined response
      const fallbackResponses = [
        "Hello! How can I assist you today?",
        "I'm sorry, could you rephrase that?",
        "Interesting point!",
        "Can you provide more details?",
        "Thanks for sharing that with me."
      ];
      const errorMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      const errorResponse = { id: uuidv4(), text: errorMessage, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    });
  };
  

  return (
    <VStack p={4}>
      <Text fontSize="2xl" fontWeight="bold">Chat with Bot</Text>
      <Box w="full" h="md" bg="gray.100" overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <Box key={message.id} bg={message.sender === 'user' ? "blue.500" : "green.500"} color="white" p={3} borderRadius="md" alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}>
              {message.text}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          mr={2}
        />
        <Button colorScheme="blue" px={8} type="submit">Send</Button>
      </form>
    </VStack>
  );
}

export default App;