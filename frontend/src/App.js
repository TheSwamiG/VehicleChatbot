import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [question, setQuestion] = useState('');
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [backendStatus, setBackendStatus] = useState('checking');
    const chatboxRef = useRef(null);

    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [chat]);

    useEffect(() => {
        const checkBackendStatus = async () => {
            try {
                const response = await axios.get('https://vehiclechatbot.onrender.com/health');
                console.log('Backend health check:', response.data);
                setBackendStatus('connected');
                setError(null);
            } catch (err) {
                console.error('Backend connection failed:', err);
                setBackendStatus('disconnected');
                setError('Cannot connect to backend server. Please make sure it is running on port 8000.');
            }
        };

        checkBackendStatus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim()) return;

        const userMsg = { sender: 'You', message: question };
        setChat([...chat, userMsg]);
        setError(null);
        setLoading(true);

        try {
            const updatedHistory = [
                ...chatHistory,
                { role: "user", parts: [{ text: question }] }
            ];

            const res = await axios.post('https://vehiclechatbot.onrender.com/gemini', {
                history: updatedHistory,
                message: question
            });

            const botMsg = { sender: 'Bot', message: res.data };
            setChat((prev) => [...prev, botMsg]);

            setChatHistory([
                ...updatedHistory,
                { role: "model", parts: [{ text: res.data }] }
            ]);

        } catch (err) {
            console.error('Error:', err);

            let errorMessage = 'Error fetching response';
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
                if (err.response.data.details) {
                    errorMessage += `: ${err.response.data.details}`;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setChat((prev) => [...prev, { sender: 'Bot', message: 'Error fetching response' }]);
        } finally {
            setLoading(false);
            setQuestion('');
        }
    };

    const handleClearChat = () => {
        setChat([]);
        setChatHistory([]);
    };

    return (
        <div className="chatbot-container">
            <header className="chatbot-header">
                <h1>Vehicle Chatbot</h1>
                <div className={`status-indicator ${backendStatus}`}>
                    {backendStatus === 'checking' ? 'Checking Connection...' :
                        backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </div>
            </header>

            <div className="chatbox" ref={chatboxRef}>
                {chat.length === 0 && (
                    <div className="welcome-message">
                        Ask questions about vehicles in our database!
                    </div>
                )}

                {chat.map((msg, i) => (
                    <div key={i} className={`chat-message ${msg.sender.toLowerCase()}`}>
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}

                {loading && (
                    <div className="chat-message bot loading">
                        <strong>Bot:</strong> Thinking...
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="controls">
                <form className="chat-input-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Ask about vehicles..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={loading || backendStatus !== 'connected'}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={loading || backendStatus !== 'connected'}
                    >
                        Send
                    </button>
                </form>

                {chat.length > 0 && (
                    <button
                        className="clear-button"
                        onClick={handleClearChat}
                        disabled={loading}
                    >
                        Clear Chat
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;
