import React, { useState, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Input, Button, Text, Container, Flex, Avatar as ChakraAvatar, createStandaloneToast } from '@chakra-ui/react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
  };
  receiver: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface ChatProps {
  currentUser: {
    _id: string;
    username: string;
    avatar: string;
  };
  receiverId: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser, receiverId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('userConnected', currentUser._id);

    newSocket.on('newMessage', (message: Message) => {
      if (
        (message.sender._id === currentUser._id && message.receiver._id === receiverId) ||
        (message.sender._id === receiverId && message.receiver._id === currentUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [currentUser._id, receiverId]);

  useEffect(() => {
    fetchMessages();
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/messages/${receiverId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverId,
          content: newMessage
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const showToast = (message: string, status: 'success' | 'error' | 'warning' | 'info') => {
    toast({
      title: status === 'success' ? 'Başarılı' : 'Hata',
      description: message,
      status: status,
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  return (
    <Container maxW="container.md" h="100vh" py={4}>
      <VStack h="full" gap={4}>
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          borderWidth={1}
          borderRadius="md"
          p={4}
        >
          {messages.map((message) => (
            <Flex
              key={message._id}
              justify={message.sender._id === currentUser._id ? 'flex-end' : 'flex-start'}
              mb={4}
            >
              <HStack
                gap={2}
                bg={message.sender._id === currentUser._id ? 'blue.500' : 'gray.100'}
                color={message.sender._id === currentUser._id ? 'white' : 'black'}
                p={3}
                borderRadius="lg"
                maxW="70%"
              >
                <ChakraAvatar size="sm" src={message.sender.avatar} />
                <Text>{message.content}</Text>
              </HStack>
            </Flex>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <HStack w="full">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button colorScheme="blue" onClick={sendMessage}>
            Send
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Chat; 