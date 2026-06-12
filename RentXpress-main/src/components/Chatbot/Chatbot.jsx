import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const COOLDOWN_SECONDS = 5; // Minimum seconds between messages

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! 👋 I am your Rahi Travels assistant.\n\nAsk me about available cars, pricing, routes, or how to book a trip!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful travel assistant for Rahi Travels / Ayodhya Darshan Express.');
  const [activeApiKey, setActiveApiKey] = useState(
    import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyALI9A1ey1SkRct8do6KW_WCbn4hzYQDl0'
  );
  const messagesEndRef = useRef(null);
  const cooldownRef = useRef(null);

  // Fetch the most recently added API key from Firestore
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const q = query(collection(db, 'api_keys'), orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const keyData = snapshot.docs[0].data();
          if (keyData.value) {
            setActiveApiKey(keyData.value);
          }
        }
      } catch (err) {
        console.log('Using default API key (could not fetch from DB)');
      }
    };
    fetchApiKey();
  }, []);

  // Fetch cars to build the dynamic system prompt
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cars'));
        const carsData = snapshot.docs.map(doc => doc.data());
        let prompt = `You are a friendly and helpful customer support agent for Rahi Travels (also known as Ayodhya Darshan Express). 
Your goal is to assist customers with car rentals, travel packages, and general inquiries. Be polite, professional, and concise.
Always respond in the same language the user writes in (Hindi or English).
Here is the current list of available cars and pricing from our database:\n\n`;
        
        carsData.forEach(car => {
          prompt += `- ${car.name} (${car.category || 'Standard'}, ${car.seats || '5'} seats, ${car.fuelType || 'Petrol'}): `;
          if (car.pricePerKm) prompt += `${car.pricePerKm} `;
          if (car.features && Array.isArray(car.features)) prompt += `[Features: ${car.features.join(', ')}] `;
          prompt += '\n';
        });

        prompt += `\nServices offered: Outstation Trips, Local Sightseeing, Airport Transfers, Ayodhya Darshan Packages.
Contact: WhatsApp at +919194230030.
If a user asks to book, tell them to click the 'Book Now' or 'View Details' buttons on the website, or contact us on WhatsApp.
Keep your answers short and helpful. Do not make up prices or details not in the list above.`;
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

  // Cooldown countdown timer
  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(cooldownRef.current);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || cooldown > 0) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
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
        ],
        generationConfig: {
          maxOutputTokens: 400,
          temperature: 0.7
        }
      };

      const apiKey = activeApiKey;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (response.status === 429) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: 'I am a bit busy right now due to high traffic. Please wait a few seconds and try again! 🙏' 
        }]);
      } else if (data.candidates && data.candidates.length > 0) {
        const botResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
        startCooldown(); // Only start cooldown on success
      } else {
        console.error("Gemini Error:", data);
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: 'Sorry, I could not process that. Please try rephrasing your question.' 
        }]);
      }
    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Sorry, I am having trouble connecting right now. Please try again in a moment.' 
      }]);
    }
    
    setIsLoading(false);
  };

  const isSendDisabled = isLoading || cooldown > 0 || !input.trim();

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <i className="ri-robot-2-line"></i>
              <div>
                <h3>Rahi AI</h3>
                <span className="chatbot-status">Online — ask me anything</span>
              </div>
            </div>
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
              placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : 'Ask about cars, pricing, routes...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || cooldown > 0}
            />
            <button type="submit" disabled={isSendDisabled}>
              {cooldown > 0 
                ? <span className="cooldown-text">{cooldown}s</span>
                : <i className="ri-send-plane-fill"></i>
              }
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
