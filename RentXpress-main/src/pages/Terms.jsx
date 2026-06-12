import React from 'react';

export const Terms = () => {
  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>Terms & Conditions</h1>
      <p style={{ fontSize: '1rem', color: '#555', marginBottom: '20px' }}>Last updated: {new Date().getFullYear()}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#444', lineHeight: '1.6' }}>
        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>1. General Terms</h3>
          <p>By booking a travel package or service through Ayodhya Darshan Express, you agree to abide by these terms and conditions. All services must be used for lawful purposes and with respect to local customs.</p>
        </section>

        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>2. Booking & Cancellation</h3>
          <p>All bookings are subject to availability. Cancellations made within 24 hours of the scheduled service time may incur a cancellation fee.</p>
        </section>

        <section style={{ padding: '15px', background: '#fee2e2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
          <h3 style={{ color: '#b91c1c', marginBottom: '10px' }}>3. Service Liability</h3>
          <p><strong>IMPORTANT:</strong> Ayodhya Darshan Express is dedicated to providing smooth travel experiences. However, if any damage is caused to company property or vehicles by the customer during the travel period, the customer will be held fully liable for the payment and maintenance of the repair costs. We reserve the right to charge the repair amount directly to the customer.</p>
        </section>

        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>4. Additional Charges</h3>
          <p>Unless expressly included in the travel package, the customer is responsible for personal expenses, special tolls, entry fees to specific monuments, and other individual costs incurred during the travel period.</p>
        </section>

        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>5. Itinerary Policy</h3>
          <p>Travel must commence and conclude at the agreed date and time. Deviations from the scheduled itinerary without prior notice may result in additional charges.</p>
        </section>
      </div>
    </div>
  );
};
