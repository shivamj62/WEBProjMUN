# EmailJS Setup Guide

## Overview
The contact form has been integrated with EmailJS to send emails directly from the frontend without needing a backend email service.

## Configuration Status
✅ EmailJS Package Installed: `@emailjs/browser`
✅ Public Key Added to Environment Variables
⚠️ Service ID and Template ID Need Configuration

## Required Steps to Complete Setup

### 1. EmailJS Account Setup
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create an account or log in
3. Your public key is already configured: `-UiMCK4XsRkEHYBdC`

### 2. Create Email Service
1. In the EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Configure your email settings
5. Note down the **Service ID** (e.g., `service_xyz123`)

### 3. Create Email Template
1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this template structure:

```
Subject: New Contact Form Submission - {{subject}}

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
This message was sent from the KIIT MUN Society website contact form.
```

4. Template variables to include:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{subject}}` - Message subject
   - `{{message}}` - Message content

5. Note down the **Template ID** (e.g., `template_abc456`)

### 4. Update Environment Variables
Add the following to your `.env.local` file:

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=-UiMCK4XsRkEHYBdC
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
```

### 5. Update Contact Form Code
Replace the placeholder IDs in `src/app/contact/page.jsx`:

```javascript
// Replace these lines:
'YOUR_SERVICE_ID',      // Replace with process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
'YOUR_TEMPLATE_ID',     // Replace with process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
```

## Form Field Mapping
The contact form uses these EmailJS variable names:
- `from_name` → User's full name
- `from_email` → User's email address
- `subject` → Selected subject category
- `message` → User's message content

## Testing
1. Fill out the contact form on `/contact`
2. Check your configured email inbox for the message
3. Verify all form fields are populated correctly in the email

## Security Notes
- The public key is safe to expose in frontend code
- Service and Template IDs are also safe to be public
- EmailJS handles rate limiting and spam protection
- Consider adding a reCAPTCHA for additional protection

## Troubleshooting
- Ensure all environment variables are properly set
- Check EmailJS dashboard for service status
- Verify template variables match form field names
- Check browser console for any JavaScript errors
