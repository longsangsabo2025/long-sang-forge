# 🔌 TÍCH HỢP CHATWOOT VÀO WEBSITE

## 🎯 WIDGET CODE

### Basic Integration

**Add to your website (before `</body>` tag):**

```html
<script>
  (function(d,t) {
    var BASE_URL="http://localhost:3000";
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=BASE_URL+"/packs/js/sdk.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g,s);
    g.onload=function(){
      window.chatwootSDK.run({
        websiteToken: 'YOUR_WEBSITE_TOKEN',
        baseUrl: BASE_URL
      })
    }
  })(document,"script");
</script>
```

---

## 🎨 CUSTOMIZATION

### Custom Position

```javascript
window.chatwootSDK.run({
  websiteToken: 'YOUR_TOKEN',
  baseUrl: 'http://localhost:3000',
  position: 'right', // 'left' or 'right'
  type: 'standard', // 'standard' or 'expanded_bubble'
  launcherTitle: 'Chat with us!'
})
```

### Custom Colors

```javascript
window.chatwootSDK.run({
  websiteToken: 'YOUR_TOKEN',
  baseUrl: 'http://localhost:3000',
  darkMode: 'auto', // 'light', 'dark', or 'auto'
  widgetColor: '#1f93ff'
})
```

### Hide on Specific Pages

```javascript
// Hide on checkout page
if (window.location.pathname.includes('/checkout')) {
  window.chatwootSettings = {
    hideMessageBubble: true
  };
}
```

---

## 👤 USER IDENTIFICATION

### Set User Info

```javascript
window.chatwootSDK.run({
  websiteToken: 'YOUR_TOKEN',
  baseUrl: 'http://localhost:3000'
});

// Set user info
window.$chatwoot.setUser('USER_ID', {
  email: 'user@example.com',
  name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  phone_number: '+1234567890'
});
```

### Custom Attributes

```javascript
window.$chatwoot.setCustomAttributes({
  plan: 'premium',
  account_id: '12345',
  signed_up_at: '2024-01-01'
});
```

### Set Language

```javascript
window.$chatwoot.setLocale('vi'); // Vietnamese
// or 'en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko'
```

---

## 🎬 EVENTS & TRIGGERS

### Open Widget Programmatically

```javascript
// Open chat
window.$chatwoot.toggle('open');

// Close chat
window.$chatwoot.toggle('close');

// Toggle
window.$chatwoot.toggle();
```

### Listen to Events

```javascript
window.addEventListener('chatwoot:ready', function() {
  console.log('Chatwoot is ready!');
});

window.addEventListener('chatwoot:on-message', function(event) {
  console.log('New message:', event.detail);
});

window.addEventListener('chatwoot:on-unread-message', function(event) {
  console.log('Unread messages:', event.detail);
});
```

### Trigger on Button Click

```html
<button onclick="window.$chatwoot.toggle('open')">
  Chat with Support
</button>
```

---

## 🔗 REACT INTEGRATION

### Install Package

```bash
npm install @chatwoot/react
```

### Use Component

```jsx
import { ChatwootWidget } from '@chatwoot/react';

function App() {
  return (
    <div>
      <ChatwootWidget
        websiteToken="YOUR_TOKEN"
        baseUrl="http://localhost:3000"
        locale="vi"
      />
    </div>
  );
}
```

### With User Info

```jsx
<ChatwootWidget
  websiteToken="YOUR_TOKEN"
  baseUrl="http://localhost:3000"
  user={{
    email: 'user@example.com',
    name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg'
  }}
  customAttributes={{
    plan: 'premium',
    account_id: '12345'
  }}
/>
```

---

## 🎨 NEXT.JS INTEGRATION

### Create Component

```jsx
// components/ChatwootWidget.js
import { useEffect } from 'react';

export default function ChatwootWidget() {
  useEffect(() => {
    // Add Chatwoot Settings
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: 'right',
      locale: 'vi',
      type: 'standard'
    };

    // Load script
    (function(d,t) {
      var BASE_URL="http://localhost:3000";
      var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
      g.src=BASE_URL+"/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g,s);
      g.onload=function(){
        window.chatwootSDK.run({
          websiteToken: 'YOUR_TOKEN',
          baseUrl: BASE_URL
        })
      }
    })(document,"script");
  }, []);

  return null;
}
```

