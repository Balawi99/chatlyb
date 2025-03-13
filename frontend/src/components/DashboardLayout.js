import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  VStack,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import {
  Menu as MenuIcon,
  Home,
  MessageSquare,
  Database,
  Settings as SettingsIcon,
  Sliders,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { logout, getUserData } from '../utilities/auth';

const DashboardLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = getUserData();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Conversations', path: '/conversations', icon: <MessageSquare size={20} /> },
    { name: 'Knowledge Base', path: '/knowledge-base', icon: <Database size={20} /> },
    { name: 'Widget Settings', path: '/widget-settings', icon: <Sliders size={20} /> },
    { name: 'Profile', path: '/profile', icon: <SettingsIcon size={20} /> },
  ];
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <Flex h="100vh" flexDirection={{ base: 'column', md: 'row' }}>
      {/* Mobile Header */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        justifyContent="space-between"
        p={4}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Heading size="md" color="brand.500">Chatly</Heading>
        <IconButton
          icon={<MenuIcon />}
          variant="ghost"
          onClick={onOpen}
          aria-label="Open Menu"
        />
      </Flex>
      
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <Heading size="md" color="brand.500">Chatly</Heading>
            </Flex>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0}>
              {navItems.map((item) => (
                <Link to={item.path} key={item.path} onClick={onClose}>
                  <Flex
                    align="center"
                    p={3}
                    mx={3}
                    borderRadius="md"
                    role="group"
                    cursor="pointer"
                    bg={location.pathname === item.path ? 'brand.50' : 'transparent'}
                    color={location.pathname === item.path ? 'brand.500' : 'gray.600'}
                    _hover={{
                      bg: 'brand.50',
                      color: 'brand.500',
                    }}
                    mt={2}
                  >
                    {item.icon}
                    <Text ml={4} fontWeight="medium">
                      {item.name}
                    </Text>
                    {location.pathname === item.path && (
                      <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                    )}
                  </Flex>
                </Link>
              ))}
              <Flex
                align="center"
                p={3}
                mx={3}
                borderRadius="md"
                role="group"
                cursor="pointer"
                onClick={handleLogout}
                _hover={{
                  bg: 'red.50',
                  color: 'red.500',
                }}
                mt={2}
              >
                <LogOut size={20} />
                <Text ml={4} fontWeight="medium">
                  Logout
                </Text>
              </Flex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="240px"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        py={5}
      >
        <Flex direction="column" h="full" justify="space-between">
          <VStack align="stretch" spacing={6}>
            <Box px={6}>
              <Heading size="md" color="brand.500">Chatly</Heading>
            </Box>
            <VStack align="stretch" spacing={1}>
              {navItems.map((item) => (
                <Link to={item.path} key={item.path}>
                  <Flex
                    align="center"
                    p={3}
                    mx={3}
                    borderRadius="md"
                    role="group"
                    cursor="pointer"
                    bg={location.pathname === item.path ? 'brand.50' : 'transparent'}
                    color={location.pathname === item.path ? 'brand.500' : 'gray.600'}
                    _hover={{
                      bg: 'brand.50',
                      color: 'brand.500',
                    }}
                  >
                    {item.icon}
                    <Text ml={4} fontWeight="medium">
                      {item.name}
                    </Text>
                    {location.pathname === item.path && (
                      <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
                    )}
                  </Flex>
                </Link>
              ))}
            </VStack>
          </VStack>
          
          <Box px={6}>
            <Menu>
              <MenuButton
                as={Box}
                rounded="md"
                px={3}
                py={2}
                _hover={{ bg: 'gray.100' }}
                cursor="pointer"
              >
                <HStack>
                  <Avatar size="sm" name={user?.user?.companyName || 'User'} />
                  <Box textAlign="left">
                    <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                      {user?.user?.companyName || 'User'}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {user?.user?.email || 'user@example.com'}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} to="/profile">Profile Settings</MenuItem>
                <MenuItem onClick={handleLogout} isDisabled={isLoggingOut}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Box>
      
      {/* Main Content */}
      <Box flex="1" overflow="auto" bg="gray.50">
        <Box p={6}>
          <Heading size="lg" mb={6}>{title}</Heading>
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default DashboardLayout; 