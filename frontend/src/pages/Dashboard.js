import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { MessageSquare, Database, Sliders, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { conversationsAPI, knowledgeBaseAPI } from '../utilities/api';
import { getTenantId } from '../utilities/auth';

const Dashboard = () => {
  const [stats, setStats] = useState({
    conversations: 0,
    messages: 0,
    knowledgeBase: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const tenantId = getTenantId();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch conversations
        const conversationsResponse = await conversationsAPI.getAll();
        const conversations = conversationsResponse.data.data || [];
        
        // Count total messages across all conversations
        let totalMessages = 0;
        conversations.forEach(conversation => {
          totalMessages += conversation.messages?.length || 0;
        });
        
        // Fetch knowledge base entries
        const knowledgeBaseResponse = await knowledgeBaseAPI.getAll();
        const knowledgeBase = knowledgeBaseResponse.data.data || [];
        
        // Update stats
        setStats({
          conversations: conversations.length,
          messages: totalMessages,
          knowledgeBase: knowledgeBase.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const StatCard = ({ title, value, icon, helpText }) => (
    <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <CardBody>
        <Flex align="center">
          <Box p={2} bg="brand.50" borderRadius="md" mr={4}>
            <Icon as={icon} boxSize={6} color="brand.500" />
          </Box>
          <Stat>
            <StatLabel fontSize="md" color="gray.500">{title}</StatLabel>
            <Skeleton isLoaded={!isLoading}>
              <StatNumber fontSize="2xl">{value}</StatNumber>
            </Skeleton>
            {helpText && <StatHelpText>{helpText}</StatHelpText>}
          </Stat>
        </Flex>
      </CardBody>
    </Card>
  );
  
  const FeatureCard = ({ title, description, icon, linkTo, linkText }) => (
    <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="lg" h="full">
      <CardHeader pb={0}>
        <Flex align="center" mb={2}>
          <Box p={2} bg="brand.50" borderRadius="md" mr={3}>
            <Icon as={icon} boxSize={5} color="brand.500" />
          </Box>
          <Heading size="md">{title}</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Text color="gray.600" mb={4}>{description}</Text>
        <Link to={linkTo}>
          <Button rightIcon={<ArrowRight size={16} />} colorScheme="blue" variant="outline" size="sm">
            {linkText}
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
  
  return (
    <DashboardLayout title="Dashboard">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <StatCard
          title="Total Conversations"
          value={stats.conversations}
          icon={MessageSquare}
        />
        <StatCard
          title="Total Messages"
          value={stats.messages}
          icon={MessageSquare}
        />
        <StatCard
          title="Knowledge Base Entries"
          value={stats.knowledgeBase}
          icon={Database}
        />
      </SimpleGrid>
      
      <Heading size="md" mb={4}>Quick Actions</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <FeatureCard
          title="Conversations"
          description="View and respond to customer conversations in real-time."
          icon={MessageSquare}
          linkTo="/conversations"
          linkText="View Conversations"
        />
        <FeatureCard
          title="Knowledge Base"
          description="Manage your knowledge base to improve AI responses."
          icon={Database}
          linkTo="/knowledge-base"
          linkText="Manage Knowledge Base"
        />
        <FeatureCard
          title="Widget Setup"
          description="Customize your chat widget and get the embed code."
          icon={Sliders}
          linkTo="/setup/basic"
          linkText="Configure Widget"
        />
      </SimpleGrid>
      
      <Box mt={10}>
        <Heading size="md" mb={4}>Getting Started</Heading>
        <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" borderRadius="lg">
          <CardBody>
            <Text mb={4}>
              Welcome to Chatly! Follow these steps to get your AI chat widget up and running:
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>1. Add Knowledge</Text>
                <Text fontSize="sm" color="gray.600">
                  Add content to your knowledge base to help the AI provide better responses.
                </Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>2. Customize Widget</Text>
                <Text fontSize="sm" color="gray.600">
                  Customize the appearance of your chat widget to match your brand.
                </Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>3. Install Widget</Text>
                <Text fontSize="sm" color="gray.600">
                  Copy the embed code and add it to your website to activate the chat widget.
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard; 