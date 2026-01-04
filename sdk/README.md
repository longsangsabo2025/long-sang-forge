# 🧠 Long Sang Brain SDK

Sử dụng AI Brain với 240+ knowledge documents từ bất kỳ ứng dụng nào.

## 🚀 Quick Start

### 1. Copy SDK vào project của bạn

```bash
# Copy file SDK
cp sdk/longsang-brain-sdk.js your-project/lib/
# Hoặc TypeScript
cp sdk/longsang-brain-sdk.ts your-project/lib/
```

### 2. Sử dụng

```javascript
const LongSangBrain = require("./lib/longsang-brain-sdk");

// Khởi tạo
const brain = new LongSangBrain();

// Hỏi AI
const response = await brain.ask("Long Sang có thể giúp tôi làm website không?");
console.log(response.answer);
// "Chào bạn! Long Sang có thể giúp bạn thiết kế website chuyên nghiệp..."
```

## 📚 API Reference

### `new LongSangBrain(options?)`

Tạo instance mới.

```javascript
const brain = new LongSangBrain({
  customerInfo: {
    name: "Nguyễn Văn A",
    company: "ABC Corp",
    phone: "0901234567",
  },
});
```

### `brain.ask(question)`

Hỏi AI với context từ knowledge base.

```javascript
const response = await brain.ask('Giá thiết kế website bao nhiêu?');

// Response:
{
  answer: "Giá thiết kế website tại Long Sang từ 5-15 triệu...",
  intent: "pricing",
  suggestedActions: [
    { label: "Báo giá", action: "/#contact", type: "link" }
  ],
  usage: {
    promptTokens: 1500,
    completionTokens: 200,
    totalTokens: 1700,
    costUSD: 0.0003
  }
}
```

### `brain.search(query, limit?)`

Tìm kiếm semantic trong knowledge base.

```javascript
const results = await brain.search("AI chatbot", 5);
// [{ id, title, content, similarity: 0.85 }, ...]
```

### `brain.getCategories()`

Lấy danh sách categories.

```javascript
const categories = await brain.getCategories();
// ['ai', 'business', 'self-improvement', 'philosophy', ...]
```

### `brain.getByCategory(category, limit?)`

Lấy documents theo category.

```javascript
const aiDocs = await brain.getByCategory("ai", 10);
```

### `brain.clearHistory()`

Reset conversation history.

### `brain.setCustomer(info)`

Set thông tin khách hàng.

## 💡 Use Cases

### 1. Chatbot cho website khác

```javascript
// pages/api/chat.js (Next.js)
import LongSangBrain from "@/lib/longsang-brain-sdk";

const brain = new LongSangBrain();

export default async function handler(req, res) {
  const { message } = req.body;
  const response = await brain.ask(message);
  res.json(response);
}
```

### 2. Search engine

```javascript
// Tìm kiếm trong knowledge base
const results = await brain.search("cách tăng năng suất");

results.forEach((doc) => {
  console.log(`📄 ${doc.title} (${Math.round(doc.similarity * 100)}% match)`);
});
```

### 3. RAG (Retrieval Augmented Generation)

```javascript
// Lấy context từ brain, dùng với model riêng của bạn
const context = await brain.search("thiết kế UX/UI", 3);
const contextText = context.map((d) => d.content).join("\n\n");

// Sử dụng với OpenAI/Claude của bạn
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: `Context: ${contextText}` },
    { role: "user", content: userQuestion },
  ],
});
```

### 4. Mobile App (React Native)

```javascript
import LongSangBrain from "./longsang-brain-sdk";

const brain = new LongSangBrain({
  customerInfo: { userId: user.id },
});

const handleSend = async (message) => {
  const response = await brain.ask(message);
  addMessage({ text: response.answer, isBot: true });
};
```

## 🔒 Security Notes

- SDK sử dụng **anon key** (public) nên an toàn để dùng ở frontend
- Không expose service_role key
- Rate limit: ~100 requests/minute

## 📊 Knowledge Base Stats

- **240+ documents**
- Categories: AI, Business, Self-improvement, Philosophy, Finance, Productivity
- Sources: YouTube transcripts, Long Sang docs, curated content
- Updated: Weekly

## 🆘 Support

- Website: [longsang.org](https://longsang.org)
- Email: contact@longsang.org
- GitHub: Issues tab
