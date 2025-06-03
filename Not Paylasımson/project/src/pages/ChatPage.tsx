import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, VStack, HStack, Text, Avatar, Input, Button, useToast, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL, { withCredentials: true });

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Socket.io bağlantısı
  useEffect(() => {
    if (user) {
      socket.emit('userConnected', user._id);

      socket.on('message', (message: Message) => {
        if (selectedUser && (message.sender === selectedUser._id || message.receiver === selectedUser._id)) {
          setMessages(prev => [...prev, message]);
        }
      });
    }

    return () => {
      socket.off('message');
    };
  }, [user, selectedUser]);

  // Kullanıcıları getir
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...'); // Debug log

        if (!user) {
          toast({
            title: 'Hata',
            description: 'Oturum açmanız gerekiyor',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const response = await axios.get(`${API_URL}/api/users`);

        console.log('API Response:', response.data); // Debug log

        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          throw new Error(response.data.message || 'Kullanıcılar yüklenemedi');
        }
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        toast({
          title: 'Hata',
          description: error instanceof Error ? error.message : 'Kullanıcılar yüklenirken bir hata oluştu',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user, toast]);

  // Mesajları getir
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !user) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/chat/messages/${selectedUser._id}`
        );

        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Mesajlar yüklenirken hata:', error);
        toast({
          title: 'Hata',
          description: 'Mesajlar yüklenirken bir hata oluştu',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || !user) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/messages`,
        {
          receiverId: selectedUser._id,
          content: newMessage
        }
      );

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      toast({
        title: 'Hata',
        description: 'Mesaj gönderilirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <HStack spacing={4} align="start" h="calc(100vh - 200px)">
        {/* Kullanıcı Listesi */}
        <VStack
          w="300px"
          h="full"
          bg="white"
          borderRadius="md"
          boxShadow="md"
          p={4}
          spacing={4}
          overflowY="auto"
        >
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Kullanıcılar
          </Text>
          
          {loading ? (
            <Box w="full" display="flex" justifyContent="center" py={4}>
              <Spinner />
            </Box>
          ) : users.length === 0 ? (
            <Text color="gray.500">Kullanıcı bulunamadı</Text>
          ) : (
            users.map((u) => (
              <HStack
                key={u._id}
                w="full"
                p={2}
                borderRadius="md"
                cursor="pointer"
                bg={selectedUser?._id === u._id ? 'blue.50' : 'transparent'}
                _hover={{ bg: 'blue.50' }}
                onClick={() => setSelectedUser(u)}
              >
                <Avatar
                  size="sm"
                  name={u.username}
                  src={u.profilePicture}
                />
                <Text>{u.username}</Text>
              </HStack>
            ))
          )}
        </VStack>

        {/* Sohbet Alanı */}
        <Box
          flex={1}
          h="full"
          bg="white"
          borderRadius="md"
          boxShadow="md"
          p={4}
          display="flex"
          flexDirection="column"
        >
          {selectedUser ? (
            <>
              {/* Sohbet Başlığı */}
              <HStack mb={4} pb={4} borderBottom="1px" borderColor="gray.200">
                <Avatar
                  size="sm"
                  name={selectedUser.username}
                  src={selectedUser.profilePicture}
                />
                <Text fontWeight="bold">{selectedUser.username}</Text>
              </HStack>

              {/* Mesajlar */}
              <VStack
                flex={1}
                spacing={4}
                overflowY="auto"
                mb={4}
                align="stretch"
              >
                {messages.map((message) => (
                  <Box
                    key={message._id}
                    alignSelf={message.sender === user?._id ? 'flex-end' : 'flex-start'}
                    bg={message.sender === user?._id ? 'blue.500' : 'gray.100'}
                    color={message.sender === user?._id ? 'white' : 'black'}
                    p={3}
                    borderRadius="lg"
                    maxW="70%"
                  >
                    <Text>{message.content}</Text>
                    <Text fontSize="xs" color={message.sender === user?._id ? 'blue.100' : 'gray.500'}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Text>
                  </Box>
                ))}
              </VStack>

              {/* Mesaj Gönderme */}
              <HStack>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  colorScheme="blue"
                  onClick={handleSendMessage}
                  isDisabled={!newMessage.trim()}
                >
                  Gönder
                </Button>
              </HStack>
            </>
          ) : (
            <Box
              h="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="gray.500"
            >
              <Text>Sohbet etmek için bir kullanıcı seçin</Text>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

export default ChatPage; 