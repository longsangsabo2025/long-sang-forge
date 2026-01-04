/**
 * BRAIN KNOWLEDGE IMPORT - Health Articles từ các nguồn uy tín
 * Import bài viết về sức khỏe, dinh dưỡng, tâm lý
 */

const config = require("./_config.cjs");

config.validate(["SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]);

const USER_ID = config.DEFAULT_USER_ID;
const supabase = config.getSupabaseClient();
const openai = config.getOpenAIClient();

// ===================== HEALTH ARTICLES =====================
const HEALTH_ARTICLES = [
  // NUTRITION
  {
    title: "Intermittent Fasting - Nhịn ăn gián đoạn: Hướng dẫn toàn diện",
    category: "health-nutrition",
    content: `
## Intermittent Fasting là gì?
Intermittent Fasting (IF) hay nhịn ăn gián đoạn là phương pháp ăn uống xen kẽ giữa thời gian ăn và nhịn ăn.

### Các phương pháp phổ biến:
1. **16:8** - Nhịn 16 giờ, ăn trong 8 giờ (phổ biến nhất)
2. **5:2** - Ăn bình thường 5 ngày, hạn chế 500-600 calo 2 ngày
3. **OMAD** - Ăn một bữa mỗi ngày
4. **24h** - Nhịn 24 giờ 1-2 lần/tuần

### Lợi ích khoa học:
- **Giảm cân**: Giảm insulin, tăng hormone đốt mỡ
- **Autophagy**: Tế bào tự làm sạch, loại bỏ protein hỏng
- **Cải thiện não bộ**: Tăng BDNF, cải thiện trí nhớ
- **Giảm viêm**: Giảm các marker viêm trong cơ thể
- **Kéo dài tuổi thọ**: Nghiên cứu trên động vật cho thấy tăng tuổi thọ

### Ai nên tránh:
- Phụ nữ mang thai/cho con bú
- Người suy dinh dưỡng
- Người có tiền sử rối loạn ăn uống
- Trẻ em và thanh thiếu niên

### Lời khuyên thực hành:
1. Bắt đầu từ từ: 12h → 14h → 16h
2. Uống đủ nước trong thời gian nhịn
3. Ăn đủ chất trong cửa sổ ăn
4. Lắng nghe cơ thể
`,
    source: "health-guide",
  },
  {
    title: "Ketogenic Diet - Chế độ ăn Keto: Khoa học và thực hành",
    category: "health-nutrition",
    content: `
## Keto Diet là gì?
Chế độ ăn ketogenic (keto) là chế độ ăn low-carb, high-fat buộc cơ thể chuyển sang đốt mỡ thay vì glucose.

### Nguyên lý hoạt động:
- Giảm carb xuống <50g/ngày
- Cơ thể vào trạng thái ketosis
- Gan chuyển mỡ thành ketone bodies
- Ketone trở thành nhiên liệu chính cho não và cơ thể

### Macros chuẩn:
- **Fat**: 70-80%
- **Protein**: 15-20%
- **Carbs**: 5-10%

### Lợi ích:
- Giảm cân nhanh, đặc biệt mỡ bụng
- Kiểm soát đường huyết tốt hơn
- Tăng năng lượng và tập trung
- Giảm cảm giác thèm ăn

### Thực phẩm nên ăn:
- Thịt, cá, trứng
- Phô mai, bơ
- Dầu olive, dầu dừa
- Rau xanh lá
- Hạt và quả bơ

### Thực phẩm tránh:
- Cơm, mì, bánh mì
- Đường và đồ ngọt
- Trái cây nhiều đường
- Khoai tây, ngô

### Lưu ý quan trọng:
- "Keto flu" có thể xảy ra tuần đầu
- Bổ sung điện giải (natri, kali, magie)
- Không phù hợp với tất cả mọi người
`,
    source: "health-guide",
  },
  {
    title: "Giấc ngủ: Khoa học về nghỉ ngơi và phục hồi",
    category: "health-science",
    content: `
## Tầm quan trọng của giấc ngủ

### Chu kỳ giấc ngủ:
1. **Stage 1**: Ngủ nhẹ (1-5 phút)
2. **Stage 2**: Ngủ sâu hơn (10-60 phút)
3. **Stage 3**: Ngủ sâu, sóng delta (20-40 phút)
4. **REM**: Giấc mơ, xử lý ký ức (10-60 phút)

Một chu kỳ hoàn chỉnh ~90 phút, lặp lại 4-6 lần/đêm.

### Lợi ích của giấc ngủ đủ:
- **Não bộ**: Loại bỏ độc tố, củng cố ký ức
- **Miễn dịch**: Tăng cường hệ miễn dịch
- **Hormone**: Điều hòa cortisol, hormone tăng trưởng
- **Tim mạch**: Giảm nguy cơ bệnh tim
- **Tinh thần**: Cân bằng cảm xúc

### Sleep Hygiene - Vệ sinh giấc ngủ:
1. **Đi ngủ và dậy cùng giờ** mỗi ngày
2. **Tránh ánh sáng xanh** trước ngủ 1-2 giờ
3. **Phòng ngủ tối, mát, yên tĩnh**
4. **Tránh caffeine** sau 2pm
5. **Không ăn nặng** trước ngủ 3 giờ
6. **Tập thể dục** nhưng không quá gần giờ ngủ
7. **Thư giãn** trước ngủ: đọc sách, thiền

### Thiếu ngủ gây ra:
- Giảm tập trung và năng suất
- Tăng cân
- Suy giảm miễn dịch
- Tăng nguy cơ trầm cảm
- Lão hóa nhanh
`,
    source: "health-guide",
  },
  {
    title: "Stress Management - Quản lý căng thẳng hiệu quả",
    category: "mental-health",
    content: `
## Hiểu về Stress

### Stress là gì?
Stress là phản ứng của cơ thể trước áp lực. Một chút stress (eustress) có thể tốt, nhưng stress mãn tính gây hại.

### Cơ chế sinh học:
- **HPA Axis**: Vùng dưới đồi → Tuyến yên → Tuyến thượng thận
- **Cortisol**: "Hormone stress" tăng cao
- **Fight or Flight**: Phản ứng chiến đấu hoặc bỏ chạy

### Dấu hiệu stress mãn tính:
- Mất ngủ, mệt mỏi
- Đau đầu, đau cơ
- Khó tập trung
- Cáu gắt, lo âu
- Thay đổi khẩu vị

### Kỹ thuật quản lý stress:

#### 1. Hơi thở (Breathwork)
- **4-7-8**: Hít 4s → Giữ 7s → Thở 8s
- **Box breathing**: 4s mỗi bước
- **Wim Hof**: Thở sâu nhanh 30 lần

#### 2. Thiền định (Meditation)
- Mindfulness 10-20 phút/ngày
- Body scan để thư giãn
- Loving-kindness meditation

#### 3. Vận động
- Yoga, tai chi
- Đi bộ trong thiên nhiên
- Bất kỳ bài tập nào bạn thích

#### 4. Kết nối xã hội
- Nói chuyện với người thân
- Tham gia cộng đồng
- Tránh cô lập

#### 5. Giới hạn
- Học cách nói "không"
- Ưu tiên việc quan trọng
- Nghỉ ngơi định kỳ
`,
    source: "health-guide",
  },
  {
    title: "Hormone Optimization - Tối ưu hormone tự nhiên",
    category: "health-science",
    content: `
## Các hormone quan trọng và cách cân bằng

### 1. Insulin
**Chức năng**: Điều hòa đường huyết
**Tối ưu**:
- Giảm carb tinh chế
- Ăn protein và fiber trước
- Intermittent fasting
- Tập luyện sức mạnh

### 2. Cortisol
**Chức năng**: Phản ứng stress, năng lượng buổi sáng
**Tối ưu**:
- Ngủ 7-9 giờ
- Tiếp xúc ánh sáng buổi sáng
- Quản lý stress
- Tránh caffeine sau 2pm

### 3. Testosterone
**Chức năng**: Cơ bắp, năng lượng, libido
**Tối ưu**:
- Tập compound exercises
- Ngủ đủ giấc
- Vitamin D & Zinc
- Giảm mỡ cơ thể
- Tránh rượu quá nhiều

### 4. Growth Hormone (HGH)
**Chức năng**: Phục hồi, chống lão hóa
**Tối ưu**:
- Ngủ sâu (cao nhất lúc ngủ)
- Fasting
- HIIT training
- Tránh đường trước ngủ

### 5. Thyroid (T3, T4)
**Chức năng**: Chuyển hóa, năng lượng
**Tối ưu**:
- Iodine (hải sản, muối iod)
- Selenium (hạt Brazil)
- Tránh goitrogens quá nhiều
- Kiểm tra định kỳ

### 6. Leptin & Ghrelin
**Chức năng**: Điều hòa đói/no
**Tối ưu**:
- Ngủ đủ
- Ăn protein
- Tránh thực phẩm chế biến
- Ăn chậm, nhai kỹ
`,
    source: "health-guide",
  },
  {
    title: "Gut Health - Sức khỏe đường ruột và Microbiome",
    category: "health-nutrition",
    content: `
## Microbiome - Hệ vi sinh vật đường ruột

### Gut-Brain Connection
- 70% tế bào miễn dịch ở ruột
- 95% serotonin sản xuất ở ruột
- Vagus nerve kết nối ruột-não
- "Second brain" với 500 triệu neurons

### Dấu hiệu gut không khỏe:
- Đầy hơi, khó tiêu
- Táo bón hoặc tiêu chảy
- Mệt mỏi
- Dị ứng thực phẩm
- Thay đổi tâm trạng

### Thực phẩm tốt cho gut:

#### Probiotics (Vi khuẩn có lợi):
- Sữa chua
- Kimchi
- Sauerkraut
- Kombucha
- Miso

#### Prebiotics (Thức ăn cho vi khuẩn):
- Tỏi, hành
- Chuối (hơi xanh)
- Măng tây
- Yến mạch
- Táo

#### Fiber:
- Rau xanh
- Đậu
- Hạt
- Whole grains

### Thực phẩm hại gut:
- Đường tinh chế
- Thực phẩm chế biến sâu
- Rượu
- Kháng sinh (khi không cần thiết)
- Chất bảo quản

### Lời khuyên:
1. Ăn đa dạng 30+ loại thực vật/tuần
2. Giảm stress (gut-brain connection)
3. Ngủ đủ
4. Tập thể dục đều đặn
5. Tránh lạm dụng kháng sinh
`,
    source: "health-guide",
  },
  {
    title: "Cognitive Enhancement - Tối ưu trí não tự nhiên",
    category: "neuroscience-health",
    content: `
## Cải thiện chức năng não bộ

### Neuroplasticity - Tính dẻo thần kinh
Não có thể thay đổi và phát triển suốt đời thông qua:
- Học hỏi điều mới
- Thử thách trí não
- Trải nghiệm mới

### Các yếu tố ảnh hưởng:

#### 1. BDNF (Brain-Derived Neurotrophic Factor)
"Miracle-Gro for the brain"
**Tăng BDNF**:
- Tập cardio (đặc biệt HIIT)
- Intermittent fasting
- Ánh sáng mặt trời
- Học điều mới
- Cold exposure

#### 2. Giấc ngủ
- Glymphatic system làm sạch não khi ngủ
- REM xử lý thông tin và ký ức
- 7-9 giờ tối ưu

#### 3. Dinh dưỡng cho não
- **Omega-3**: Cá béo, hạt óc chó
- **Choline**: Trứng, gan
- **Flavonoids**: Berries, dark chocolate
- **Creatine**: Thịt, hoặc supplement
- **B vitamins**: Thịt, rau xanh lá

#### 4. Tập luyện trí não
- Học ngôn ngữ mới
- Chơi nhạc cụ
- Cờ vua, sudoku
- Đọc sách
- Thử nghề mới

### Thói quen hàng ngày:
1. Morning sunlight (10-30 phút)
2. Exercise (ít nhất 30 phút)
3. Deep work blocks
4. Meditation
5. Quality sleep
6. Social connection
`,
    source: "health-guide",
  },
  {
    title: "Anti-Aging Science - Khoa học chống lão hóa",
    category: "health-science",
    content: `
## Longevity - Kéo dài tuổi thọ khỏe mạnh

### 9 Hallmarks of Aging:
1. Genomic instability
2. Telomere attrition
3. Epigenetic alterations
4. Loss of proteostasis
5. Deregulated nutrient sensing
6. Mitochondrial dysfunction
7. Cellular senescence
8. Stem cell exhaustion
9. Altered intercellular communication

### Các can thiệp có bằng chứng:

#### 1. Caloric Restriction
- Giảm 10-25% calories
- Kích hoạt sirtuins và AMPK
- Tăng autophagy

#### 2. Intermittent Fasting
- Autophagy - dọn dẹp tế bào
- Giảm viêm
- Cải thiện insulin sensitivity

#### 3. Exercise
- Resistance training: duy trì cơ
- Cardio: sức khỏe tim mạch
- HIIT: mitochondria mới

#### 4. Sleep
- HGH tiết ra khi ngủ sâu
- Glymphatic system làm sạch não
- Phục hồi tế bào

#### 5. Stress Management
- Chronic stress = accelerated aging
- Meditation giảm cortisol
- Social connection quan trọng

### Supplements có tiềm năng:
- **NMN/NR**: Tăng NAD+
- **Resveratrol**: Kích hoạt sirtuins
- **Metformin**: AMPK activation
- **Rapamycin**: mTOR inhibition
- **Vitamin D**: Nếu thiếu

### Blue Zones - Vùng sống thọ:
1. Okinawa, Nhật Bản
2. Sardinia, Ý
3. Nicoya, Costa Rica
4. Icaria, Hy Lạp
5. Loma Linda, Mỹ

**Đặc điểm chung**:
- Chế độ ăn nhiều thực vật
- Vận động tự nhiên hàng ngày
- Mục đích sống (ikigai)
- Kết nối cộng đồng
- Gia đình ưu tiên
`,
    source: "health-guide",
  },
  {
    title: "Mental Health Fundamentals - Nền tảng sức khỏe tâm thần",
    category: "mental-health",
    content: `
## Sức khỏe tâm thần - Điều cần biết

### Các rối loạn phổ biến:

#### Trầm cảm (Depression)
**Triệu chứng**:
- Buồn kéo dài >2 tuần
- Mất hứng thú
- Thay đổi giấc ngủ/ăn uống
- Mệt mỏi
- Suy nghĩ tiêu cực
- Khó tập trung

#### Lo âu (Anxiety)
**Triệu chứng**:
- Lo lắng quá mức
- Bồn chồn
- Khó thư giãn
- Triệu chứng thể chất (tim đập nhanh, đổ mồ hôi)

### Các công cụ hỗ trợ:

#### 1. Cognitive Behavioral Therapy (CBT)
- Nhận diện suy nghĩ tiêu cực
- Thách thức beliefs sai lầm
- Thay đổi hành vi

#### 2. Mindfulness
- Hiện diện trong hiện tại
- Quan sát không phán xét
- Giảm rumination

#### 3. Lifestyle
- Tập thể dục (như thuốc chống trầm cảm)
- Ngủ đủ
- Kết nối xã hội
- Ánh sáng mặt trời
- Giảm rượu/caffeine

#### 4. Professional Help
- Tâm lý trị liệu
- Bác sĩ tâm thần
- Thuốc khi cần thiết

### Self-Care Basics:
1. **Cơ thể**: Ăn uống, ngủ, vận động
2. **Tinh thần**: Học hỏi, sáng tạo
3. **Cảm xúc**: Journaling, nói chuyện
4. **Xã hội**: Kết nối người khác
5. **Tâm linh**: Mục đích, ý nghĩa

### Khi nào cần giúp đỡ chuyên môn:
- Triệu chứng kéo dài >2 tuần
- Ảnh hưởng công việc/quan hệ
- Suy nghĩ tự hại
- Không thể tự kiểm soát
`,
    source: "health-guide",
  },
  {
    title: "Dopamine Detox - Reset hệ thống phần thưởng của não",
    category: "psychology",
    content: `
## Dopamine và nghiện công nghệ

### Dopamine là gì?
Dopamine không phải "hormone hạnh phúc" mà là hormone **motivation** và **anticipation** - thúc đẩy bạn tìm kiếm phần thưởng.

### Vấn đề của thời đại số:
- Social media: Like, comment, notification
- Games: Điểm, level up, rewards
- Streaming: Autoplay, cliffhangers
- Porn: Supernormal stimuli
- Junk food: Đường + muối + mỡ

→ **Dopamine baseline bị nâng cao**
→ Hoạt động bình thường không còn thú vị
→ Cần kích thích mạnh hơn

### Dấu hiệu:
- Khó tập trung vào việc "nhàm chán"
- Luôn tìm kiếm kích thích
- Scroll vô thức
- Cảm thấy trống rỗng khi không có điện thoại
- Khó hoàn thành task dài

### Dopamine Detox:

#### Level 1: Time Boxing
- Giới hạn social media 30 phút/ngày
- Tắt notifications
- Phone không ở phòng ngủ

#### Level 2: Digital Sabbath
- 1 ngày/tuần không smartphone
- Thay bằng: đọc sách, nấu ăn, đi dạo

#### Level 3: Dopamine Fast
- 24-48 giờ không:
  - Internet/social media
  - Junk food
  - Music/podcasts
  - Games
- Chỉ: thiền, đi bộ, journaling, nấu ăn đơn giản

### Thay thế lành mạnh:
- "Earned dopamine" từ việc hoàn thành task
- Exercise high
- Deep conversation
- Sáng tạo
- Thiên nhiên

### Lời khuyên:
1. Bắt đầu nhỏ
2. Tìm accountability partner
3. Thiết kế môi trường (bỏ app, để phone xa)
4. Kiên nhẫn - cần 2-4 tuần để reset
`,
    source: "health-guide",
  },
  {
    title: "Cold Exposure - Lợi ích của việc tiếp xúc lạnh",
    category: "health-science",
    content: `
## Cold Therapy - Liệu pháp lạnh

### Cơ chế tác động:
- Kích hoạt hệ thần kinh giao cảm
- Giải phóng norepinephrine (tăng 200-300%)
- Tăng dopamine (tăng 250% kéo dài hours)
- Kích hoạt brown fat
- Hormesis - stress có lợi

### Lợi ích được nghiên cứu:
1. **Tâm trạng**: Tăng dopamine và norepinephrine
2. **Giảm viêm**: Giảm các cytokine viêm
3. **Phục hồi**: Sau tập luyện
4. **Miễn dịch**: Tăng cường hệ miễn dịch
5. **Chuyển hóa**: Kích hoạt brown fat đốt mỡ
6. **Resilience**: Xây dựng khả năng chịu đựng

### Các phương pháp:

#### Tắm lạnh
- Bắt đầu: 30 giây nước lạnh cuối buổi tắm
- Tiến bộ: 1-2 phút
- Mục tiêu: 11°C trong 2-4 phút

#### Ngâm nước đá
- 10-15°C
- 2-5 phút
- Sau tập luyện

#### Cryotherapy
- -110°C đến -140°C
- 2-3 phút
- Ở các trung tâm chuyên nghiệp

### Protocol của Andrew Huberman:
- Tổng 11 phút/tuần
- Chia thành 2-4 sessions
- Đủ lạnh để muốn ra nhưng an toàn
- Để cơ thể tự ấm lại (không sưởi ngay)

### Lưu ý an toàn:
- Không áp dụng nếu có bệnh tim
- Bắt đầu từ từ
- Không ở quá lâu
- Có người theo dõi nếu ngâm nước đá
- Tránh sau ăn no

### Sau cold exposure:
- Để tự ấm lại (maximize benefits)
- Vận động nhẹ được
- Không sưởi nóng ngay
`,
    source: "health-guide",
  },
  {
    title: "Productivity & Focus - Năng suất và tập trung",
    category: "productivity-wellness",
    content: `
## Khoa học về Focus và Productivity

### Attention là tài nguyên có hạn
- Prefrontal cortex cần nhiều năng lượng
- Decision fatigue là thật
- Willpower cạn kiệt trong ngày

### Deep Work vs Shallow Work
**Deep Work**: Làm việc tập trung cao độ, tạo giá trị
**Shallow Work**: Email, meetings, tasks nhỏ

### Ultradian Rhythm
- Chu kỳ 90-120 phút tập trung
- Sau đó cần nghỉ 15-20 phút
- Làm theo nhịp sinh học tự nhiên

### Techniques hiệu quả:

#### 1. Pomodoro
- 25 phút làm việc
- 5 phút nghỉ
- Sau 4 rounds: nghỉ dài 15-30 phút

#### 2. Time Blocking
- Lên lịch cho mọi thứ
- Deep work vào buổi sáng
- Meetings vào chiều
- Email theo batch

#### 3. MIT (Most Important Tasks)
- Xác định 1-3 MITs mỗi ngày
- Làm trước khi check email
- Nếu chỉ làm được MITs thì ngày vẫn thành công

### Tối ưu môi trường:
- **Điện thoại**: Airplane mode hoặc phòng khác
- **Notifications**: Tắt hết
- **Workspace**: Sạch sẽ, đủ sáng
- **Headphones**: Noise-canceling + white noise

### Morning Routine cho Focus:
1. Không check phone 1 giờ đầu
2. Ánh sáng mặt trời 10 phút
3. Caffeine sau 90 phút thức dậy
4. Deep work block đầu tiên
5. Ăn sáng protein cao

### Afternoon Slump:
- Đi bộ 10-15 phút
- Power nap 10-20 phút (trước 3pm)
- Cold water on face
- Không thêm caffeine sau 2pm
`,
    source: "health-guide",
  },
  {
    title: "Habit Formation - Khoa học về xây dựng thói quen",
    category: "psychology",
    content: `
## Cách xây dựng thói quen bền vững

### Habit Loop (James Clear):
1. **Cue** (Gợi ý): Trigger hành vi
2. **Craving** (Thèm muốn): Motivation
3. **Response** (Phản hồi): Hành động
4. **Reward** (Phần thưởng): Kết quả

### 4 Laws of Behavior Change:

#### Law 1: Make it Obvious (Cue)
- Thiết kế môi trường
- Implementation intention: "Tôi sẽ [HÀNH VI] lúc [THỜI GIAN] tại [ĐỊA ĐIỂM]"
- Habit stacking: "Sau khi [THÓI QUEN CŨ], tôi sẽ [THÓI QUEN MỚI]"

#### Law 2: Make it Attractive (Craving)
- Temptation bundling: Ghép với thứ bạn thích
- Join culture nơi hành vi là norm
- Motivation ritual

#### Law 3: Make it Easy (Response)
- Giảm friction (chuẩn bị sẵn)
- 2-Minute Rule: Bắt đầu <2 phút
- Environment design

#### Law 4: Make it Satisfying (Reward)
- Immediate reward
- Habit tracker
- Never miss twice

### Thời gian hình thành:
- Myth: 21 ngày
- Reality: 18-254 ngày (trung bình 66 ngày)
- Phụ thuộc: độ khó, tính cách, môi trường

### Breaking Bad Habits (Inversion):
1. Make it invisible
2. Make it unattractive
3. Make it difficult
4. Make it unsatisfying

### Tips thực tế:
1. **Bắt đầu nhỏ**: 1 push-up > 0
2. **Kiên nhẫn**: Identity change takes time
3. **Forgive yourself**: Miss once, get back
4. **Focus on system**: Không chỉ goal
5. **Track progress**: Nhưng đừng obsess
`,
    source: "health-guide",
  },
  {
    title: "Inflammation - Viêm mãn tính và cách kiểm soát",
    category: "health-science",
    content: `
## Viêm: Bạn hay thù?

### Viêm cấp vs Viêm mãn tính
**Viêm cấp**: Phản ứng bảo vệ, ngắn hạn, cần thiết
**Viêm mãn tính**: "Silent killer", liên quan nhiều bệnh

### Các bệnh liên quan viêm mãn tính:
- Bệnh tim mạch
- Tiểu đường type 2
- Alzheimer's
- Ung thư
- Trầm cảm
- Béo phì
- Autoimmune diseases

### Dấu hiệu viêm mãn tính:
- Mệt mỏi kéo dài
- Đau nhức cơ thể
- Vấn đề tiêu hóa
- Dị ứng
- Khó giảm cân
- Skin problems

### Nguyên nhân:
- Chế độ ăn processed foods
- Đường và refined carbs
- Seed oils (controversial)
- Stress mãn tính
- Thiếu ngủ
- Ít vận động
- Toxins môi trường
- Gut dysbiosis

### Anti-inflammatory Diet:

#### Nên ăn:
- Fatty fish (omega-3)
- Leafy greens
- Berries
- Nuts (walnuts, almonds)
- Olive oil
- Turmeric + black pepper
- Ginger
- Green tea

#### Nên tránh:
- Đường tinh chế
- Processed foods
- Trans fats
- Rượu quá mức
- Red meat quá nhiều

### Lifestyle Anti-inflammatory:
1. **Ngủ 7-9 giờ**: Thiếu ngủ = tăng CRP
2. **Exercise**: Vừa phải, đều đặn
3. **Stress management**: Cortisol cao = viêm
4. **Maintain weight**: Mỡ thừa = viêm
5. **Gut health**: 70% miễn dịch ở ruột

### Supplements có bằng chứng:
- Fish oil (EPA/DHA)
- Curcumin
- Vitamin D
- Probiotics
`,
    source: "health-guide",
  },
  {
    title: "Mindfulness Meditation - Thiền chánh niệm từ A-Z",
    category: "philosophy-mindfulness",
    content: `
## Mindfulness - Chánh niệm

### Mindfulness là gì?
Sự chú ý có chủ đích, trong hiện tại, không phán xét.
- **Không phải**: Không suy nghĩ, tâm trống rỗng
- **Mà là**: Nhận biết suy nghĩ mà không bị cuốn theo

### Lợi ích được chứng minh:
- Giảm stress và lo âu
- Cải thiện tập trung
- Giảm triệu chứng trầm cảm
- Tăng emotional regulation
- Cải thiện giấc ngủ
- Giảm đau mãn tính
- Thay đổi cấu trúc não (neuroplasticity)

### Các loại meditation:

#### 1. Breath Awareness
- Focus vào hơi thở
- Đếm hơi thở 1-10
- Khi mind wander → quay về

#### 2. Body Scan
- Chú ý từng phần cơ thể
- Từ đầu đến chân hoặc ngược lại
- Thư giãn và nhận biết

#### 3. Loving-Kindness (Metta)
- Gửi lời chúc tốt đẹp
- Cho bản thân → người thân → tất cả

#### 4. Open Awareness
- Nhận biết mọi thứ xảy ra
- Không focus cố định
- "Choiceless awareness"

### Cách bắt đầu:
1. **Ngồi thoải mái**: Ghế hoặc gối
2. **Set timer**: 5-10 phút
3. **Nhắm mắt nhẹ** hoặc nhìn xuống
4. **Focus hơi thở**: Mũi hoặc bụng
5. **Khi xao lãng**: Nhận biết, quay về
6. **Không phán xét**: Mind wandering là bình thường

### Tips:
- Cùng thời gian mỗi ngày
- Bắt đầu với 5 phút
- Dùng app: Headspace, Calm, Insight Timer
- Kiên nhẫn - đây là practice, không perfect
- Guided meditation khi bắt đầu
`,
    source: "health-guide",
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
  console.log("🧠 BRAIN KNOWLEDGE IMPORT - HEALTH ARTICLES");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < HEALTH_ARTICLES.length; i++) {
    const article = HEALTH_ARTICLES[i];
    const shortTitle =
      article.title.length > 50 ? article.title.slice(0, 50) + "..." : article.title;

    console.log(`[${i + 1}/${HEALTH_ARTICLES.length}] ${shortTitle}`);

    // Check exists
    if (await checkExists(article.title)) {
      console.log(`  ⏭️ Already exists`);
      skipped++;
      continue;
    }

    // Generate embedding
    console.log(`  🔢 Generating embedding...`);
    const embedding = await generateEmbedding(article.content);
    if (!embedding) {
      failed++;
      continue;
    }

    // Save to DB
    console.log(`  💾 Saving to Brain...`);
    const doc = {
      title: article.title,
      content: article.content,
      category: article.category,
      source: article.source,
      source_url: null,
      embedding,
      metadata: {
        type: "health-guide",
        importedAt: new Date().toISOString(),
      },
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
