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
  Avatar,
  VStack,
  HStack,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { User, Mail, Building, Eye, EyeOff, Save, Key } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { settingsAPI } from '../utilities/api';
import { getUserData, setUserData } from '../utilities/auth';

const Profile = () => {
  const [userData, setUserData] = useState({
    email: '',
    companyName: '',
    firstName: '',
    lastName: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user from local storage first
        const storedUser = getUserData();
        if (storedUser) {
          setUserData({
            email: storedUser.user.email || '',
            companyName: storedUser.user.companyName || '',
            firstName: storedUser.user.firstName || '',
            lastName: storedUser.user.lastName || '',
          });
        }
        
        // Then fetch from API to get the latest data
        const response = await settingsAPI.getProfile();
        if (response.data.data) {
          const user = response.data.data;
          setUserData({
            email: user.email || '',
            companyName: user.companyName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle profile input changes
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle password input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Save profile
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Validate form data
      if (!userData.email) {
        toast({
          title: 'Error',
          description: 'Email is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsSaving(false);
        return;
      }
      
      const response = await settingsAPI.updateProfile(userData);
      
      // Update user in local storage (using setUserData instead of updateUserInStorage)
      const currentUser = getUserData();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          user: {
            ...currentUser.user,
            ...response.data.data
          }
        };
        setUserData(updatedUser);
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again later.');
      
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change password
  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);
      setError(null);
      
      // Validate password data
      if (!passwordData.currentPassword) {
        toast({
          title: 'Error',
          description: 'Current password is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsChangingPassword(false);
        return;
      }
      
      if (!passwordData.newPassword) {
        toast({
          title: 'Error',
          description: 'New password is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsChangingPassword(false);
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        toast({
          title: 'Error',
          description: 'New password must be at least 8 characters long',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsChangingPassword(false);
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsChangingPassword(false);
        return;
      }
      
      await settingsAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific error for incorrect current password
      if (error.response && error.response.status === 401) {
        toast({
          title: 'Error',
          description: 'Current password is incorrect',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setError('Failed to change password. Please try again later.');
        
        toast({
          title: 'Error',
          description: 'Failed to change password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    } else if (firstName) {
      return firstName.charAt(0);
    } else if (userData.companyName) {
      return userData.companyName.charAt(0);
    } else {
      return 'U';
    }
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
    </Box>
  );
  
  return (
    <DashboardLayout title="Profile">
      <Flex justify="space-between" align="center" mb={6}>
        <Text color="gray.600">
          Manage your account settings and change your password.
        </Text>
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
          <Tab>Profile Information</Tab>
          <Tab>Security</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Information Tab */}
          <TabPanel px={0}>
            {isLoading ? (
              renderSkeleton()
            ) : (
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardHeader pb={2}>
                  <Flex align="center">
                    <Avatar
                      size="lg"
                      name={getUserInitials()}
                      bg="blue.500"
                      color="white"
                      mr={4}
                    />
                    <Box>
                      <Heading size="md">
                        {userData.firstName
                          ? `${userData.firstName} ${userData.lastName}`
                          : userData.companyName}
                      </Heading>
                      <Text color="gray.500">{userData.email}</Text>
                    </Box>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <InputGroup>
                          <Input
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleProfileInputChange}
                            placeholder="First Name"
                          />
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <InputGroup>
                          <Input
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleProfileInputChange}
                            placeholder="Last Name"
                          />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <InputGroup>
                        <Input
                          name="email"
                          value={userData.email}
                          onChange={handleProfileInputChange}
                          placeholder="Email Address"
                          type="email"
                        />
                      </InputGroup>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Company Name</FormLabel>
                      <InputGroup>
                        <Input
                          name="companyName"
                          value={userData.companyName}
                          onChange={handleProfileInputChange}
                          placeholder="Company Name"
                        />
                      </InputGroup>
                    </FormControl>
                    
                    <Flex justify="flex-end">
                      <Button
                        leftIcon={<Save size={16} />}
                        colorScheme="blue"
                        onClick={handleSaveProfile}
                        isLoading={isSaving}
                        loadingText="Saving..."
                      >
                        Save Changes
                      </Button>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </TabPanel>
          
          {/* Security Tab */}
          <TabPanel px={0}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader pb={2}>
                <Heading size="md">Change Password</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Current Password"
                        type={showCurrentPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          variant="ghost"
                          onClick={() => togglePasswordVisibility('current')}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                          variant="ghost"
                          onClick={() => togglePasswordVisibility('new')}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          variant="ghost"
                          onClick={() => togglePasswordVisibility('confirm')}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Flex justify="flex-end">
                    <Button
                      leftIcon={<Key size={16} />}
                      colorScheme="blue"
                      onClick={handleChangePassword}
                      isLoading={isChangingPassword}
                      loadingText="Changing..."
                    >
                      Change Password
                    </Button>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DashboardLayout>
  );
};

export default Profile; 