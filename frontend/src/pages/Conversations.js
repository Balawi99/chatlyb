import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Heading,
  List,
  ListItem,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { MessageSquare, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { conversationsAPI } from '../utilities/api';
import { formatDistanceToNow } from 'date-fns';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await conversationsAPI.getAll();
        setConversations(response.data.data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, []);
  
  // Function to format the date
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Function to get the last message from a conversation
  const getLastMessage = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet';
    }
    return conversation.messages[0].content;
  };
  
  // Loading skeletons
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <ListItem key={index} p={4} borderBottom="1px" borderColor={borderColor}>
        <Flex>
          <Skeleton height="40px" width="40px" borderRadius="full" mr={3} />
          <Box flex="1">
            <Skeleton height="20px" width="40%" mb={2} />
            <Skeleton height="16px" width="70%" />
          </Box>
          <Skeleton height="16px" width="60px" />
        </Flex>
      </ListItem>
    ));
  };
  
  return (
    <DashboardLayout title="Conversations">
      <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle mr={2}>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <List spacing={0}>
            {renderSkeletons()}
          </List>
        ) : conversations.length === 0 ? (
          <Box p={8} textAlign="center">
            <Box
              bg="gray.50"
              p={6}
              borderRadius="lg"
              display="inline-flex"
              flexDirection="column"
              alignItems="center"
            >
              <MessageSquare size={40} color="#CBD5E0" />
              <Heading size="md" mt={4} mb={2}>No conversations yet</Heading>
              <Text color="gray.500">
                When customers start chatting with your widget, conversations will appear here.
              </Text>
            </Box>
          </Box>
        ) : (
          <List spacing={0}>
            {conversations.map((conversation) => (
              <ListItem key={conversation.id}>
                <Link to={`/conversations/${conversation.id}`}>
                  <Flex
                    p={4}
                    borderBottom="1px"
                    borderColor={borderColor}
                    _hover={{ bg: hoverBg }}
                    transition="background 0.2s"
                  >
                    <Avatar
                      size="md"
                      name={conversation.title || 'Visitor'}
                      bg="brand.500"
                      color="white"
                      mr={3}
                    />
                    <Box flex="1" overflow="hidden">
                      <Flex justify="space-between" align="center" mb={1}>
                        <Heading size="sm" noOfLines={1}>
                          {conversation.title || 'Visitor'}
                        </Heading>
                        <Flex align="center" fontSize="xs" color="gray.500">
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          <Text>{formatDate(conversation.updatedAt)}</Text>
                        </Flex>
                      </Flex>
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {getLastMessage(conversation)}
                      </Text>
                    </Box>
                  </Flex>
                </Link>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Conversations; 