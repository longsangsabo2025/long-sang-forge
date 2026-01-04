/**
 * BRAIN KNOWLEDGE IMPORT - Mental Health & Psychology
 */

const config = require("./_config.cjs");

config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

const USER_ID = config.DEFAULT_USER_ID;
const supabase = config.getSupabaseClient();
const openai = config.getOpenAIClient();

const ARTICLES = [
  // === MENTAL HEALTH ===
  {
    title: "Anxiety Disorders - Hiểu và vượt qua lo âu",
    category: "mental-health",
    content: `
## Rối loạn lo âu - Anxiety Disorders

### Các loại rối loạn lo âu:

#### 1. Generalized Anxiety Disorder (GAD)
- Lo lắng quá mức về nhiều thứ
- Khó kiểm soát
- Kéo dài >6 tháng
- Triệu chứng: căng cơ, mất ngủ, khó tập trung

#### 2. Social Anxiety Disorder
- Sợ bị đánh giá, phán xét
- Tránh né các tình huống xã hội
- Ảnh hưởng công việc, quan hệ

#### 3. Panic Disorder
- Cơn hoảng loạn đột ngột
- Tim đập nhanh, khó thở, đổ mồ hôi
- Sợ "sắp chết" hoặc "mất kiểm soát"

#### 4. Phobias
- Sợ cụ thể một đối tượng/tình huống
- Phản ứng không tương xứng với nguy hiểm thực tế

### Cơ chế sinh học:
- **Amygdala** quá hoạt động
- Mất cân bằng GABA, Serotonin
- HPA axis rối loạn → Cortisol cao

### Phương pháp điều trị:

#### CBT (Cognitive Behavioral Therapy)
1. Nhận diện suy nghĩ lo âu
2. Thách thức niềm tin phi lý
3. Thay đổi hành vi tránh né
4. Exposure therapy dần dần

#### Kỹ thuật tự giúp:
- **Grounding 5-4-3-2-1**: 5 thứ thấy, 4 nghe, 3 chạm, 2 ngửi, 1 nếm
- **Box breathing**: 4s hít - 4s giữ - 4s thở - 4s giữ
- **Progressive muscle relaxation**
- **Journaling** suy nghĩ lo âu

#### Lifestyle:
- Tập thể dục đều đặn
- Giảm caffeine
- Ngủ đủ giấc
- Hạn chế alcohol
- Thiền định
`,
  },
  {
    title: "Depression - Trầm cảm: Nhận biết và điều trị",
    category: "mental-health",
    content: `
## Trầm cảm - Depression

### Triệu chứng chính (DSM-5):
Ít nhất 5 triệu chứng trong 2 tuần:
1. Tâm trạng buồn hầu hết thời gian
2. Mất hứng thú với hoạt động yêu thích
3. Thay đổi cân nặng/khẩu vị
4. Mất ngủ hoặc ngủ quá nhiều
5. Chậm chạp hoặc kích động
6. Mệt mỏi, mất năng lượng
7. Cảm giác vô dụng, tội lỗi
8. Khó tập trung, ra quyết định
9. Suy nghĩ về cái chết

### Các loại trầm cảm:
- **Major Depressive Disorder**: Nặng, ảnh hưởng chức năng
- **Persistent Depressive Disorder**: Nhẹ hơn nhưng kéo dài >2 năm
- **Seasonal Affective Disorder**: Theo mùa (thường mùa đông)
- **Postpartum Depression**: Sau sinh

### Nguyên nhân:
- **Sinh học**: Di truyền, mất cân bằng neurotransmitter
- **Tâm lý**: Lối suy nghĩ tiêu cực, trauma
- **Xã hội**: Cô lập, stress, mất mát

### Điều trị:

#### Tâm lý trị liệu:
- **CBT**: Thay đổi suy nghĩ và hành vi
- **IPT**: Cải thiện quan hệ xã hội
- **Behavioral Activation**: Tăng hoạt động tích cực

#### Thuốc (khi cần):
- SSRIs: Fluoxetine, Sertraline
- SNRIs: Venlafaxine, Duloxetine
- Cần 2-4 tuần để có tác dụng

#### Self-care:
- Vận động - "nature's antidepressant"
- Ánh sáng mặt trời
- Kết nối xã hội
- Routine hàng ngày
- Tránh alcohol
- Đặt mục tiêu nhỏ, thực tế
`,
  },
  {
    title: "PTSD - Rối loạn stress sau sang chấn",
    category: "mental-health",
    content: `
## PTSD - Post-Traumatic Stress Disorder

### Định nghĩa:
Rối loạn phát triển sau khi trải qua hoặc chứng kiến sự kiện đe dọa tính mạng, nghiêm trọng.

### 4 nhóm triệu chứng chính:

#### 1. Intrusion (Xâm nhập)
- Flashbacks - hồi tưởng sống động
- Ác mộng về sự kiện
- Distress khi nhớ lại

#### 2. Avoidance (Tránh né)
- Tránh người, nơi, hoạt động gợi nhớ
- Không muốn nói về trauma
- Tê liệt cảm xúc

#### 3. Negative Cognition/Mood
- Suy nghĩ tiêu cực về bản thân, thế giới
- Tự trách, xấu hổ
- Mất hứng thú
- Cảm giác tách rời khỏi người khác

#### 4. Hyperarousal (Tăng kích thích)
- Dễ giật mình
- Khó ngủ
- Cáu gắt
- Hypervigilance - cảnh giác cao độ
- Khó tập trung

### Điều trị hiệu quả:

#### Trauma-Focused CBT
- Processing trauma narrative
- Cognitive restructuring
- In-vivo exposure

#### EMDR (Eye Movement Desensitization)
- Xử lý ký ức bằng chuyển động mắt
- Giúp não "tiêu hóa" trauma

#### Prolonged Exposure
- Đối mặt dần với ký ức và triggers
- Giảm phản ứng sợ hãi

### Hỗ trợ người thân:
- Lắng nghe không phán xét
- Kiên nhẫn với quá trình hồi phục
- Khuyến khích tìm giúp đỡ chuyên môn
- Tự chăm sóc bản thân
`,
  },
  {
    title: "Attachment Theory - Lý thuyết gắn bó",
    category: "psychology",
    content: `
## Attachment Theory - John Bowlby & Mary Ainsworth

### 4 kiểu gắn bó (Attachment Styles):

#### 1. Secure Attachment (An toàn) ~55%
**Hình thành**: Caregiver nhạy cảm, đáp ứng nhất quán
**Đặc điểm người lớn**:
- Thoải mái với intimacy
- Tin tưởng người khác
- Độc lập nhưng có thể phụ thuộc
- Giao tiếp cảm xúc tốt

#### 2. Anxious Attachment (Lo âu) ~20%
**Hình thành**: Caregiver không nhất quán
**Đặc điểm**:
- Sợ bị bỏ rơi
- Cần nhiều reassurance
- Nhạy cảm với rejection
- "Clingy" trong quan hệ
- Overthinking về quan hệ

#### 3. Avoidant Attachment (Né tránh) ~25%
**Hình thành**: Caregiver xa cách, không đáp ứng cảm xúc
**Đặc điểm**:
- Khó intimate
- Quá độc lập
- Khó biểu đạt cảm xúc
- Rút lui khi gần gũi
- "I don't need anyone"

#### 4. Disorganized Attachment (Hỗn loạn) ~5%
**Hình thành**: Caregiver gây sợ hãi hoặc trauma
**Đặc điểm**:
- Vừa muốn gần vừa sợ
- Khó điều hòa cảm xúc
- Hành vi không nhất quán

### Thay đổi attachment style:
1. **Nhận thức** pattern của mình
2. **Therapy** - đặc biệt attachment-focused
3. **Earned secure attachment** qua quan hệ lành mạnh
4. **Self-compassion** và healing inner child
5. **Communicate** nhu cầu rõ ràng

### Trong quan hệ:
- Anxious + Avoidant = "Anxious-avoidant trap"
- Secure có thể giúp partner trở nên secure hơn
- Cả hai có thể làm việc để chữa lành
`,
  },
  {
    title: "Cognitive Distortions - Bẫy suy nghĩ",
    category: "psychology",
    content: `
## Cognitive Distortions - Méo mó nhận thức

### 15 bẫy suy nghĩ phổ biến:

#### 1. All-or-Nothing Thinking
"Nếu không hoàn hảo thì thất bại"
→ Thực tế có nhiều sắc thái xám

#### 2. Overgeneralization
Một sự việc xấu → "Luôn luôn như vậy"
→ Từ cụ thể sang phổ quát

#### 3. Mental Filter
Chỉ thấy điều tiêu cực, bỏ qua tích cực
→ Lọc thông tin một chiều

#### 4. Disqualifying the Positive
"Họ khen chỉ vì lịch sự thôi"
→ Bác bỏ điều tốt

#### 5. Jumping to Conclusions
- Mind reading: "Họ nghĩ tôi ngu"
- Fortune telling: "Chắc chắn sẽ thất bại"

#### 6. Magnification/Minimization
Phóng đại tiêu cực, thu nhỏ tích cực

#### 7. Emotional Reasoning
"Tôi cảm thấy vô dụng → Tôi là người vô dụng"
→ Cảm xúc ≠ Sự thật

#### 8. Should Statements
"Tôi phải...", "Họ nên..."
→ Tạo áp lực không cần thiết

#### 9. Labeling
"Tôi là kẻ thất bại" thay vì "Tôi đã thất bại lần này"

#### 10. Personalization
Tự trách mình cho mọi thứ không liên quan

### Cách challenge:

1. **Nhận diện** distortion
2. **Evidence**: Bằng chứng cho và chống?
3. **Alternative**: Cách giải thích khác?
4. **Realistic**: Suy nghĩ cân bằng hơn là gì?
5. **Action**: Nếu là sự thật, có thể làm gì?

### Ví dụ practice:
Distortion: "Mọi người đều ghét tôi"
Challenge:
- Bằng chứng? A và B vẫn hay rủ đi chơi
- Alternative? Có thể họ đang bận
- Realistic: "Một số người thích tôi, một số không"
`,
  },
  {
    title: "Emotional Intelligence - Trí tuệ cảm xúc",
    category: "psychology",
    content: `
## Emotional Intelligence (EQ) - Daniel Goleman

### 5 thành phần của EQ:

#### 1. Self-Awareness (Tự nhận thức)
- Nhận biết cảm xúc của mình
- Hiểu tác động của cảm xúc
- Biết điểm mạnh, yếu
- Tự tin dựa trên thực tế

**Phát triển**:
- Journaling cảm xúc
- Mindfulness
- Feedback từ người khác
- Pause và reflect

#### 2. Self-Regulation (Tự điều chỉnh)
- Kiểm soát xung động
- Quản lý cảm xúc tiêu cực
- Thích nghi với thay đổi
- Giữ cam kết

**Phát triển**:
- Breathing techniques
- Count to 10
- Physical exercise
- Identify triggers

#### 3. Motivation (Động lực)
- Đam mê công việc vượt xa tiền bạc
- Lạc quan trước thất bại
- Cam kết với mục tiêu
- Chủ động

**Phát triển**:
- Xác định "Why" của mình
- Celebrate small wins
- Growth mindset
- Visualize success

#### 4. Empathy (Đồng cảm)
- Hiểu cảm xúc người khác
- Lắng nghe tích cực
- Đánh giá đúng nhu cầu người khác
- Nhạy cảm văn hóa

**Phát triển**:
- Active listening
- Perspective-taking
- Observe body language
- Ask open questions

#### 5. Social Skills (Kỹ năng xã hội)
- Giao tiếp hiệu quả
- Giải quyết xung đột
- Xây dựng quan hệ
- Làm việc nhóm

**Phát triển**:
- Practice small talk
- Give genuine compliments
- Learn conflict resolution
- Network intentionally

### EQ vs IQ:
- IQ: threshold effect (~120)
- EQ: predictor of success ở mức cao
- EQ có thể học và phát triển
`,
  },
  {
    title: "Shadow Work - Làm việc với bóng tối của Jung",
    category: "psychology",
    content: `
## Shadow Work - Carl Jung

### Shadow là gì?
"Shadow" là phần tâm lý chứa những đặc điểm, ham muốn, cảm xúc mà ta:
- Kìm nén vì xấu hổ
- Từ chối vì không phù hợp xã hội
- Phóng chiếu lên người khác

### Dấu hiệu Shadow:
- **Triggers mạnh** với người/tình huống nào đó
- **Phóng chiếu**: Ghét ở người khác thứ mình cũng có
- **Hành vi lặp lại** dù biết không tốt
- **Overreaction** không tương xứng
- **Self-sabotage** khi gần thành công

### Nguồn gốc Shadow:
- Thời thơ ấu: "Con không được tức giận"
- Văn hóa: "Nam giới không khóc"
- Trauma: Kìm nén để sống sót
- Xã hội: Những gì không được chấp nhận

### Cách làm Shadow Work:

#### 1. Journaling Prompts
- Điều gì khiến tôi tức giận nhất ở người khác?
- Tôi xấu hổ về điều gì ở bản thân?
- Nếu không ai phán xét, tôi sẽ làm gì?
- Tôi hay phủ nhận điều gì về mình?

#### 2. Trigger Analysis
Khi bị trigger:
- Cảm xúc gì đang lên?
- Nhắc nhở ký ức nào?
- Nhu cầu nào không được đáp ứng?
- Phần nào của mình đang bị kích hoạt?

#### 3. Inner Child Work
- Dialogue với inner child
- Cho phép cảm xúc bị kìm nén
- Re-parenting: cho bản thân điều cần khi nhỏ

#### 4. Integration
- Chấp nhận shadow là một phần của mình
- Tìm cách biểu đạt lành mạnh
- Shadow có thể thành strength

### Lưu ý:
- Nên làm với therapist nếu trauma nặng
- Không phán xét bản thân
- Quá trình kéo dài, không vội vàng
`,
  },
  {
    title: "Boundaries - Thiết lập ranh giới lành mạnh",
    category: "mental-health",
    content: `
## Boundaries - Ranh giới cá nhân

### Boundaries là gì?
Ranh giới xác định:
- Điều bạn chấp nhận và không chấp nhận
- Trách nhiệm của bạn vs người khác
- Nơi bạn kết thúc và người khác bắt đầu

### Các loại boundaries:

#### 1. Physical Boundaries
- Không gian cá nhân
- Quyền riêng tư về cơ thể
- Nhu cầu nghỉ ngơi

#### 2. Emotional Boundaries
- Cảm xúc của ai thuộc về người đó
- Không chịu trách nhiệm cảm xúc người khác
- Quyền có cảm xúc riêng

#### 3. Time Boundaries
- Cách sử dụng thời gian
- Quyền nói "không" với yêu cầu
- Bảo vệ thời gian cho bản thân

#### 4. Digital Boundaries
- Khi nào available online
- Privacy trên mạng xã hội
- Quyền không reply ngay

### Dấu hiệu boundaries yếu:
- Luôn nói "có" dù không muốn
- Cảm thấy kiệt sức sau giao tiếp
- Người khác hay "đi quá giới hạn"
- Khó nói "không"
- Cảm thấy có lỗi khi ưu tiên bản thân

### Cách thiết lập boundaries:

#### 1. Identify your limits
- Điều gì khiến bạn uncomfortable?
- Điều gì drain năng lượng?
- Non-negotiables của bạn là gì?

#### 2. Communicate clearly
- Direct và specific
- "Tôi cần..." thay vì "Bạn nên..."
- Không cần giải thích dài dòng

#### 3. Enforce consistently
- Consequences rõ ràng
- Follow through
- Không có exceptions

#### Ví dụ ngôn ngữ:
- "Tôi không thoải mái với điều đó"
- "Tôi cần thời gian để suy nghĩ"
- "Điều đó không phù hợp với tôi"
- "Tôi hiểu bạn muốn X, nhưng tôi cần Y"

### Boundaries không phải:
- Ích kỷ
- Từ chối yêu thương
- Kiểm soát người khác
- Punishment
`,
  },
  {
    title: "Narcissism - Hiểu về rối loạn nhân cách ái kỷ",
    category: "psychology",
    content: `
## Narcissistic Personality Disorder (NPD)

### Đặc điểm chính (DSM-5):
1. Cảm giác vĩ đại về bản thân
2. Bận tâm với fantasies về thành công, quyền lực
3. Tin mình "đặc biệt", chỉ người đặc biệt mới hiểu
4. Cần ngưỡng mộ quá mức
5. Sense of entitlement
6. Khai thác người khác
7. Thiếu empathy
8. Ghen tị hoặc tin người khác ghen tị mình
9. Thái độ kiêu ngạo

### Hai loại narcissism:

#### Grandiose (Hiển nhiên)
- Tự tin quá mức
- Dominant, attention-seeking
- Aggressive khi bị thách thức

#### Vulnerable (Ẩn giấu)
- Nhạy cảm với criticism
- Hay xấu hổ
- Defensive
- Victim mentality

### Narcissistic abuse patterns:

#### Love Bombing
- Overwhelming affection ban đầu
- "You're so special"
- Quá nhanh, quá intense

#### Devaluation
- Criticism gia tăng
- Gaslighting: "You're imagining things"
- Silent treatment

#### Discard
- Bỏ rơi đột ngột
- Hoặc keep as supply

### Cách bảo vệ bản thân:

#### 1. Giữ reality check
- Journal sự việc
- Tin vào perception của mình
- Có người tin tưởng để check

#### 2. Grey Rock Method
- Boring, không reactive
- Minimal emotional response
- Không cung cấp "supply"

#### 3. Set firm boundaries
- Clear consequences
- No JADE (Justify, Argue, Defend, Explain)
- Document everything

#### 4. Seek support
- Therapist chuyên về abuse
- Support groups
- Trusted friends/family

### Recovery sau narcissistic abuse:
- Thời gian và patience
- Trauma therapy
- Rebuild self-worth
- Learn red flags
`,
  },
  {
    title: "Grief & Loss - Đau buồn và mất mát",
    category: "mental-health",
    content: `
## Grief - Quá trình đau buồn

### Các loại mất mát:
- Mất người thân
- Ly hôn, chia tay
- Mất việc
- Mất sức khỏe
- Mất identity (nghỉ hưu, empty nest)
- Mất giấc mơ, hy vọng

### 5 giai đoạn của Kübler-Ross:
(Không nhất thiết theo thứ tự)

#### 1. Denial (Phủ nhận)
- "Điều này không thể xảy ra"
- Cơ chế bảo vệ tự nhiên
- Cho phép xử lý từ từ

#### 2. Anger (Tức giận)
- Tức với người đã đi
- Tức với bản thân, Chúa, bác sĩ
- Cảm xúc che đậy nỗi đau

#### 3. Bargaining (Thương lượng)
- "Giá như tôi đã..."
- "Nếu tôi làm X, có thể..."
- Tập trung vào quá khứ

#### 4. Depression (Trầm cảm)
- Buồn sâu sắc
- Withdrawal
- Đối mặt với thực tế mất mát

#### 5. Acceptance (Chấp nhận)
- Không phải "okay" với mất mát
- Mà là sống với thực tế mới
- Tái xây dựng cuộc sống

### Grief hiện đại - Dual Process Model:
Dao động giữa:
- **Loss-oriented**: Đau buồn, nhớ thương
- **Restoration-oriented**: Xây dựng cuộc sống mới

Cả hai đều cần thiết.

### Complicated Grief:
Grief kéo dài, intense, ảnh hưởng chức năng
→ Cần hỗ trợ chuyên môn

### Cách hỗ trợ bản thân:
- Cho phép mọi cảm xúc
- Không có timeline "đúng"
- Tự chăm sóc cơ bản
- Kết nối với người khác
- Tìm ý nghĩa theo cách của mình

### Hỗ trợ người đang grief:
- Hiện diện, không cần nói nhiều
- "Tôi xin lỗi vì mất mát của bạn"
- Tránh: "Họ ở nơi tốt hơn", "Bạn sẽ vượt qua"
- Hỗ trợ cụ thể (nấu ăn, đi chợ)
- Check in sau vài tuần/tháng
`,
  },
  {
    title: "Self-Compassion - Lòng từ bi với bản thân",
    category: "psychology",
    content: `
## Self-Compassion - Kristin Neff

### 3 thành phần:

#### 1. Self-Kindness (vs Self-Judgment)
- Đối xử tốt với bản thân khi thất bại
- Như cách bạn đối xử với người bạn thân
- Không harsh, critical

#### 2. Common Humanity (vs Isolation)
- Suffering là trải nghiệm chung của con người
- "Tôi không phải người duy nhất"
- Kết nối thay vì cô lập

#### 3. Mindfulness (vs Over-identification)
- Nhận biết đau khổ mà không bị cuốn vào
- Không phóng đại hay suppress
- Quan sát với awareness

### Self-Compassion vs Self-Esteem:
- **Self-esteem**: Cần thành công, so sánh với người khác
- **Self-compassion**: Không điều kiện, trong cả thất bại

### Myths về Self-Compassion:

❌ "Sẽ làm tôi yếu đuối"
✓ Thực tế: Tăng resilience

❌ "Sẽ làm tôi lười biếng"
✓ Thực tế: Motivation lành mạnh hơn

❌ "Là ích kỷ"
✓ Thực tế: Có nhiều hơn để cho người khác

### Practices:

#### Self-Compassion Break
Khi gặp khó khăn:
1. "Đây là khoảnh khắc đau khổ" (Mindfulness)
2. "Đau khổ là một phần của cuộc sống" (Common humanity)
3. "Tôi tử tế với bản thân" (Self-kindness)

#### Compassionate Letter
Viết thư cho bản thân như viết cho người bạn đang đau khổ

#### Self-Compassion Journaling
- Điều gì khiến tôi tự phán xét?
- Tôi sẽ nói gì với bạn trong tình huống này?
- Tôi cần nghe điều gì ngay bây giờ?

#### Physical Touch
- Tay đặt lên ngực
- Ôm bản thân
- Kích hoạt parasympathetic system

### Với Inner Critic:
- Nhận diện giọng nói critical
- "Cảm ơn vì muốn bảo vệ tôi"
- Chuyển sang giọng nói từ bi
`,
  },
  {
    title: "Trauma & Healing - Sang chấn và chữa lành",
    category: "mental-health",
    content: `
## Trauma - Hiểu về sang chấn

### Trauma là gì?
Phản ứng với sự kiện overwhelming vượt quá khả năng cope của hệ thần kinh.

### Các loại trauma:

#### Acute Trauma
- Một sự kiện đơn lẻ
- Tai nạn, thiên tai, tấn công

#### Chronic Trauma
- Lặp đi lặp lại
- Abuse kéo dài, bạo lực gia đình

#### Complex Trauma (C-PTSD)
- Trauma trong quan hệ, thường từ nhỏ
- Ảnh hưởng sâu đến identity và relationships

#### Developmental Trauma
- Xảy ra trong giai đoạn phát triển
- Neglect, attachment disruption

### Phản ứng của cơ thể:
- **Fight**: Tức giận, aggressive
- **Flight**: Lo âu, muốn chạy trốn
- **Freeze**: Tê liệt, dissociation
- **Fawn**: People-pleasing, submit

### Trauma stored in body:
- Cơ thể "nhớ" trauma
- Tension patterns
- Chronic pain
- Dysregulated nervous system

### Phương pháp chữa lành:

#### Talk Therapy
- **CPT**: Xử lý ý nghĩa của trauma
- **PE**: Exposure dần dần
- **EMDR**: Reprocessing với eye movement

#### Somatic Approaches
- **Somatic Experiencing**: Giải phóng năng lượng trapped
- **Yoga**: Reconnect với body
- **Breathwork**: Regulate nervous system

#### Bottom-up vs Top-down:
- Top-down: Nói, hiểu, ý nghĩa
- Bottom-up: Body, breath, sensation

### Window of Tolerance:
- Vùng "chịu đựng được"
- Hyperarousal: quá activated
- Hypoarousal: shutdown
- Goal: mở rộng window

### Self-care khi healing:
- Grounding techniques
- Safe people và spaces
- Routine và predictability
- Gentle với bản thân
- Progress không linear
`,
  },
  {
    title: "Impostor Syndrome - Hội chứng kẻ mạo danh",
    category: "psychology",
    content: `
## Impostor Syndrome

### Định nghĩa:
Cảm giác mình là "kẻ lừa đảo" dù có thành tích thực sự. Sợ bị "bóc mẽ" rằng mình không thực sự giỏi.

### Ai hay gặp:
- High achievers
- Người mới vào môi trường mới
- Phụ nữ và minorities
- Perfectionists
- Người thông minh nhưng từng bị đánh giá thấp

### 5 types (Dr. Valerie Young):

#### 1. The Perfectionist
- Đặt mục tiêu quá cao
- Một sai sót nhỏ = thất bại
- Không bao giờ đủ tốt

#### 2. The Expert
- Cần biết mọi thứ trước khi bắt đầu
- Sợ bị hỏi điều không biết
- Liên tục học thêm, không dám apply

#### 3. The Natural Genius
- Nếu không dễ dàng = không giỏi
- Xấu hổ khi phải cố gắng
- Struggle = proof of failure

#### 4. The Soloist
- Phải tự làm một mình
- Xin giúp đỡ = yếu kém
- Không thể accept collaboration

#### 5. The Superperson
- Phải giỏi ở mọi vai trò
- Làm việc quá sức để prove
- Burn out

### Impostor Cycle:
1. Nhận task → Lo lắng
2. Over-prepare HOẶC procrastinate
3. Hoàn thành
4. Relief ngắn, sau đó dismiss
5. "May mắn" hoặc "Cố quá nhiều"
6. Lặp lại với task tiếp theo

### Cách vượt qua:

#### 1. Nhận diện pattern
- Khi nào feelings xuất hiện?
- Trigger là gì?
- Inner critic nói gì?

#### 2. Collect evidence
- Brag file: thành tích, feedback tốt
- Review regularly
- Facts vs Feelings

#### 3. Reframe
- "Tôi đang học" thay vì "Tôi không biết"
- "Mọi người đều bắt đầu ở đâu đó"
- "Cảm giác ≠ Sự thật"

#### 4. Share với người khác
- Normalize - nhiều người cũng vậy
- Nhận perspective khách quan
- Break shame cycle

#### 5. Embrace "good enough"
- Done > Perfect
- Cho phép imperfection
- Learn from mistakes
`,
  },
  {
    title: "Emotional Regulation - Điều hòa cảm xúc",
    category: "mental-health",
    content: `
## Emotional Regulation

### Tại sao quan trọng?
- Không phải loại bỏ cảm xúc
- Mà là manage để không bị overwhelm
- Respond thay vì react

### Window of Tolerance:
- **Optimal zone**: Calm, present, functional
- **Hyperarousal**: Anxiety, anger, panic
- **Hypoarousal**: Numb, dissociated, depressed

### Kỹ thuật điều hòa:

#### 1. STOP Technique
- **S**top: Dừng lại
- **T**ake a breath: Hít thở
- **O**bserve: Quan sát cảm xúc
- **P**roceed: Tiếp tục có ý thức

#### 2. Grounding (5-4-3-2-1)
- 5 thứ nhìn thấy
- 4 thứ nghe được
- 3 thứ chạm được
- 2 thứ ngửi được
- 1 thứ nếm được

#### 3. TIPP (DBT)
- **T**emperature: Nước lạnh lên mặt
- **I**ntense exercise: 10-15 phút
- **P**aced breathing: Thở chậm
- **P**aired muscle relaxation

#### 4. Opposite Action
- Cảm xúc nói làm gì?
- Làm ngược lại nếu emotion không helpful
- Ví dụ: Muốn isolate → Reach out

#### 5. Radical Acceptance
- Chấp nhận reality AS IS
- Không phải approve hay like
- "It is what it is"
- Fighting reality = thêm suffering

### Healthy vs Unhealthy Coping:

#### Healthy:
- Talk to someone
- Exercise
- Creative expression
- Journaling
- Mindfulness
- Problem-solving

#### Unhealthy:
- Substance use
- Avoidance
- Self-harm
- Aggression
- Overeating/undereating
- Excessive sleeping

### Long-term strategies:
- Regular exercise
- Sleep hygiene
- Meditation practice
- Therapy
- Social support
- Limiting stressors
- Self-care routine

### Emotional vocabulary:
Cụ thể hóa cảm xúc:
- "Buồn" → Thất vọng? Cô đơn? Đau lòng?
- "Tức" → Frustrated? Betrayed? Hurt?
- Naming = Taming
`,
  },
  {
    title: "Codependency - Đồng phụ thuộc",
    category: "psychology",
    content: `
## Codependency - Đồng phụ thuộc

### Định nghĩa:
Pattern quan hệ nơi một người hy sinh nhu cầu của mình để chăm sóc/kiểm soát người khác, thường với người có vấn đề (addiction, mental illness).

### Nguồn gốc:
- Gia đình có addiction
- Cha mẹ emotionally unavailable
- Trauma thời thơ ấu
- Được dạy cảm xúc của mình không quan trọng

### Dấu hiệu:

#### Về bản thân:
- Low self-esteem
- Khó nhận diện cảm xúc/nhu cầu của mình
- Tìm giá trị bản thân qua việc được cần
- Perfectionism
- Khó đưa ra quyết định

#### Trong quan hệ:
- People-pleasing
- Khó nói "không"
- Taking responsibility cho cảm xúc người khác
- Caretaking quá mức
- Controlling (disguised as helping)
- Ở lại quan hệ toxic

#### Boundaries:
- Weak hoặc không có
- Cảm thấy responsible cho mọi người
- Cho phép người khác vượt giới hạn
- Resentment tích tụ

### Codependent vs Healthy Helping:
| Codependent | Healthy |
|-------------|---------|
| Enabling | Supporting |
| Need to be needed | Want to help |
| Self-sacrifice | Self-care first |
| Control outcome | Respect autonomy |
| Lose yourself | Maintain identity |

### Recovery:

#### 1. Awareness
- Nhận ra patterns
- Hiểu nguồn gốc
- Không tự trách

#### 2. Focus on Self
- "What do I need?"
- Reconnect với desires
- Self-care không phải selfish

#### 3. Boundaries
- Learn to say no
- Allow others' discomfort
- Không responsible cho reactions

#### 4. Detachment with love
- Let go of outcomes
- Allow consequences
- Focus on what you can control (yourself)

#### 5. Support
- CoDA (Codependents Anonymous)
- Therapy
- Books: "Codependent No More"

### Healthy Interdependence:
- Hai người whole, chọn together
- Mutual support, không enmeshment
- Maintain individual identity
- Both needs matter
`,
  },
  {
    title: "Perfectionism - Chủ nghĩa hoàn hảo",
    category: "psychology",
    content: `
## Perfectionism - Con dao hai lưỡi

### Hai loại:

#### Adaptive Perfectionism (Lành mạnh)
- High standards + flexibility
- Enjoy the process
- Learn from mistakes
- Satisfaction when done well

#### Maladaptive Perfectionism (Có hại)
- Impossibly high standards
- Self-worth = achievement
- Fear of failure
- Never good enough
- Procrastination hoặc overworking

### 3 dimensions (Hewitt & Flett):

#### 1. Self-Oriented
- Đặt tiêu chuẩn cao cho bản thân
- Self-critical
- Can lead to anxiety, depression

#### 2. Other-Oriented
- Đặt tiêu chuẩn cao cho người khác
- Critical of others
- Relationship problems

#### 3. Socially Prescribed
- Cảm thấy người khác expect perfection
- Fear of judgment
- Shame, anxiety

### Perfectionism Paradox:
- Sợ failure → Procrastinate hoặc overwork
- Miss opportunities
- Less productive, not more
- More stressed, not better results

### Roots of Perfectionism:
- Conditional love: "You're good when you achieve"
- Critical parents
- Trauma/control need
- Cultural/social pressure
- Comparison

### Healing Perfectionism:

#### 1. Awareness
- Notice all-or-nothing thinking
- Track perfectionist thoughts
- Identify triggers

#### 2. Challenge thoughts
- "What would I tell a friend?"
- "What's the evidence this must be perfect?"
- "What's the cost of this standard?"

#### 3. Embrace imperfection
- "Done is better than perfect"
- "Good enough" is enough
- B+ work consistently > A+ rarely

#### 4. Self-compassion
- Treat yourself kindly
- Mistakes = human
- Growth > perfection

#### 5. Redefine success
- Effort and learning
- Not just outcome
- Progress over perfection

### Affirmations:
- "I am enough as I am"
- "Mistakes help me grow"
- "My worth isn't my productivity"
- "Done is better than perfect"
`,
  },
];