### Add to Layout

```jsx
// app/layout.js
import ChatwootWidget from '@/components/ChatwootWidget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatwootWidget />
      </body>
    </html>
  );
}
```

---

## 🔌 API INTEGRATION

### Send Message via API

```javascript
// Backend API call
const sendMessage = async (message) => {
  const response = await fetch('http://localhost:3000/api/v1/accounts/1/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_access_token': 'YOUR_API_TOKEN'
    },
    body: JSON.stringify({
      source_id: 'contact_id',
      inbox_id: 'inbox_id',
      message: {
        content: message
      }
    })
  });
  
  return response.json();
};
```

### Get Conversations

```javascript
const getConversations = async () => {
  const response = await fetch('http://localhost:3000/api/v1/accounts/1/conversations', {
    headers: {
      'api_access_token': 'YOUR_API_TOKEN'
    }
  });
  
  return response.json();
};
```

---

## 🎯 ADVANCED FEATURES

### Pre-Chat Form

```javascript
window.chatwootSDK.run({
  websiteToken: 'YOUR_TOKEN',
  baseUrl: 'http://localhost:3000',
  preChatFormOptions: {
    requireEmail: true,
    preChatMessage: 'Please provide your details',
    preChatFields: [
      {
        label: 'Full Name',
        name: 'fullName',
        type: 'text',
        required: true
      },
      {
        label: 'Email',
        name: 'emailAddress',
        type: 'email',
        required: true
      },
      {
        label: 'Phone',
        name: 'phoneNumber',
        type: 'text',
        required: false
      }
    ]
  }
});
```

### Business Hours

```javascript
// Show offline message outside business hours
window.chatwootSDK.run({
  websiteToken: 'YOUR_TOKEN',
  baseUrl: 'http://localhost:3000',
  showPopoutButton: true,
  businessHours: {
    enabled: true,
    timezone: 'Asia/Ho_Chi_Minh',
    schedule: {
      monday: { from: '09:00', to: '18:00' },
      tuesday: { from: '09:00', to: '18:00' },
      wednesday: { from: '09:00', to: '18:00' },
      thursday: { from: '09:00', to: '18:00' },
      friday: { from: '09:00', to: '18:00' }
    }
  }
});
```

---

## 🔒 SECURITY

### CORS Configuration

**In Chatwoot `.env`:**
```bash
# Allow your domain
FRONTEND_URL=https://yourdomain.com
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' http://localhost:3000;">
```

---

## 📱 MOBILE INTEGRATION

### React Native

```bash
npm install @chatwoot/react-native-widget
```

```jsx
import ChatwootWidget from '@chatwoot/react-native-widget';

<ChatwootWidget
  websiteToken="YOUR_TOKEN"
  baseUrl="http://localhost:3000"
  locale="vi"
  user={{
    identifier: 'user@example.com',
    name: 'John Doe'
  }}
/>
```

---

## ✅ TESTING

### Test Widget

1. Open your website
2. Look for chat bubble (bottom right)
3. Click to open chat
4. Send test message
5. Check Chatwoot dashboard

### Debug Mode

```javascript
window.chatwootSettings = {
  debug: true
};
```

---

## 🎊 COMPLETE EXAMPLE

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome!</h1>
  
  <!-- Your content -->
  
  <!-- Chatwoot Widget -->
  <script>
    (function(d,t) {
      var BASE_URL="http://localhost:3000";
      var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
      g.src=BASE_URL+"/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g,s);
      g.onload=function(){
        window.chatwootSDK.run({
          websiteToken: 'YOUR_WEBSITE_TOKEN',
          baseUrl: BASE_URL,
          locale: 'vi',
          darkMode: 'auto'
        });
        
        // Set user info if logged in
        if (window.currentUser) {
          window.$chatwoot.setUser(window.currentUser.id, {
            email: window.currentUser.email,
            name: window.currentUser.name
          });
        }
      }
    })(document,"script");
  </script>
</body>
</html>
```

---

**🎉 Done! Your website now has AI-powered customer support!**
