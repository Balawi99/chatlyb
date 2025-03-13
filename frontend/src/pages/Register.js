import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  Container,
} from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { register, login } from '../utilities/auth';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !companyName) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register the user
      await register({ email, password, companyName });
      
      // Show success message
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Logging you in...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Log the user in
      await login({ email, password });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="md" pt={20}>
        <Flex direction="column" align="center" mb={8}>
          <Heading color="brand.500" size="xl">Chatly</Heading>
          <Text mt={2} color="gray.600">AI-powered chat widget for your website</Text>
        </Flex>
        
        <Box bg="white" p={8} rounded="lg" shadow="base">
          <Heading as="h2" size="lg" mb={6} textAlign="center">
            Create an Account
          </Heading>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </FormControl>
              
              <FormControl id="companyName" isRequired>
                <FormLabel>Company/Site Name</FormLabel>
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company or Website Name"
                />
              </FormControl>
              
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                loadingText="Creating account..."
                w="full"
                mt={4}
              >
                Sign Up
              </Button>
            </Stack>
          </form>
          
          <Text mt={6} textAlign="center">
            Already have an account?{' '}
            <Link to="/login">
              <Text as="span" color="brand.500" fontWeight="medium">
                Log In
              </Text>
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Register; 