// ===================== HELPERS =====================
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error(`  ❌ Embedding error: ${error.message}`);
    return null;
  }
}

async function checkExists(title) {
  const { data } = await supabase
    .from("knowledge_base")
    .select("id")
    .eq("title", title)
    .maybeSingle();
  return !!data;
}

async function saveToKnowledgeBase(doc) {
  const { data, error } = await supabase.from("knowledge_base").insert(doc).select("id").single();

  if (error) {
    console.error(`  ❌ DB error: ${error.message}`);
    return null;
  }
  return data.id;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===================== MAIN =====================
async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🧠 BRAIN IMPORT - MENTAL HEALTH & PSYCHOLOGY");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < ARTICLES.length; i++) {
    const article = ARTICLES[i];
    const shortTitle =
      article.title.length > 50 ? article.title.slice(0, 50) + "..." : article.title;

    console.log(`[${i + 1}/${ARTICLES.length}] ${shortTitle}`);

    if (await checkExists(article.title)) {
      console.log(`  ⏭️ Already exists`);
      skipped++;
      continue;
    }

    console.log(`  🔢 Generating embedding...`);
    const embedding = await generateEmbedding(article.content);
    if (!embedding) {
      failed++;
      continue;
    }

    console.log(`  💾 Saving to Brain...`);
    const doc = {
      title: article.title,
      content: article.content,
      category: article.category,
      source: "psychology-guide",
      embedding,
      metadata: { type: "psychology-guide", importedAt: new Date().toISOString() },
      user_id: USER_ID,
      is_public: true,
    };

    const id = await saveToKnowledgeBase(doc);
    if (id) {
      console.log(`  ✅ SAVED!`);
      imported++;
    } else {
      failed++;
    }

    await sleep(500);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("📊 FINAL SUMMARY");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(console.error);
