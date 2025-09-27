// frontend/src/components/chat/PatientDoctorChat.jsx



import React, { useState, useEffect, useRef } from 'react';

import axios from 'axios';

import { useAuthContext } from '../../contexts/AuthContext';

import { useSocketContext } from '../../contexts/SocketContext';

import '../../assets/css/ChatStyles.css';

import '../../assets/css/ChatWindow.css'; // Make sure you create and link this CSS file

import { FaPaperPlane, FaTrash } from 'react-icons/fa';



const PatientDoctorChat = () => {

    const { user } = useAuthContext();

    const { socket } = useSocketContext();

    const [conversations, setConversations] = useState([]);

    const [selectedConversation, setSelectedConversation] = useState(null);

    const [messages, setMessages] = useState([]);

    const [newMessage, setNewMessage] = useState('');

    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    // 🐞 FIX: Add a ref for auto-scrolling

    const messagesEndRef = useRef(null);



    const fetchDoctors = async () => {

        try {

            const token = localStorage.getItem('token');

            const response = await axios.get('http://localhost:5000/api/doctors/verified', {

                headers: { Authorization: `Bearer ${token}` },

            });

            setDoctors(response.data?.data || []);

        } catch (error) {

            console.error('Error fetching verified doctors:', error);

            if (error.response && error.response.status === 404) {

                setError("No verified doctors found.");

            } else {

                setError("Failed to fetch doctors.");

            }

        }

    };



    const fetchConversations = async () => {

        try {

            const token = localStorage.getItem('token');

            const response = await axios.get(`http://localhost:5000/api/chat/conversations`, {

                headers: { Authorization: `Bearer ${token}` },

            });

            setConversations(response.data?.data || []);

        } catch (error) {

            console.error('Error fetching conversations:', error);

            setError("Failed to fetch conversations.");

        }

    };



    const fetchMessages = async (conversationId) => {

        try {

            const token = localStorage.getItem('token');

            const response = await axios.get(`http://localhost:5000/api/chat/messages/${conversationId}`, {

                headers: { Authorization: `Bearer ${token}` },

            });

            // 🐞 FIX: No need to reverse here. CSS will handle the order.

            setMessages(Array.isArray(response.data?.data) ? response.data.data : []);

        } catch (error) {

            console.error('Error fetching messages:', error);

            setError("Failed to load messages.");

        }

    };



    useEffect(() => {

        const fetchData = async () => {

            if (!user) {

                setLoading(false);

                return;

            }



            try {

                if (user.role === 'patient') {

                    await fetchDoctors();

                } else if (user.role === 'doctor') {

                    await fetchConversations();

                }

            } catch (err) {

                if (err.response && err.response.data && err.response.data.message) {

                    setError(err.response.data.message);

                } else {

                    setError("Failed to load data. Please check your network connection.");

                }

                console.error("Error fetching data:", err);

            } finally {

                setLoading(false);

            }

        };

        fetchData();

    }, [user]);



    useEffect(() => {

        if (socket && user?._id) {

            socket.emit('register', user._id);



            const handleReceiveMessage = (message) => {

                setMessages((prevMessages) => {

                    // Prevent adding duplicates

                    if (!prevMessages.find(msg => msg._id === message._id)) {

                        return [...prevMessages, message];

                    }

                    return prevMessages;

                });

            };

           

            // 🐞 FIX: New handler for message deletion

            const handleDeleteUpdate = (messageId) => {

                setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));

            };



            socket.on('receiveMessage', handleReceiveMessage);

            socket.on('messageDeleted', handleDeleteUpdate);



            return () => {

                socket.off('receiveMessage', handleReceiveMessage);

                socket.off('messageDeleted', handleDeleteUpdate);

            };

        }

    }, [socket, user]);



    // 🐞 FIX: Auto-scroll to the bottom when messages update

    useEffect(() => {

        if (messagesEndRef.current) {

            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });

        }

    }, [messages]);



    const handleSelectConversation = async (conv) => {

        setSelectedConversation(conv);

        await fetchMessages(conv._id);

    };



    const handleSelectDoctor = async (doctor) => {

        try {

            const token = localStorage.getItem('token');

            const response = await axios.post(

                'http://localhost:5000/api/chat/conversations',

                { recipientId: doctor._id },

                { headers: { Authorization: `Bearer ${token}` } }

            );



            const conv = response.data.data;

            setSelectedConversation(conv);

            await fetchMessages(conv._id);

        } catch (error) {

            console.error('Error starting conversation:', error);

            setError("Failed to start a new conversation.");

        }

    };



    const handleSendMessage = async (e) => {

        e.preventDefault();

        if (!newMessage.trim() || !selectedConversation) return;



        const messageData = {

            conversationId: selectedConversation._id,

            // 🐞 FIX: Get senderId from authenticated user

            senderId: user._id,

            text: newMessage,

        };



        try {

            // Post the message to the database via API

            const token = localStorage.getItem('token');

            const response = await axios.post('http://localhost:5000/api/chat/messages', messageData, {

                headers: { Authorization: `Bearer ${token}` },

            });

            const savedMessage = response.data.data;



            // ✅ FIX: No local state update here. The socket event will handle the UI update.

            // This prevents the message from appearing twice on the sender's side.



            setNewMessage('');



        } catch (error) {

            console.error('Error sending message:', error);

            setError('Failed to send message.');

        }

    };



    // 🐞 FIX: New function to handle message deletion

    const handleDeleteMessage = async (messageId) => {

        if (window.confirm("Are you sure you want to delete this message?")) {

            try {

                const token = localStorage.getItem('token');

                await axios.delete(`http://localhost:5000/api/chat/messages/${messageId}`, {

                    headers: { Authorization: `Bearer ${token}` },

                });

               

                // Emit socket event to notify other users of the deletion

                socket.emit('deleteMessage', messageId);



            } catch (error) {

                console.error('Error deleting message:', error);

                setError('Failed to delete message.');

            }

        }

    };



    const renderPatientView = () => (

        <div className="conversation-list">

            <h2>Doctors</h2>

            {doctors && doctors.length > 0 ? (

                doctors.map((doctor) => (

                    <div

                        key={doctor._id}

                        className={`conversation-item`}

                        onClick={() => handleSelectDoctor(doctor)}

                    >

                        <div className="conversation-item-info">

                            <h3>Dr. {doctor.name}</h3>

                            <p className="last-message">{doctor.specialization}</p>

                        </div>

                    </div>

                ))

            ) : (

                <p className="no-data">No doctors found.</p>

            )}

        </div>

    );



    const renderDoctorView = () => (

        <div className="conversation-list">

            <h2>Patients</h2>

            {conversations && conversations.length > 0 ? (

                conversations.map((conv) => {

                    const patient = conv.participants.find((p) => p.role === 'patient');

                    if (!patient) return null;

                    return (

                        <div

                            key={conv._id}

                            className={`conversation-item ${

                                selectedConversation?._id === conv._id ? 'active' : ''

                            }`}

                            onClick={() => handleSelectConversation(conv)}

                        >

                            <div className="conversation-item-info">

                                <h3>{patient.name}</h3>

                            </div>

                        </div>

                    );

                })

            ) : (

                <p className="no-data">No conversations yet.</p>

            )}

        </div>

    );



    const renderChatWindow = () => {

        if (!selectedConversation) {

            return (

                <div className="chat-window empty-chat-window">

                    <p>Select a {user.role === 'patient' ? 'doctor' : 'patient'} to start chatting.</p>

                </div>

            );

        }



        const otherUser = selectedConversation.participants.find(p => p._id !== user._id);

        if (!otherUser) {

            return (

                <div className="chat-window empty-chat-window">

                    <p>Conversation partner not found.</p>

                </div>

            );

        }



        return (

            <div className="chat-window">

                <div className="chat-header">

                    <h3>{otherUser.name}</h3>

                </div>

                {/* 🐞 FIX: Added scrollable container */}

                <div className="chat-messages-container">

                    <div className="chat-messages">

                        {messages && messages.length > 0 ? (

                            messages.map((message) => (

                                <div

                                    key={message._id}

                                    className={`message-bubble ${message.sender._id === user._id ? 'sent' : 'received'}`}

                                >

                                    <div className="message-content">

                                        {message.text}

                                    </div>

                                    {/* 🐞 FIX: Add delete button */}

                                    {message.sender._id === user._id && (

                                        <div className="message-actions">

                                            <button onClick={() => handleDeleteMessage(message._id)} className="delete-btn">

                                                <FaTrash />

                                            </button>

                                        </div>

                                    )}

                                </div>

                            ))

                        ) : (

                            <p className="no-data">Start the conversation!</p>

                        )}

                        <div ref={messagesEndRef} />

                    </div>

                </div>

                <form className="message-input-area" onSubmit={handleSendMessage}>

                    <input

                        type="text"

                        className="message-input"

                        placeholder="Type a message..."

                        value={newMessage}

                        onChange={(e) => setNewMessage(e.target.value)}

                    />

                    <button type="submit" className="send-btn">

                        <FaPaperPlane />

                    </button>

                </form>

            </div>

        );

    };



    if (loading) {

        return <div className="chat-container">Loading...</div>;

    }



    if (error) {

        return <div className="chat-container">{error}</div>;

    }



    return (

        <div className="chat-container">

            <div className="chat-page-layout">

                {user?.role === 'patient' ? renderPatientView() : renderDoctorView()}

                {renderChatWindow()}

            </div>

        </div>

    );

};



export default PatientDoctorChat;