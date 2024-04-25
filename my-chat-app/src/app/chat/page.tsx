'use client'
import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Textarea,
  Text,
  VStack,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Spinner, Image } from '@chakra-ui/react';
import React from "react";
import Markdown from "react-markdown";


export default function ChatPage() {
  const [theInput, setTheInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey, this is StudyBuddyBot! How can I help you today?',
    },
  ]);
  const [isShowNotification, setIsShowNotification] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const speechRecognition = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const checkInInterval = setInterval(() => {
      setIsShowNotification(true); // Directly trigger the popup
    }, 3 * 60 * 1000); 

    return () => clearInterval(checkInInterval);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false; // Change this to false for single-shot recognition
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setTheInput(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
        };

        recognition.onend = () => {
            setIsListening(false); // Automatically set listening to false when recognition ends
            setIsLoading(false); // Ensure loading is stopped when recognition ends
        };

        speechRecognition.current = recognition;
    }
}, []);


  

const toggleListening = () => {
  if (isListening) {
      if (speechRecognition.current) {
          speechRecognition.current.stop();
          setIsLoading(false);
      }
      setIsListening(false);
  } else {
      if (speechRecognition.current) {
          speechRecognition.current.start();
          setIsLoading(true);
      }
      setIsListening(true);
  }
};




  const callServerSideOpenAIEndpointForPopup = async () => {
    setIsLoading(true); 
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "Generate a check-in message" }] }),
      });

      const data = await response.json();
      const { output } = data;

      setPopupMessage(output.content); // Update the state for popup message

    } catch (error) {
      // ... error handling
    } finally {
      setIsLoading(false);
    }
  };

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
      createTalk(output.content);
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
  useEffect(() => {
    if (isShowNotification) {
        callServerSideOpenAIEndpointForPopup();
    }
}, [isShowNotification]); 

const createTalk = async (text: any) => {
  setIsLoading(true);
  try {
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic YmFycnlhbGxlbmZsYXNoNDI2QGdtYWlsLmNvbQ:RgvKOj-xODto6zpnr_jtv'
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: text
        },
        source_url: "https://i.imgur.com/aGzaVYy.jpeg",
        webhook: "https://host.domain.tld/to/webhook" 
      })
    });

    const data = await response.json();
    console.log("got the talk created");
    if (data && data.id) {
      getTalk(data.id);
    }
  } catch (error) {
    console.error('Error creating talk:', error);
  } finally {
    setIsLoading(false);
  }
};


const getTalk = async (id: any) => {
  setIsLoading(true); // Set loading to true while processing
  const checkStatus = async () => {
      try {
        const response = await fetch(`https://api.d-id.com/talks/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic YmFycnlhbGxlbmZsYXNoNDI2QGdtYWlsLmNvbQ:RgvKOj-xODto6zpnr_jtv'
          }
        });
          const data = await response.json();
          console.log(data)
          if (data.status === 'done') {
              clearInterval(intervalId); // Stop polling when status is 'done'
              console.log(data.result_url);
              setVideoUrl(data.result_url); // Set the video URL for display
              setIsLoading(false); // Set loading to false after fetching the URL
          } else if (data.status === 'failed') {
              clearInterval(intervalId); // Stop polling on failure
              setIsLoading(false); // Ensure loading state is reset on failure
              toast({
                  title: 'Video Processing Failed',
                  description: 'There was a problem processing the video.',
                  status: 'error',
                  duration: 9000,
                  isClosable: true,
              });
          }
          // If the status is still 'started', do nothing, let it loop continue
      } catch (error) {
          clearInterval(intervalId); // Stop polling on error
          setIsLoading(false);
          console.error('Error fetching talk:', error);
          toast({
              title: 'Error',
              description: 'Failed to fetch talk.',
              status: 'error',
              duration: 9000,
              isClosable: true,
          });
      }
  };

  // Start polling every 5 seconds to check the status
  const intervalId = setInterval(checkStatus, 5000);
};

return (
  <Flex
    direction="column"
    minHeight="100vh"
    padding="6"
    width="full"
    background="gray.100"
  >
    {/* Header Section */}
    <Box width="full" textAlign="center" mb="4">
      <Text fontSize="4xl" fontWeight="bold">Study Buddy Bot</Text>
      <Text fontSize="md" color="gray.600">
        Ask any questions you want to learn about. Follow the instructions below.
      </Text>
      {/* Additional instructions text can go here */}
    </Box>

    {/* Main Content Section */}
    <Flex width="full" justify="space-between" align="start">

      {/* Video Section */}
      <Box flex="1" textAlign="center" mr="8">
        {videoUrl ? (
          <video width="100%" controls src={videoUrl} autoPlay loop />
        ) : (
          
            <Image
              src="https://i.imgur.com/aGzaVYy.jpeg"
              alt="Video placeholder"
              fit="cover"
              align="center"
              w="60%"
              h="auto"
              ml={100}
            />
        )}
      </Box>

      {/* Chat Section */}
      <VStack flexBasis="50%" spacing="4" maxHeight="70vh" overflowY="auto" bg="gray.600" rounded="xl" padding="4" boxShadow="xl">
        {messages.map((message, index) => (
          <Box
            key={index}
            bg={message.role === 'assistant' ? 'gray.200' : 'gray.800'}
            color={message.role === 'assistant' ? 'gray.800' : 'gray.50'}
            borderRadius="md"
            padding="3"
            alignSelf="flex-start"
            maxWidth="100%" 
            width="full"
          >
            <Markdown>{message.content}</Markdown>
          </Box>
        ))}
        {isLoading && (
          <Spinner color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" size="xl" />
        )}

        {/* Input Section */}
        <Flex width="full" mt="5">
          <Button
            onClick={toggleListening}
            colorScheme={isListening ? 'red' : 'green'}
            isLoading={isLoading}
            loadingText={isListening ? "Listening..." : ""}
            mr={2}
          >
            {isListening ? 'Listening' : 'Click to Speak'}
          </Button>
          <Textarea
            value={theInput}
            onChange={(e) => setTheInput(e.target.value)}
            placeholder="Type your message here..."
            bg="gray.300"
            resize="none"
            marginRight="2"
            flexGrow="1"
          />
          <Button
            onClick={callServerSideOpenAIEndpoint}
            bg="blue.500"
            isLoading={isLoading}
            loadingText="Sending"
          >
            Send
          </Button>
        </Flex>
      </VStack>

    </Flex>

    {/* Notification Popup */}
    {isShowNotification && (
      <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" bg="gray.200" p="4" rounded="lg">
        {isLoading
          ? <Spinner color="blue.500" thickness="4px" speed="0.65s" emptyColor="gray.200" size="xl" />
          : <Text fontWeight="bold">{popupMessage}</Text>
        }
        <Button onClick={() => setIsShowNotification(false)} colorScheme="blue">Okay!</Button>
      </Box>
    )}
  </Flex>
);

}