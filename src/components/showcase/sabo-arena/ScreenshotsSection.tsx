/**
 * SABO Arena Screenshots Section
 * Uses global AdminEditContext for admin edit mode
 */
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { EditableImage, useSaboArenaAdmin } from "./AdminEditContext";
import { IPhoneFrame } from "./IPhoneFrame";

interface Screenshot {
  id: string;
  imageKey: string;
  defaultImage: string;
  title: string;
  description: string;
}

const SCREENSHOTS: Screenshot[] = [
  {
    id: "1",
    imageKey: "screenshot-1",
    defaultImage: "/images/screenshot/1.png",
    title: "Màn hình chính",
    description: "Giao diện trang chủ ứng dụng",
  },
  {
    id: "2",
    imageKey: "screenshot-2",
    defaultImage: "/images/screenshot/2.png",
    title: "Danh sách giải đấu",
    description: "Xem và tham gia các giải",
  },
  {
    id: "3",
    imageKey: "screenshot-3",
    defaultImage: "/images/screenshot/3.png",
    title: "Tournament Bracket",
    description: "Xem bracket trực quan",
  },
  {
    id: "4",
    imageKey: "screenshot-4",
    defaultImage: "/images/screenshot/4.png",
    title: "Chi tiết trận đấu",
    description: "Theo dõi diễn biến trực tiếp",
  },
  {
    id: "5",
    imageKey: "screenshot-5",
    defaultImage: "/images/screenshot/5.png",
    title: "Player Profile",
    description: "Xem thống kê cá nhân",
  },
  {
    id: "6",
    imageKey: "screenshot-6",
    defaultImage: "/images/screenshot/6.png",
    title: "ELO Ranking",
    description: "Bảng xếp hạng ELO",
  },
  {
    id: "7",
    imageKey: "screenshot-7",
    defaultImage: "/images/screenshot/7.png",
    title: "Live Scoring",
    description: "Ghi điểm thời gian thực",
  },
  {
    id: "8",
    imageKey: "screenshot-8",
    defaultImage: "/images/screenshot/8.png",
    title: "Lịch sử trận đấu",
    description: "Xem lại các trận đã đấu",
  },
  {
    id: "9",
    imageKey: "screenshot-9",
    defaultImage: "/images/screenshot/9.png",
    title: "Cài đặt",
    description: "Tùy chỉnh ứng dụng",
  },
];

export const SaboArenaScreenshotsSection = () => {
  const { isEditMode, isAdmin, getText, setText } = useSaboArenaAdmin();

  // Get editable text content
  const getScreenshotText = (id: string, field: "title" | "description", defaultValue: string) => {
    return getText(`screenshot-${id}-${field}`, defaultValue);
  };

  // Handle text edit
  const handleTextEdit = (id: string, field: "title" | "description", value: string) => {
    setText(`screenshot-${id}-${field}`, value);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="blob-gradient blob-cyan w-[400px] h-[400px] top-0 right-0 animate-pulse-glow" />
      <div className="blob-gradient blob-green w-[300px] h-[300px] bottom-0 left-0 animate-pulse-glow delay-2000" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4 font-display">
            Giao Diện <span className="text-gradient-cyan">Ứng Dụng</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Thiết kế hiện đại, trải nghiệm mượt mà trên mọi thiết bị
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {SCREENSHOTS.map((screenshot, index) => (
            <motion.div
              key={screenshot.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ y: isEditMode ? 0 : -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative mb-6 flex justify-center"
              >
                <div className="absolute inset-0 bg-gradient-radial from-accent/15 to-transparent rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-500" />

                {/* Screenshot with EditableImage */}
                <div className="relative">
                  <IPhoneFrame
                    animate={false}
                    className={`w-[140px] sm:w-[160px] md:w-[180px] transition-all duration-500 ${
                      isEditMode
                        ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-background"
                        : "group-hover:shadow-[0_0_60px_rgba(0,217,255,0.15)]"
                    }`}
                  >
                    <EditableImage
                      imageKey={screenshot.imageKey}
                      defaultSrc={screenshot.defaultImage}
                      alt={screenshot.title}
                      className="w-full h-full object-cover"
                    />
                  </IPhoneFrame>
                </div>
              </motion.div>

              {/* Editable Title & Description */}
              {isEditMode && isAdmin ? (
                <div className="space-y-2">
                  <Input
                    value={getScreenshotText(screenshot.id, "title", screenshot.title)}
                    onChange={(e) => handleTextEdit(screenshot.id, "title", e.target.value)}
                    className="text-center font-bold"
                    placeholder="Tiêu đề..."
                  />
                  <Input
                    value={getScreenshotText(screenshot.id, "description", screenshot.description)}
                    onChange={(e) => handleTextEdit(screenshot.id, "description", e.target.value)}
                    className="text-center text-sm"
                    placeholder="Mô tả..."
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {getScreenshotText(screenshot.id, "title", screenshot.title)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getScreenshotText(screenshot.id, "description", screenshot.description)}
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Edit Mode Hint */}
        {isEditMode && isAdmin && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            💡 Click vào ảnh để thay đổi • Chỉnh sửa tiêu đề và mô tả trực tiếp • Nhấn "Done" khi
            hoàn tất
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default SaboArenaScreenshotsSection;
