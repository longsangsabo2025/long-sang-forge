# 🧠 LONG SANG BRAIN - API & SDK DOCUMENTATION

> **Tài liệu hướng dẫn sử dụng AI Brain từ các ứng dụng khác**
>
> Cập nhật: 03/01/2026

---

## 📋 MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Cách 1: Gọi API trực tiếp](#2-cách-1-gọi-api-trực-tiếp)
3. [Cách 2: Sử dụng SDK](#3-cách-2-sử-dụng-sdk)
4. [API Reference](#4-api-reference)
5. [Use Cases & Examples](#5-use-cases--examples)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. TỔNG QUAN

### Brain là gì?

Long Sang Brain là một AI Knowledge Base chứa **240+ documents** về nhiều chủ đề:

- 🤖 AI & Technology
- 💼 Business & Entrepreneurship
- 📈 Self-improvement & Productivity
- 🧠 Philosophy & Decision Making
- 💰 Finance & Investment

### Tại sao dùng Brain?

- ✅ AI trả lời với **context từ knowledge base**
- ✅ **Semantic search** - tìm kiếm theo ý nghĩa
- ✅ **Conversation memory** - nhớ context cuộc hội thoại
- ✅ **Miễn phí** sử dụng với anon key

---

## 2. CÁCH 1: GỌI API TRỰC TIẾP

### 🔗 Endpoint

```
POST https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant
```

### 📝 Request Body

```json
{
  "userMessage": "Tôi muốn làm website bán hàng",
  "messages": [
    { "role": "user", "content": "Xin chào" },
    { "role": "assistant", "content": "Chào bạn!" }
  ],
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "company": "ABC Corp",
    "phone": "0901234567"
  }
}
```

### 📤 Response

```json
{
  "success": true,
  "response": "Chào bạn! Long Sang có thể giúp bạn thiết kế website...",
  "intent": "website",
  "suggestedActions": [{ "label": "Báo giá", "action": "/#contact", "type": "link" }],
  "usage": {
    "promptTokens": 1500,
    "completionTokens": 200,
    "totalTokens": 1700,
    "costUSD": 0.0003
  },
  "knowledge": {
    "sources": ["Long Sang Services", "Website Pricing"]
  }
}
```

### 💻 Code Examples

#### JavaScript/Node.js

```javascript
const response = await fetch(
  "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userMessage: "Tôi muốn làm website",
      messages: [],
    }),
  }
);
const data = await response.json();
console.log(data.response);
```

#### Python

```python
import requests

response = requests.post(
    'https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant',
    json={
        'userMessage': 'Tôi muốn làm website',
        'messages': []
    }
)
print(response.json()['response'])
```

#### cURL

```bash
curl -X POST "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant" \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Tôi muốn làm website", "messages": []}'
```

---

## 3. CÁCH 2: SỬ DỤNG SDK

### 📦 Cài đặt

```bash
# Copy SDK vào project của bạn
cp path/to/long-sang-forge/sdk/longsang-brain-sdk.cjs ./lib/
```

### 🚀 Quick Start

```javascript
const LongSangBrain = require("./lib/longsang-brain-sdk.cjs");

// Khởi tạo
const brain = new LongSangBrain();

// Hỏi AI
const response = await brain.ask("Long Sang có thể giúp tôi làm gì?");
console.log(response.answer);
// "Long Sang có thể giúp bạn: thiết kế website, tích hợp AI, SEO..."
```

### 🔧 Cấu hình nâng cao

```javascript
const brain = new LongSangBrain({
  customerInfo: {
    name: "Nguyễn Văn A",
    company: "ABC Corp",
    phone: "0901234567",
    email: "a@abc.com",
  },
});
```

---

## 4. API REFERENCE

### SDK Methods

| Method                       | Mô tả                        | Returns               |
| ---------------------------- | ---------------------------- | --------------------- |
| `ask(question)`              | Hỏi AI với knowledge context | `BrainResponse`       |
| `search(query, limit?)`      | Tìm kiếm semantic            | `KnowledgeDocument[]` |
| `getCategories()`            | Lấy danh sách categories     | `string[]`            |
| `getByCategory(cat, limit?)` | Lấy docs theo category       | `KnowledgeDocument[]` |
| `clearHistory()`             | Reset conversation           | `void`                |
| `setCustomer(info)`          | Set thông tin khách          | `void`                |
| `getHistory()`               | Lấy conversation history     | `Message[]`           |

### Response Types

```typescript
interface BrainResponse {
  answer: string; // Câu trả lời từ AI
  intent: string; // Intent detected (website, ai, pricing...)
  suggestedActions: Action[]; // Gợi ý hành động
  knowledge?: {
    // Knowledge sources used
    sources: string[];
  };
  usage?: {
    // Token usage
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
  };
}

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source?: string;
  category?: string;
  similarity?: number; // 0-1, relevance score
}
```

---

## 5. USE CASES & EXAMPLES

### 🤖 Chatbot cho website khác

```javascript
// pages/api/chat.js (Next.js)
import LongSangBrain from "@/lib/longsang-brain-sdk.cjs";

const brain = new LongSangBrain();

export default async function handler(req, res) {
  const { message, history } = req.body;

  // Restore history nếu có
  if (history) {
    brain.conversationHistory = history;
  }

  const response = await brain.ask(message);

  res.json({
    answer: response.answer,
    history: brain.getHistory(),
  });
}
```

### 🔍 Search Engine

```javascript
// Tìm kiếm trong knowledge base
const results = await brain.search("cách tăng năng suất làm việc", 5);

results.forEach((doc) => {
  console.log(`📄 ${doc.title}`);
  console.log(`   Match: ${Math.round(doc.similarity * 100)}%`);
  console.log(`   ${doc.content.substring(0, 100)}...`);
});
```

### 🔗 RAG (Retrieval Augmented Generation)

```javascript
// Lấy context từ Brain, dùng với model riêng của bạn
const context = await brain.search("thiết kế UX/UI", 3);
const contextText = context.map((d) => d.content).join("\n\n");

// Sử dụng với OpenAI/Claude riêng
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: `Bạn là expert. Context: ${contextText}` },
    { role: "user", content: userQuestion },
  ],
});
```

### 📱 Mobile App (React Native)

```javascript
import LongSangBrain from "./lib/longsang-brain-sdk.cjs";

const ChatScreen = () => {
  const brain = useRef(new LongSangBrain()).current;
  const [messages, setMessages] = useState([]);

  const handleSend = async (text) => {
    // Add user message
    setMessages((prev) => [...prev, { text, isUser: true }]);

    // Get AI response
    const response = await brain.ask(text);

    // Add AI message
    setMessages((prev) => [...prev, { text: response.answer, isUser: false }]);
  };

  return <ChatUI messages={messages} onSend={handleSend} />;
};
```

### 📊 Analytics Dashboard

```javascript
// Lấy tất cả categories và thống kê
const categories = await brain.getCategories();

for (const cat of categories) {
  const docs = await brain.getByCategory(cat, 100);
  console.log(`${cat}: ${docs.length} documents`);
}
```

---

## 6. TROUBLESHOOTING

### ❌ Lỗi "Module not found"

```bash
# Đảm bảo copy đúng file
cp long-sang-forge/sdk/longsang-brain-sdk.cjs ./lib/
```

### ❌ Lỗi CORS

```javascript
// Nếu gọi từ browser, cần proxy qua backend
// Frontend -> Your Backend -> Brain API
```

### ❌ Response chậm

```javascript
// Brain API có thể mất 2-5s lần đầu (cold start)
// Các request sau sẽ nhanh hơn (~1s)
```

### ❌ Không nhớ conversation

```javascript
// Đảm bảo gửi messages array
const response = await brain.ask("Giá bao nhiêu?");
// SDK tự động lưu history

// Hoặc gửi manual:
fetch(API_URL, {
  body: JSON.stringify({
    userMessage: "Giá bao nhiêu?",
    messages: previousMessages, // ← Quan trọng!
  }),
});
```

---

## 📞 SUPPORT

- **Website**: [longsang.org](https://longsang.org)
- **Email**: contact@longsang.org
- **Chat**: Sử dụng chat trên website

---

## 📁 FILE LOCATIONS

| File          | Path                                   | Mô tả             |
| ------------- | -------------------------------------- | ----------------- |
| SDK (JS)      | `sdk/longsang-brain-sdk.cjs`           | JavaScript SDK    |
| SDK (TS)      | `sdk/longsang-brain-sdk.ts`            | TypeScript SDK    |
| SDK Docs      | `sdk/README.md`                        | SDK documentation |
| This Doc      | `_DOCS/07-API/BRAIN_SDK_USAGE.md`      | Tài liệu này      |
| Edge Function | `supabase/functions/sales-consultant/` | API source code   |

---

_Tài liệu này được tạo tự động. Cập nhật lần cuối: 03/01/2026_
