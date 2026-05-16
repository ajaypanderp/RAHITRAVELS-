import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #ddd', padding: '15px 0' }}>
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && <p style={{ marginTop: '10px', color: '#555', lineHeight: '1.5' }}>{answer}</p>}
    </div>
  );
};

export const FAQ = () => {
  const faqs = [
    {
      question: "What documents do I need to rent a car?",
      answer: "You will only need your Aadhar card for verification."
    },
    {
      question: "Is fuel included in the rental price?",
      answer: "Yes, fuel is included in the price of the car."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Your money will be returned between 7 to 15 days in case of cancellation."
    },
    {
      question: "Are there any extra charges for outstation travel?",
      answer: "For outside the state, customers have to pay toll, border tax, parking, and driver night charges."
    },
    {
      question: "What is the minimum age to rent a car?",
      answer: "Anyone can book our cars, there is no age limit."
    }
  ];

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '30px', textAlign: 'center' }}>Frequently Asked Questions</h1>
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};
