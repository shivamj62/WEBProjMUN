'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';

const EmailJSDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [testResult, setTestResult] = useState('');

  const checkConfiguration = () => {
    const info = {
      'Public Key': process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'Missing',
      'Service ID': process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'Missing',
      'Template ID': process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'Missing',
      'EmailJS Library': typeof emailjs !== 'undefined' ? 'Loaded' : 'Not Loaded'
    };
    
    setDebugInfo(JSON.stringify(info, null, 2));
  };

  const testEmailJS = async () => {
    setTestResult('Testing...');
    
    try {
      // Initialize EmailJS
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
      
      // Send test email
      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          from_name: 'Test User',
          from_email: 'test@example.com',
          subject: 'Test Subject',
          message: 'This is a test message to verify EmailJS integration.'
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      
      setTestResult(`✅ Success: ${result.text}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error.message || error.text || JSON.stringify(error)}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>EmailJS Debug Panel</h2>
      
      <button 
        onClick={checkConfiguration}
        style={{ 
          padding: '10px 20px', 
          margin: '10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Check Configuration
      </button>
      
      <button 
        onClick={testEmailJS}
        style={{ 
          padding: '10px 20px', 
          margin: '10px', 
          backgroundColor: '#28a745', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Test Email Send
      </button>
      
      {debugInfo && (
        <div>
          <h3>Configuration:</h3>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
            {debugInfo}
          </pre>
        </div>
      )}
      
      {testResult && (
        <div>
          <h3>Test Result:</h3>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EmailJSDebug;
