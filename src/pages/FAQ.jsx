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
      answer: "You will need a valid driving license, a government-issued ID (like Aadhar or Passport), and a credit/debit card for the security deposit."
    },
    {
      question: "Is fuel included in the rental price?",
      answer: "No, fuel is not included. The car will be provided with a certain amount of fuel, and you are expected to return it with the same level."
    },
    {
      question: "What happens if the car breaks down?",
      answer: "We provide 24/7 roadside assistance. Just call our support number, and we will dispatch help or a replacement vehicle immediately."
    },
    {
      question: "Can I take the car outside the state?",
      answer: "Yes, outstation travel is allowed. However, state border taxes and toll fees are to be paid by the customer."
    },
    {
      question: "What is your cancellation policy?",
      answer: "You can cancel for free up to 24 hours before your pickup time. Cancellations made within 24 hours may be subject to a fee."
    },
    {
      question: "Are there any hidden charges?",
      answer: "No, our pricing is transparent. The total cost includes the rental fee and applicable taxes. Fuel and tolls are extra."
    },
    {
      question: "What is the minimum age to rent a car?",
      answer: "The minimum age to rent a car is 21 years. You must also have a valid driving license held for at least one year."
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
