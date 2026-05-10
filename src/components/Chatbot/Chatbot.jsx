import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am your Rahi Travels assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful travel assistant for Rahi Travels / Ayodhya Darshan Express.');
  const messagesEndRef = useRef(null);

  // Fetch cars to build the dynamic prompt
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cars'));
        const carsData = snapshot.docs.map(doc => doc.data());
        let prompt = `You are a helpful customer support agent for Rahi Travels (also known as Ayodhya Darshan Express). 
Your goal is to assist customers with car rentals, travel packages, and general inquiries. Be polite, professional, and concise.
Here is the current list of available cars and pricing from our database:\n\n`;
        
        carsData.forEach(car => {
          prompt += `- ${car.name} (${car.category || 'Standard'}): `;
          if (car.price) prompt += `₹${car.price} `;
          if (car.features) prompt += `[Features: ${car.features}] `;
          prompt += '\n';
        });

        prompt += `\nIf a user asks to book, tell them they can click the 'Book Now' or 'View Details' buttons on the website to book directly, or contact us via WhatsApp. If they ask about services, explain that we offer Outstation Trips, Local Sightseeing, and Airport Transfers.`;
        setSystemPrompt(prompt);
      } catch (err) {
        console.error("Error fetching cars for chatbot context", err);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for Gemini format
      const history = messages.slice(1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userText }] }
        ]
      };

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyALI9A1ey1SkRct8do6KW_WCbn4hzYQDl0';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const botResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
      } else {
        console.error("Gemini Error:", data);
        setMessages(prev => [...prev, { role: 'model', text: 'I am sorry, I encountered an error processing your request.' }]);
      }
    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3><i className="ri-robot-2-line"></i> Rahi AI</h3>
            <span className="online-dot"></span>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message model">
                <div className="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <i className="ri-send-plane-fill"></i>
            </button>
          </form>
        </div>
      )}

      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <i className="ri-close-line"></i> : <i className="ri-chat-3-line"></i>}
      </button>
    </div>
  );
};
