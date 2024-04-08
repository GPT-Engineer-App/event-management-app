import React, { useState, useEffect } from "react";
import { Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, List, ListItem, Stack, Text, useToast } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrashAlt, FaSignOutAlt } from "react-icons/fa";

const Index = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({ email: "", username: "", password: "" });
  const [eventData, setEventData] = useState({ name: "", description: "" });
  const [editingEventId, setEditingEventId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchEvents(token);
    }
  }, []);

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/auth/local/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsAuthenticated(true);
        fetchEvents(data.jwt);
      } else {
        toast({
          title: "Registration failed",
          description: data.message[0].messages[0].message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("There was an error registering the user:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userData.email,
          password: userData.password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsAuthenticated(true);
        fetchEvents(data.jwt);
      } else {
        toast({
          title: "Login failed",
          description: data.message[0].messages[0].message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("There was an error logging in:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setEvents([]);
  };

  const fetchEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:1337/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("There was an error fetching the events:", error);
    }
  };

  const handleCreateOrUpdateEvent = async () => {
    const url = editingEventId ? `http://localhost:1337/api/events/${editingEventId}` : "http://localhost:1337/api/events";
    const method = editingEventId ? "PUT" : "POST";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: eventData.name,
          description: eventData.description,
        }),
      });
      const data = await response.json();
      if (data.id) {
        fetchEvents(token);
        setEventData({ name: "", description: "" });
        setEditingEventId(null);
      } else {
        toast({
          title: "Failed to save event",
          description: data.message[0].messages[0].message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("There was an error saving the event:", error);
    }
  };

  const handleDeleteEvent = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:1337/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.id) {
        fetchEvents(token);
      } else {
        toast({
          title: "Failed to delete event",
          description: "Something went wrong",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("There was an error deleting the event:", error);
    }
  };

  const handleEditEvent = (event) => {
    setEventData({ name: event.name, description: event.description });
    setEditingEventId(event.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingEventId) {
      setEventData({ ...eventData, [name]: value });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={4}>Event Manager</Heading>
      {!isAuthenticated ? (
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={userData.email} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" name="username" value={userData.username} onChange={handleInputChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" name="password" value={userData.password} onChange={handleInputChange} />
          </FormControl>
          <Button colorScheme="blue" onClick={handleRegister}>
            Register
          </Button>
          <Button colorScheme="teal" onClick={handleLogin}>
            Login
          </Button>
        </Stack>
      ) : (
        <>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="md">Your Events</Heading>
            <Button leftIcon={<FaSignOutAlt />} colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </Flex>
          <List mt={4} spacing={3}>
            {events.map((event) => (
              <ListItem key={event.id} p={2} shadow="md">
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    <Heading size="sm">{event.name}</Heading>
                    <Text fontSize="sm">{event.description}</Text>
                  </Box>
                  <Box>
                    <Button size="sm" leftIcon={<FaEdit />} colorScheme="yellow" onClick={() => handleEditEvent(event)}>
                      Edit
                    </Button>
                    <Button size="sm" leftIcon={<FaTrashAlt />} colorScheme="red" onClick={() => handleDeleteEvent(event.id)}>
                      Delete
                    </Button>
                  </Box>
                </Flex>
              </ListItem>
            ))}
          </List>
          <Heading size="md" mt={6}>
            {editingEventId ? "Edit Event" : "Create Event"}
          </Heading>
          <Stack mt={4} spacing={4}>
            <FormControl>
              <FormLabel>Event Name</FormLabel>
              <Input type="text" name="name" value={eventData.name} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Event Description</FormLabel>
              <Input type="text" name="description" value={eventData.description} onChange={handleInputChange} />
            </FormControl>
            <Button leftIcon={<FaPlus />} colorScheme={editingEventId ? "yellow" : "green"} onClick={handleCreateOrUpdateEvent}>
              {editingEventId ? "Update" : "Create"}
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
};

export default Index;
