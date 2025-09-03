// EmailJS Integration Test
// Run this in browser console on the contact page to test EmailJS setup

console.log('🧪 EmailJS Configuration Test');
console.log('===============================');

// Check environment variables
console.log('Public Key:', process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
console.log('Service ID:', process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing');
console.log('Template ID:', process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Missing');

// Check for placeholder values
if (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
  console.warn('⚠️ Service ID is still placeholder value');
}

if (process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
  console.warn('⚠️ Template ID is still placeholder value');
}

// Check if EmailJS is loaded
if (typeof emailjs !== 'undefined') {
  console.log('EmailJS Library:', '✅ Loaded');
} else {
  console.log('EmailJS Library:', '❌ Not loaded');
}

console.log('===============================');
console.log('Next steps:');
console.log('1. Set up EmailJS service at https://dashboard.emailjs.com/');
console.log('2. Create email template with variables: from_name, from_email, subject, message');
console.log('3. Update .env.local with your Service ID and Template ID');
console.log('4. Test the contact form!');
