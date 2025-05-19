const PORT = 8000;
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

app.use(cors());
app.use(express.json());

// Load Gemini API key
const API_KEY = process.env.API_KEY || "AIzaSyDKeIbn4fkl93kj8H5Blqx4DGJ6-HapLKY";
const genAI = new GoogleGenerativeAI(API_KEY);

// Read vehicle data
let vehicleData = '';
try {
    const vehiclesFilePath = path.join(__dirname, 'vehicles.txt');
    console.log(`Reading vehicles data from: ${vehiclesFilePath}`);
    vehicleData = fs.readFileSync(vehiclesFilePath, 'utf-8');
    console.log('Vehicle data loaded successfully');
    console.log(`Total data length: ${vehicleData.length} characters`);
    console.log('Sample data:', vehicleData.substring(0, 100) + '...');
} catch (err) {
    console.error('Error reading vehicles.txt:', err);
    vehicleData = 'No vehicle data available.';
}

// Initial system message for chat context
const systemInstruction = `You are a vehicle information assistant. Always respond based ONLY on this vehicle database information:\n\n${vehicleData}\n\nIf the information isn't in the vehicle database, say "I don't have that information in my vehicle database." Be direct and factual when answering questions.`;

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/gemini', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const message = req.body.message;
        const userHistory = req.body.history || [];

        // Format chat history for Gemini
        const formattedHistory = [
            {
                role: "user",
                parts: [{ text: systemInstruction }]
            },
            {
                role: "model",
                parts: [{ text: "I'm ready to answer questions about the vehicles in my database. What would you like to know?" }]
            },
            ...userHistory.map(item => ({
                role: item.role,
                parts: [{ text: item.parts[0].text }]
            }))
        ];

        const chat = model.startChat({ history: formattedHistory });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.send(text);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Vehicle Chatbot server running on port ${PORT}`);
});