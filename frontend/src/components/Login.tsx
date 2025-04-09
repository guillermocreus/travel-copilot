import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useStore } from '../store';

const Login = () => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { setUser } = useStore();
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      apiKey: apiKey.trim(),
    };

    setUser(user);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        w="full"
        maxW="md"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={6}>
          <Heading>Welcome to Travel Copilot</Heading>
          <Text color="gray.600">
            Enter your details to join the chat room
          </Text>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>OpenAI API Key</FormLabel>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                mt={4}
              >
                Join Chat
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login; 