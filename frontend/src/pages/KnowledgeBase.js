import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Select,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Divider,
  useColorMode,
} from '@chakra-ui/react';
import { Plus, Edit, Trash2, Database, Globe } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { knowledgeBaseAPI } from '../utilities/api';

const KnowledgeBase = () => {
  const { colorMode } = useColorMode();
  const borderColor = { light: 'gray.200', dark: 'gray.600' };
  const cardBg = { light: 'white', dark: 'gray.700' };
  const toast = useToast();
  
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentEntry, setCurrentEntry] = useState(null);
  const [formData, setFormData] = useState({
    type: 'text',
    content: '',
    question: '',
    answer: '',
  });
  
  // Filter entries by type
  const textEntries = entries.filter((entry) => entry.type === 'text');
  const qaEntries = entries.filter((entry) => entry.type === 'qa');
  
  // Fetch knowledge base entries
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await knowledgeBaseAPI.getAll();
      setEntries(response.data.data || []);
    } catch (err) {
      console.error('Error fetching knowledge base entries:', err);
      setError('Failed to load knowledge base entries. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load knowledge base entries',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEntries();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Open modal for creating a new entry
  const handleAddNew = () => {
    setCurrentEntry(null);
    setFormData({
      type: 'text',
      content: '',
      question: '',
      answer: '',
    });
    onOpen();
  };
  
  // Open modal for editing an existing entry
  const handleEdit = (entry) => {
    setCurrentEntry(entry);
    setFormData({
      type: entry.type,
      content: entry.content || '',
      question: entry.question || '',
      answer: entry.answer || '',
    });
    onOpen();
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate form data
      if (formData.type === 'text' && !formData.content) {
        toast({
          title: 'Error',
          description: 'Content is required for text entries',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (formData.type === 'qa' && (!formData.question || !formData.answer)) {
        toast({
          title: 'Error',
          description: 'Both question and answer are required for Q&A pairs',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (currentEntry) {
        // Update existing entry
        const response = await knowledgeBaseAPI.update(currentEntry.id, formData);
        
        // Update entries list
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === currentEntry.id ? response.data.data : entry
          )
        );
        
        toast({
          title: 'Success',
          description: 'Knowledge base entry updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new entry
        const response = await knowledgeBaseAPI.create(formData);
        
        // Add to entries list
        setEntries((prev) => [response.data.data, ...prev]);
        
        toast({
          title: 'Success',
          description: 'Knowledge base entry created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error saving knowledge base entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save knowledge base entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle entry deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await knowledgeBaseAPI.delete(id);
        
        // Remove from entries list
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
        
        toast({
          title: 'Success',
          description: 'Knowledge base entry deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting knowledge base entry:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete knowledge base entry',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <Card key={index} bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardHeader pb={0}>
          <Skeleton height="24px" width="60%" mb={2} />
        </CardHeader>
        <CardBody>
          <Skeleton height="60px" mb={2} />
          <Skeleton height="20px" width="40%" />
        </CardBody>
      </Card>
    ));
  };

  const WebsiteCrawlerTab = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [crawledSites, setCrawledSites] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const { isOpen: isCrawlerOpen, onOpen: onCrawlerOpen, onClose: onCrawlerClose } = useDisclosure();
    const [crawlerFormData, setCrawlerFormData] = useState({
      url: '',
      selector: ''
    });

    // Fetch history of crawled websites
    useEffect(() => {
      const fetchCrawlHistory = async () => {
        try {
          setIsFetchingHistory(true);
          // Filter text entries that have metadata indicating they came from website crawling
          const crawledEntries = textEntries
            .filter(entry => {
              if (!entry.metadata) return false;
              try {
                const metadata = JSON.parse(entry.metadata);
                return metadata.source === 'website_crawler';
              } catch (e) {
                return false;
              }
            })
            .map(entry => {
              let metadata = {};
              try {
                metadata = JSON.parse(entry.metadata);
              } catch (e) {
                // If metadata parsing fails, use defaults
              }
              
              return {
                id: entry.id,
                url: metadata.url || 'Unknown URL',
                title: metadata.title || 'Untitled Page',
                content: entry.content,
                timestamp: metadata.crawledAt || entry.createdAt
              };
            });
            
          setCrawledSites(crawledEntries);
        } catch (error) {
          console.error('Error fetching crawl history:', error);
        } finally {
          setIsFetchingHistory(false);
        }
      };

      fetchCrawlHistory();
    }, [textEntries]);

    const handleCrawlerInputChange = (e) => {
      const { name, value } = e.target;
      setCrawlerFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleCrawl = async () => {
      if (!crawlerFormData.url) {
        toast({
          title: 'URL required',
          description: 'Please enter a website URL to crawl',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        setIsLoading(true);
        await knowledgeBaseAPI.crawlWebsite({ 
          url: crawlerFormData.url, 
          selector: crawlerFormData.selector 
        });
        toast({
          title: 'Website crawled',
          description: 'Website content has been added to your knowledge base',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh knowledge base entries
        fetchEntries();
        
        // Reset form and close modal
        setCrawlerFormData({
          url: '',
          selector: ''
        });
        onCrawlerClose();
      } catch (error) {
        toast({
          title: 'Crawling failed',
          description: error.message || 'Error crawling the website. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="md">
            {/* Removing this text since it appears in the modal dialog */}
          </Text>
          
          <Button
            colorScheme="blue"
            onClick={onCrawlerOpen}
            leftIcon={<Globe size={18} />}
          >
            Crawl New Website
          </Button>
        </Flex>
        
        <Divider my={6} />
        
        <Heading size="md" mb={4}>Crawled Websites</Heading>
        
        {isFetchingHistory ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {renderSkeletons()}
          </SimpleGrid>
        ) : crawledSites.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={cardBg}
          >
            <Box
              bg="gray.50"
              p={6}
              borderRadius="lg"
              display="inline-flex"
              flexDirection="column"
              alignItems="center"
            >
              <Globe size={40} color="#CBD5E0" />
              <Heading size="md" mt={4} mb={2}>No websites crawled yet</Heading>
              <Text color="gray.500" mb={4}>
                Crawl your website content to help the AI understand your business better.
              </Text>
              <Button
                leftIcon={<Globe size={16} />}
                colorScheme="blue"
                onClick={onCrawlerOpen}
              >
                Crawl Your First Website
              </Button>
            </Box>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {crawledSites.map((site) => (
              <Card key={site.id} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardHeader pb={0}>
                  <Heading size="md" noOfLines={1}>
                    {site.title || site.url}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {site.url}
                  </Text>
                </CardHeader>
                <CardBody>
                  <Text noOfLines={3}>{site.content}</Text>
                </CardBody>
                <CardFooter pt={0}>
                  <Flex justify="space-between" w="full" align="center">
                    <Text fontSize="xs" color="gray.500">
                      {new Date(site.timestamp).toLocaleDateString()}
                    </Text>
                    <IconButton
                      icon={<Trash2 size={16} />}
                      aria-label="Delete"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(site.id)}
                    />
                  </Flex>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Website Crawler Modal */}
        <Modal isOpen={isCrawlerOpen} onClose={onCrawlerClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Crawl Website Content</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl id="website-url" isRequired mb={4}>
                <FormLabel>Website URL</FormLabel>
                <Input
                  name="url"
                  placeholder="https://yourdomain.com/page"
                  value={crawlerFormData.url}
                  onChange={handleCrawlerInputChange}
                />
              </FormControl>
              
              <FormControl id="css-selector" mb={4}>
                <FormLabel>CSS Selector (Optional)</FormLabel>
                <Input
                  name="selector"
                  placeholder="article, .content, #main-content"
                  value={crawlerFormData.selector}
                  onChange={handleCrawlerInputChange}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Target specific content with CSS selectors, or leave empty to extract all content
                </Text>
              </FormControl>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCrawlerClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleCrawl}
                isLoading={isLoading}
                loadingText="Crawling..."
                leftIcon={<Globe size={16} />}
              >
                Crawl Website
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  };

  return (
    <DashboardLayout title="Knowledge Base">
      <Flex justify="space-between" align="center" mb={6}>
        <Text color="gray.600">
          Manage your knowledge base to help the AI provide better responses to your customers.
        </Text>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="blue"
          onClick={handleAddNew}
        >
          Add New Entry
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
        <TabList>
          <Tab>Text Entries ({textEntries.length})</Tab>
          <Tab>Q&A Pairs ({qaEntries.length})</Tab>
          <Tab>Website Crawler</Tab>
        </TabList>
        
        <TabPanels>
          {/* Text Entries Tab */}
          <TabPanel px={0}>
            {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {renderSkeletons()}
              </SimpleGrid>
            ) : textEntries.length === 0 ? (
              <Box
                p={8}
                textAlign="center"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                bg={cardBg}
              >
                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="lg"
                  display="inline-flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Database size={40} color="#CBD5E0" />
                  <Heading size="md" mt={4} mb={2}>No text entries yet</Heading>
                  <Text color="gray.500" mb={4}>
                    Add text entries to help the AI understand your business better.
                  </Text>
                  <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme="blue"
                    onClick={handleAddNew}
                  >
                    Add Text Entry
                  </Button>
                </Box>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {textEntries.map((entry) => (
                  <Card key={entry.id} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardHeader pb={0}>
                      <Heading size="md" noOfLines={1}>
                        {entry.content?.substring(0, 30)}...
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text noOfLines={3}>{entry.content}</Text>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Flex justify="flex-end" w="full">
                        <IconButton
                          icon={<Edit size={16} />}
                          aria-label="Edit"
                          variant="ghost"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleEdit(entry)}
                        />
                        <IconButton
                          icon={<Trash2 size={16} />}
                          aria-label="Delete"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(entry.id)}
                        />
                      </Flex>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* Q&A Pairs Tab */}
          <TabPanel px={0}>
            {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {renderSkeletons()}
              </SimpleGrid>
            ) : qaEntries.length === 0 ? (
              <Box
                p={8}
                textAlign="center"
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                bg={cardBg}
              >
                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="lg"
                  display="inline-flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Database size={40} color="#CBD5E0" />
                  <Heading size="md" mt={4} mb={2}>No Q&A pairs yet</Heading>
                  <Text color="gray.500" mb={4}>
                    Add question and answer pairs to help the AI respond to common queries.
                  </Text>
                  <Button
                    leftIcon={<Plus size={16} />}
                    colorScheme="blue"
                    onClick={handleAddNew}
                  >
                    Add Q&A Pair
                  </Button>
                </Box>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {qaEntries.map((entry) => (
                  <Card key={entry.id} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardHeader pb={0}>
                      <Heading size="md" noOfLines={1}>
                        {entry.question}
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text noOfLines={3}>{entry.answer}</Text>
                    </CardBody>
                    <CardFooter pt={0}>
                      <Flex justify="flex-end" w="full">
                        <IconButton
                          icon={<Edit size={16} />}
                          aria-label="Edit"
                          variant="ghost"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleEdit(entry)}
                        />
                        <IconButton
                          icon={<Trash2 size={16} />}
                          aria-label="Delete"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(entry.id)}
                        />
                      </Flex>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* Website Crawler Tab */}
          <TabPanel px={0}>
            <WebsiteCrawlerTab />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentEntry ? 'Edit Knowledge Base Entry' : 'Add Knowledge Base Entry'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Entry Type</FormLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="text">Text Entry</option>
                <option value="qa">Q&A Pair</option>
              </Select>
            </FormControl>
            
            {formData.type === 'text' ? (
              <FormControl mb={4}>
                <FormLabel>Content</FormLabel>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter text content..."
                  rows={6}
                />
              </FormControl>
            ) : (
              <>
                <FormControl mb={4}>
                  <FormLabel>Question</FormLabel>
                  <Input
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter a question..."
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Answer</FormLabel>
                  <Textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    placeholder="Enter the answer..."
                    rows={4}
                  />
                </FormControl>
              </>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {currentEntry ? 'Update' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
};

export default KnowledgeBase; 