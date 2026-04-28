import React from 'react';

export const Terms = () => {
  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>Terms & Conditions</h1>
      <p style={{ fontSize: '1rem', color: '#555', marginBottom: '20px' }}>Last updated: {new Date().getFullYear()}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#444', lineHeight: '1.6' }}>
        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>1. General Terms</h3>
          <p>By booking a vehicle through Rahi Travels, you agree to abide by these terms and conditions. The rented vehicle must only be used for lawful purposes and driven responsibly.</p>
        </section>

        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>2. Booking & Cancellation</h3>
          <p>All bookings are subject to availability. Cancellations made within 24 hours of the scheduled pickup time may incur a cancellation fee.</p>
        </section>

        <section style={{ padding: '15px', background: '#fee2e2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
          <h3 style={{ color: '#b91c1c', marginBottom: '10px' }}>3. Vehicle Damage & Liability</h3>
          <p><strong>IMPORTANT:</strong> If any part of the car is broken, damaged, or severely scratched by the customer during the rental period, the customer will be held fully liable for the payment and maintenance of the repair costs. Rahi Travels reserves the right to charge the repair amount directly to the customer.</p>
        </section>

        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>4. Traffic Violations</h3>
          <p>The customer is responsible for paying all tolls, parking fees, and traffic fines incurred during the rental period.</p>
        </section>

        <section>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>5. Return Policy</h3>
          <p>The vehicle must be returned at the agreed date and time. Late returns without prior notice may result in additional hourly or daily charges.</p>
        </section>
      </div>
    </div>
  );
};
