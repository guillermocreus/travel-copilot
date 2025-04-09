import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Flex,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

const Chat = () => {
  const { user, messages, addMessage, clearMessages, setUser } = useStore();
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const ws = new WebSocket(`ws://${WORKER_URL.replace('http://', '')}/ws`);
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        payload: user
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          addMessage(data.payload);
          break;
        case 'user-joined':
          toast({
            title: 'User Joined',
            description: `${data.payload.name} has joined the chat`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
          break;
        case 'user-left':
          toast({
            title: 'User Left',
            description: `${data.payload.name} has left the chat`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
          break;
        case 'error':
          toast({
            title: 'Error',
            description: data.payload,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [user, addMessage, navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket || !user) return;

    socket.send(JSON.stringify({
      type: 'message',
      payload: input.trim()
    }));
    setInput('');
  };

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    clearMessages();
    setUser(null);
    navigate('/');
  };

  return (
    <Box h="100vh" p={4}>
      <VStack h="full" spacing={4}>
        <HStack w="full" justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Travel Copilot Chat
          </Text>
          <Button onClick={handleLogout} colorScheme="red" size="sm">
            Logout
          </Button>
        </HStack>
        <Divider />
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          borderWidth={1}
          borderRadius="lg"
          p={4}
          bg="white"
        >
          <VStack spacing={4} align="stretch">
            {messages.map((message) => (
              <Box
                key={message.id}
                bg={message.type === 'llm' ? 'blue.50' : 'gray.50'}
                p={3}
                borderRadius="md"
                maxW="80%"
                alignSelf={
                  message.userId === user?.id ? 'flex-end' : 'flex-start'
                }
              >
                <Text fontWeight="bold" fontSize="sm">
                  {message.userName}
                </Text>
                <Text>{message.content}</Text>
                <Text fontSize="xs" color="gray.500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>
        <HStack w="full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or use /ask to query the AI..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<Text>Send</Text>}
            onClick={handleSend}
            colorScheme="blue"
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default Chat; 