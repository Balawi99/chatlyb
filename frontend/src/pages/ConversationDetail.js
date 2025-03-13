import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Heading,
  Input,
  Button,
  Avatar,
  IconButton,
  Divider,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
} from '@chakra-ui/react';
import { ArrowLeft, Send } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { conversationsAPI } from '../utilities/api';
import { getTenantId } from '../utilities/auth';
import { initSocket, sendMessage, getSocket } from '../utilities/socket';
import { format } from 'date-fns';

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const tenantId = getTenantId();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userBubbleBg = useColorModeValue('brand.500', 'brand.400');
  const botBubbleBg = useColorModeValue('gray.100', 'gray.600');
  
  // Initialize socket connection
  useEffect(() => {
    if (tenantId) {
      const socket = initSocket(tenantId);
      
      // Listen for new messages
      socket.on('message:new', (message) => {
        if (message.conversationId === id) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
      
      // Listen for message status updates
      socket.on('message:update', ({ messageId, status }) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          )
        );
      });
      
      // Cleanup on unmount
      return () => {
        socket.off('message:new');
        socket.off('message:update');
      };
    }
  }, [tenantId, id]);
  
  // Fetch conversation data
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await conversationsAPI.getById(id);
        const conversationData = response.data.data;
        
        setConversation(conversationData);
        setMessages(conversationData.messages || []);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setError('Failed to load conversation. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversation();
  }, [id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Format timestamp
  const formatTimestamp = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      // Send message to API
      const response = await conversationsAPI.addMessage(id, newMessage);
      const sentMessage = response.data.data;
      
      // Clear input
      setNewMessage('');
      
      // Send message via socket
      sendMessage(tenantId, sentMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Render message bubbles
  const renderMessages = () => {
    return messages.map((message) => {
      const isUser = message.sender === 'user';
      
      return (
        <Flex
          key={message.id}
          justify={isUser ? 'flex-end' : 'flex-start'}
          mb={4}
        >
          {!isUser && (
            <Avatar
              size="sm"
              name="Chatly Bot"
              bg="brand.500"
              color="white"
              mr={2}
            />
          )}
          <Box
            maxW="70%"
            bg={isUser ? userBubbleBg : botBubbleBg}
            color={isUser ? 'white' : 'black'}
            px={4}
            py={2}
            borderRadius="lg"
            borderBottomRightRadius={isUser ? 0 : 'lg'}
            borderBottomLeftRadius={isUser ? 'lg' : 0}
          >
            <Text>{message.content}</Text>
            <Text fontSize="xs" color={isUser ? 'whiteAlpha.700' : 'gray.500'} textAlign="right" mt={1}>
              {formatTimestamp(message.createdAt)}
              {isUser && (
                <Text as="span" ml={2}>
                  • {message.status}
                </Text>
              )}
            </Text>
          </Box>
          {isUser && (
            <Avatar
              size="sm"
              name="You"
              bg="gray.500"
              ml={2}
            />
          )}
        </Flex>
      );
    });
  };
  
  // Loading skeleton
  const renderSkeleton = () => {
    return Array(5).fill(0).map((_, index) => (
      <Flex key={index} justify={index % 2 === 0 ? 'flex-start' : 'flex-end'} mb={4}>
        {index % 2 === 0 && <Skeleton height="32px" width="32px" borderRadius="full" mr={2} />}
        <Skeleton height="60px" width="60%" borderRadius="lg" />
        {index % 2 !== 0 && <Skeleton height="32px" width="32px" borderRadius="full" ml={2} />}
      </Flex>
    ));
  };
  
  return (
    <DashboardLayout title="Conversation">
      <Box
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        h="calc(100vh - 200px)"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          p={4}
          borderBottom="1px"
          borderColor={borderColor}
          align="center"
        >
          <IconButton
            icon={<ArrowLeft size={18} />}
            variant="ghost"
            mr={2}
            onClick={() => navigate('/conversations')}
            aria-label="Back to conversations"
          />
          {isLoading ? (
            <Skeleton height="24px" width="200px" />
          ) : (
            <Heading size="md">
              {conversation?.title || 'Conversation'}
            </Heading>
          )}
        </Flex>
        
        {/* Messages */}
        <Box flex="1" overflowY="auto" p={4}>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertTitle mr={2}>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            renderSkeleton()
          ) : messages.length === 0 ? (
            <VStack spacing={4} justify="center" h="full">
              <Text color="gray.500">No messages in this conversation yet.</Text>
            </VStack>
          ) : (
            renderMessages()
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Message Input */}
        <Box p={4} borderTop="1px" borderColor={borderColor}>
          <form onSubmit={handleSendMessage}>
            <Flex>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                mr={2}
                disabled={isLoading || isSending}
              />
              <Button
                colorScheme="blue"
                rightIcon={<Send size={16} />}
                type="submit"
                isLoading={isSending}
                loadingText="Sending"
                disabled={isLoading || !newMessage.trim()}
              >
                Send
              </Button>
            </Flex>
          </form>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ConversationDetail; 