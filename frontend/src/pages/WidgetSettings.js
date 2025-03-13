import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Switch,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Code,
  IconButton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Circle,
  Grid,
  GridItem,
  VStack,
} from '@chakra-ui/react';
import { Copy, Check, Settings, Palette, Brain, Trash2, Plus, MessageCircle, Send, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { widgetAPI } from '../utilities/api';
import { getTenantId } from '../utilities/auth';

const WidgetSettings = () => {
  const [settings, setSettings] = useState({
    title: 'Chat with us',
    welcomeMessage: 'Hello! How can I help you today?',
    primaryColor: '#4299E1',
    secondaryColor: '#2D3748',
    position: 'right',
    autoOpen: false,
    showBranding: true,
    requireEmail: true,
    offlineMessage: 'We are currently offline. Please leave a message and we will get back to you.',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const codeBg = useColorModeValue('gray.50', 'gray.800');
  
  // Fetch widget settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await widgetAPI.getConfig();
        if (response.data.data) {
          // Merge with default settings to ensure all fields exist
          setSettings(prevSettings => ({
            ...prevSettings,
            ...response.data.data,
            // Make sure these UI-specific fields are properly mapped from backend fields
            title: response.data.data.title || response.data.data.welcomeText || prevSettings.title,
            welcomeMessage: response.data.data.welcomeMessage || prevSettings.welcomeMessage,
            primaryColor: response.data.data.primaryColor || response.data.data.color || prevSettings.primaryColor,
            secondaryColor: response.data.data.secondaryColor || prevSettings.secondaryColor,
            position: response.data.data.position || prevSettings.position
          }));
          
          console.log('Loaded widget settings:', response.data.data);
        }
      } catch (error) {
        console.error('Error fetching widget settings:', error);
        setError('Failed to load widget settings. Please try again later.');
        
        // Even on error, we'll use default settings
        toast({
          title: 'Using default settings',
          description: 'Could not load saved settings, using defaults instead',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);
  
  // Generate embed code when settings change
  useEffect(() => {
    const tenantId = getTenantId();
    const code = `<script>
  (function(w, d, s, o) {
    w.ChatlyWidget = o;
    w[o] = w[o] || function() {
      (w[o].q = w[o].q || []).push(arguments);
    };
    const js = d.createElement(s);
    js.id = o;
    js.src = 'http://localhost:8000/widget.js';
    js.async = 1;
    d.head.appendChild(js);
  })(window, document, 'script', 'chatly');
  
  chatly('init', {
    tenantId: '${tenantId}',
  });
</script>`;
    
    setEmbedCode(code);
  }, [settings]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  // Handle color change
  const handleColorChange = (color, field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: color,
    }));
  };
  
  // Save settings
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Map frontend settings to backend expected format
      const backendSettings = {
        // Map UI fields to backend fields
        color: settings.primaryColor,
        position: settings.position,
        welcomeText: settings.title,
        // Include other fields that should be saved
        secondaryColor: settings.secondaryColor,
        welcomeMessage: settings.welcomeMessage,
        showBranding: settings.showBranding,
        requireEmail: settings.requireEmail,
        autoOpen: settings.autoOpen,
        offlineMessage: settings.offlineMessage
      };
      
      console.log('Saving widget settings:', backendSettings);
      
      await widgetAPI.updateConfig(backendSettings);
      
      toast({
        title: 'Success',
        description: 'Widget settings saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Re-fetch settings to ensure we have the latest data
      const response = await widgetAPI.getConfig();
      if (response.data.data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data.data,
          title: response.data.data.title || response.data.data.welcomeText || prevSettings.title,
          welcomeMessage: response.data.data.welcomeMessage || prevSettings.welcomeMessage,
          primaryColor: response.data.data.primaryColor || response.data.data.color || prevSettings.primaryColor,
          secondaryColor: response.data.data.secondaryColor || prevSettings.secondaryColor,
          position: response.data.data.position || prevSettings.position
        }));
      }
    } catch (error) {
      console.error('Error saving widget settings:', error);
      setError('Failed to save widget settings. Please try again later.');
      
      toast({
        title: 'Error',
        description: 'Failed to save widget settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    
    toast({
      title: 'Copied!',
      description: 'Embed code copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <Box>
      <Skeleton height="40px" width="60%" mb={6} />
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Skeleton height="80px" />
        <Skeleton height="80px" />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Skeleton height="80px" />
        <Skeleton height="80px" />
      </SimpleGrid>
      <Skeleton height="120px" mb={6} />
    </Box>
  );
  
  // Widget Preview Component
  const WidgetPreview = ({ settings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
      { id: 1, sender: 'bot', text: settings.welcomeMessage, timestamp: new Date() }
    ]);
    
    const toggleChat = () => setIsOpen(!isOpen);
    
    const handleSendMessage = () => {
      if (!message.trim()) return;
      
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: message,
        timestamp: new Date()
      };
      
      setMessages([...messages, userMessage]);
      setMessage('');
      
      // Simulate bot response after 1 second
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          sender: 'bot',
          text: 'This is a simulated response in the widget preview. Your actual responses will come from your AI configuration.',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }, 1000);
    };
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    };
    
    return (
      <Box 
        position="relative" 
        height="600px" 
        border="1px solid" 
        borderColor="gray.200" 
        borderRadius="md" 
        overflow="hidden"
        bg="gray.50"
      >
        <Flex 
          direction="column" 
          height="100%" 
          width="100%" 
          position="relative"
        >
          {/* Header with title */}
          <Flex 
            bg="white" 
            p={3} 
            borderBottom="1px solid" 
            borderColor="gray.200" 
            justifyContent="center" 
            alignItems="center"
          >
            <Text fontWeight="bold" fontSize="md">Widget Preview</Text>
          </Flex>
          
          {/* Preview content container */}
          <Box 
            flex="1" 
            position="relative" 
            overflow="hidden"
          >
            {/* Mockup Website Content */}
            <Box 
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="white"
              p={4}
              zIndex={1}
            >
              <Heading size="md" mb={2}>Your Website</Heading>
              <Text color="gray.500" fontSize="sm" mb={4}>This is a mockup of your website content</Text>
              <Box bg="gray.100" height="70%" borderRadius="md" p={3}>
                <Text color="gray.600" fontSize="sm">Your content would appear here</Text>
              </Box>
            </Box>
            
            {/* Chat Widget Button - Fixed Position */}
            <Box 
              position="absolute" 
              bottom="20px" 
              right={settings.position === 'right' ? "20px" : "auto"}
              left={settings.position === 'left' ? "20px" : "auto"}
              zIndex={3}
            >
              {!isOpen && (
                <Circle 
                  size="60px" 
                  bg={settings.primaryColor} 
                  color="white" 
                  cursor="pointer" 
                  onClick={toggleChat}
                  boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                  _hover={{ 
                    transform: 'scale(1.05)', 
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)' 
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  <MessageCircle size={24} />
                </Circle>
              )}
            </Box>
            
            {/* Chat Widget Window - Fixed Size and Position */}
            <Box 
              position="absolute"
              bottom="20px"
              right={settings.position === 'right' ? "20px" : "auto"}
              left={settings.position === 'left' ? "20px" : "auto"}
              width="320px" 
              height="450px"
              opacity={isOpen ? 1 : 0}
              visibility={isOpen ? "visible" : "hidden"}
              transform={isOpen ? "translateY(0)" : "translateY(20px)"}
              transition="all 0.3s ease-in-out"
              zIndex={4}
              boxShadow="0 8px 24px rgba(0,0,0,0.2)"
            >
              <Flex 
                direction="column" 
                height="100%" 
                bg="white" 
                borderRadius="md" 
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
              >
                {/* Header */}
                <Flex 
                  bg={settings.primaryColor} 
                  color="white" 
                  p={3} 
                  align="center"
                  justify="space-between"
                >
                  <Text fontWeight="bold">{settings.title}</Text>
                  <IconButton 
                    icon={<X size={18} />} 
                    aria-label="Close chat" 
                    variant="ghost" 
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }} 
                    onClick={toggleChat}
                    size="sm"
                  />
                </Flex>
                
                {/* Messages Area */}
                <Box 
                  flex="1"
                  p={3} 
                  overflowY="auto"
                  bg="gray.50"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      width: '6px',
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'gray.200',
                      borderRadius: '24px',
                    },
                  }}
                >
                  {messages.map((msg) => (
                    <Flex 
                      key={msg.id} 
                      mb={3} 
                      justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                    >
                      <Box 
                        maxWidth="80%" 
                        bg={msg.sender === 'user' ? settings.secondaryColor : settings.primaryColor} 
                        color="white" 
                        p={3} 
                        borderRadius="lg"
                        boxShadow="sm"
                      >
                        <Text fontSize="sm">{msg.text}</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>
                
                {/* Input Area */}
                <Flex p={3} borderTop="1px solid" borderColor="gray.200" bg="white" alignItems="center">
                  <Input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    size="md"
                    borderRadius="full"
                    mr={2}
                    bg="gray.50"
                    _focus={{ 
                      borderColor: settings.primaryColor,
                      boxShadow: `0 0 0 1px ${settings.primaryColor}` 
                    }}
                  />
                  <IconButton 
                    icon={<Send size={18} />} 
                    aria-label="Send message"
                    colorScheme="blue"
                    isRound
                    size="md"
                    onClick={handleSendMessage}
                    bg={settings.primaryColor}
                    _hover={{ 
                      bg: settings.primaryColor, 
                      opacity: 0.9 
                    }}
                  />
                </Flex>
                
                {/* Branding */}
                {settings.showBranding && (
                  <Text fontSize="xs" textAlign="center" color="gray.500" py={1} bg="white">
                    Powered by Chatly
                  </Text>
                )}
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>
    );
  };
  
  const AISettingsTab = () => {
    const [aiSettings, setAiSettings] = useState({
      aiModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      knowledgeBaseEnabled: true,
      defaultResponses: [
        "I'm sorry, I don't have information about that yet.",
        "I couldn't find an answer in my knowledge base. Would you like to speak with a human agent?",
        "Could you please rephrase your question?"
      ]
    });
    
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (field, value) => {
      setAiSettings({
        ...aiSettings,
        [field]: value
      });
    };
    
    const handleSave = async () => {
      try {
        setIsLoading(true);
        await widgetAPI.updateConfig({ aiSettings: aiSettings });
        toast({
          title: 'AI settings saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error saving settings',
          description: error.message || 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const handleDefaultResponseChange = (index, value) => {
      const newResponses = [...aiSettings.defaultResponses];
      newResponses[index] = value;
      handleChange('defaultResponses', newResponses);
    };
    
    const addDefaultResponse = () => {
      handleChange('defaultResponses', [...aiSettings.defaultResponses, '']);
    };
    
    const removeDefaultResponse = (index) => {
      const newResponses = [...aiSettings.defaultResponses];
      newResponses.splice(index, 1);
      handleChange('defaultResponses', newResponses);
    };
    
    return (
      <Box>
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">AI Model Settings</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>AI Model</FormLabel>
                <Select
                  value={aiSettings.aiModel}
                  onChange={(e) => handleChange('aiModel', e.target.value)}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-v1">Claude</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Temperature: {aiSettings.temperature}</FormLabel>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={aiSettings.temperature}
                  onChange={(value) => handleChange('temperature', value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Lower values make responses more deterministic, higher values more creative
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel>Max Tokens: {aiSettings.maxTokens}</FormLabel>
                <Slider
                  min={100}
                  max={2000}
                  step={100}
                  value={aiSettings.maxTokens}
                  onChange={(value) => handleChange('maxTokens', value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Maximum length of AI responses
                </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel>Knowledge Base Integration</FormLabel>
                <Switch
                  isChecked={aiSettings.knowledgeBaseEnabled}
                  onChange={(e) => handleChange('knowledgeBaseEnabled', e.target.checked)}
                  colorScheme="blue"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Enable AI to use your knowledge base for answers
                </Text>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
        
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Default Responses</Heading>
            <Text fontSize="sm" color="gray.500">
              Fallback messages when AI can't find an answer
            </Text>
          </CardHeader>
          <CardBody>
            {aiSettings.defaultResponses.map((response, index) => (
              <Flex key={index} mb={3} gap={2}>
                <Input
                  value={response}
                  onChange={(e) => handleDefaultResponseChange(index, e.target.value)}
                  placeholder="Enter a default response"
                />
                <IconButton
                  icon={<Trash2 size={18} />}
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeDefaultResponse(index)}
                  aria-label="Remove response"
                  isDisabled={aiSettings.defaultResponses.length <= 1}
                />
              </Flex>
            ))}
            
            <Button
              leftIcon={<Plus size={18} />}
              variant="outline"
              size="sm"
              onClick={addDefaultResponse}
              mt={2}
            >
              Add response
            </Button>
          </CardBody>
        </Card>
        
        <Flex justify="flex-end">
          <Button
            colorScheme="blue"
            leftIcon={<Brain size={18} />}
            isLoading={isLoading}
            onClick={handleSave}
          >
            Save AI Settings
          </Button>
        </Flex>
      </Box>
    );
  };
  
  return (
    <DashboardLayout title="Widget Settings">
      <Flex justify="space-between" align="center" mb={6}>
        <Text color="gray.600">
          Customize your chat widget appearance and behavior.
        </Text>
        <Button
          leftIcon={<Settings size={16} />}
          colorScheme="blue"
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving..."
        >
          Save Settings
        </Button>
      </Flex>
      
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList mb="4">
          <Tab>Appearance</Tab>
          <Tab>Behavior</Tab>
          <Tab>Embed Code</Tab>
          <Tab>AI Settings</Tab>
        </TabList>
        
        <TabPanels>
          {/* Appearance Tab */}
          <TabPanel px={0}>
            {isLoading ? (
              renderSkeleton()
            ) : (
              <Grid 
                templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
                gap={8} 
                position="relative"
                alignItems="flex-start"
              >
                <GridItem>
                  <VStack spacing={6} align="stretch">
                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                      <CardHeader pb={2}>
                        <Heading size="md">Text Settings</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
                          <FormControl>
                            <FormLabel>Widget Title</FormLabel>
                            <Input
                              name="title"
                              value={settings.title}
                              onChange={handleInputChange}
                              placeholder="Chat with us"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Welcome Message</FormLabel>
                            <Input
                              name="welcomeMessage"
                              value={settings.welcomeMessage}
                              onChange={handleInputChange}
                              placeholder="How can we help you today?"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                      <CardHeader pb={2}>
                        <Heading size="md">Colors</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
                          <FormControl>
                            <FormLabel>Primary Color</FormLabel>
                            <Flex align="center">
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    leftIcon={<Palette size={16} />}
                                    variant="outline"
                                    mr={3}
                                  >
                                    Select Color
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader>Choose Primary Color</PopoverHeader>
                                  <PopoverBody>
                                    <input
                                      type="color"
                                      value={settings.primaryColor}
                                      onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
                                      style={{ width: '100%', height: '40px' }}
                                    />
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Input
                                value={settings.primaryColor}
                                onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
                                maxWidth="120px"
                              />
                              <Box
                                ml={3}
                                width="40px"
                                height="40px"
                                borderRadius="md"
                                bg={settings.primaryColor}
                                border="1px solid"
                                borderColor={borderColor}
                              />
                            </Flex>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Secondary Color</FormLabel>
                            <Flex align="center">
                              <Popover>
                                <PopoverTrigger>
                                  <Button
                                    leftIcon={<Palette size={16} />}
                                    variant="outline"
                                    mr={3}
                                  >
                                    Select Color
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverHeader>Choose Secondary Color</PopoverHeader>
                                  <PopoverBody>
                                    <input
                                      type="color"
                                      value={settings.secondaryColor}
                                      onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                                      style={{ width: '100%', height: '40px' }}
                                    />
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Input
                                value={settings.secondaryColor}
                                onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                                maxWidth="120px"
                              />
                              <Box
                                ml={3}
                                width="40px"
                                height="40px"
                                borderRadius="md"
                                bg={settings.secondaryColor}
                                border="1px solid"
                                borderColor={borderColor}
                              />
                            </Flex>
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                      <CardHeader pb={2}>
                        <Heading size="md">Position</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <FormLabel>Widget Position</FormLabel>
                          <Select
                            name="position"
                            value={settings.position}
                            onChange={handleInputChange}
                          >
                            <option value="right">Bottom Right</option>
                            <option value="left">Bottom Left</option>
                          </Select>
                        </FormControl>
                      </CardBody>
                    </Card>
                    
                    <Button
                      colorScheme="blue"
                      width="full"
                      leftIcon={<Settings size={16} />}
                      onClick={handleSave}
                      isLoading={isSaving}
                      loadingText="Saving..."
                      size="lg"
                      mt={2}
                    >
                      Save Appearance Settings
                    </Button>
                  </VStack>
                </GridItem>
                
                <GridItem position="sticky" top="20px">
                  <Box
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="lg"
                    height="calc(100vh - 220px)"
                    minHeight="600px"
                  >
                    <WidgetPreview settings={settings} />
                  </Box>
                </GridItem>
              </Grid>
            )}
          </TabPanel>
          
          {/* Behavior Tab */}
          <TabPanel px={0}>
            {isLoading ? (
              renderSkeleton()
            ) : (
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardHeader pb={2}>
                  <Heading size="md">Widget Behavior</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <Switch
                        id="auto-open"
                        name="autoOpen"
                        isChecked={settings.autoOpen}
                        onChange={handleInputChange}
                        mr={3}
                      />
                      <FormLabel htmlFor="auto-open" mb={0}>
                        Auto-open widget after page load
                      </FormLabel>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch
                        id="show-branding"
                        name="showBranding"
                        isChecked={settings.showBranding}
                        onChange={handleInputChange}
                        mr={3}
                      />
                      <FormLabel htmlFor="show-branding" mb={0}>
                        Show "Powered by Chatly" branding
                      </FormLabel>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Switch
                        id="require-email"
                        name="requireEmail"
                        isChecked={settings.requireEmail}
                        onChange={handleInputChange}
                        mr={3}
                      />
                      <FormLabel htmlFor="require-email" mb={0}>
                        Require visitor email before starting chat
                      </FormLabel>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </TabPanel>
          
          {/* Embed Code Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Widget Embed Code</Heading>
                  <Tooltip label={copied ? 'Copied!' : 'Copy to clipboard'}>
                    <IconButton
                      icon={copied ? <Check size={16} /> : <Copy size={16} />}
                      aria-label="Copy embed code"
                      onClick={copyEmbedCode}
                      colorScheme={copied ? 'green' : 'blue'}
                    />
                  </Tooltip>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>
                  Copy and paste this code snippet just before the closing <Code>&lt;/body&gt;</Code> tag of your website.
                </Text>
                <Box
                  bg={codeBg}
                  p={4}
                  borderRadius="md"
                  fontFamily="mono"
                  fontSize="sm"
                  whiteSpace="pre"
                  overflowX="auto"
                >
                  {embedCode}
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <AISettingsTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DashboardLayout>
  );
};

export default WidgetSettings; 