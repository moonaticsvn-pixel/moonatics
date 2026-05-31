import { useState, useEffect } from "react";

const MOONATICS_LOGO = null;

const STORAGE_KEY = "nuoitoi-cms-data";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

// Convert Google Drive share/view URLs to direct image URLs
function driveImg(url) {
  if (!url) return url;
  // Extract Google Drive file ID from any Drive URL format
  let id = null;
  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileMatch) id = fileMatch[1];
  // https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  if (!id) {
    const qMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
    if (qMatch) id = qMatch[1];
  }
  // Use thumbnail URL — this bypasses CORS and virus scan redirect
  if (id) return `https://lh3.googleusercontent.com/d/${id}`;
  return url;
}

const defaultData = {
  siteName: "Nuôi Moonatics",
  logoEmoji: "🌙",
  logoUrl: "",
  heroCTA: "HÃY NUÔI MOONATICS",
  heroSubtitle: "CHÚNG TÔI HỨA SẼ KHÔNG SAO KÊ ĐẦY ĐỦ",
  totalReceived: 590250,
  totalDonors: 11,
  totalSpent: 1000000,
  monthlyGoal: 10000000,
  whyReasons: [
    { emoji: "📊", title: "Sao Kê Realtime", desc: "Cập nhật từng giây! Còn nhanh hơn cả tốc độ bạn chuyển tiền!" },
    { emoji: "🔍", title: "Minh Bạch 300%", desc: "Hơn cả 100%! Tôi còn báo cáo cả việc mua ly trà sữa!" },
    { emoji: "💸", title: "Chi Tiêu Hợp Lý", desc: "Không mua xe hơi, nhà cửa. Chỉ ăn cơm với mì tôm thôi!" },
    { emoji: "📱", title: "App Tracking", desc: 'Theo dõi 24/7 tôi ăn gì, uống gì, đi đâu. Như "Big Brother" vậy!' },
  ],
  promises: [
    { text: "Sao kê mỗi ngày:", detail: "Cập nhật lúc 6h sáng, đều như vắt tranh! (Kể cả Chủ Nhật & Lễ)" },
    { text: "Không giấu giếm:", detail: "Từ tô phở 50k đến hộp sữa chua 8k đều được ghi chép tỉ mỉ!" },
    { text: "Có hóa đơn chứng từ:", detail: "Chụp hình bill, quét mã vạch, lưu biên lai đầy đủ!" },
    { text: "Video unboxing:", detail: "Mở từng gói mì tôm live trên Facebook cho anh chị xem!" },
    { text: "Hotline 24/7:", detail: "Gọi hỏi tôi ăn gì bất cứ lúc nào, kể cả 3h sáng!" },
    { text: "Không block:", detail: 'Hỏi khó đến mấy cũng trả lời, không "đã xem" rồi im lặng!' },
  ],
  othersItems: [
    "Sao kê sau 3 năm (hoặc không bao giờ)",
    "File Excel blur mờ như ảnh ma",
    'Số liệu "làm tròn" theo kiểu 1 + 1 = 3',
    "Block người hỏi nhanh như chớp",
  ],
  meItems: [
    "Sao kê trước khi tiêu (để anh chị duyệt)",
    "File Excel 4K Ultra HD, có chữ ký điện tử",
    "Số liệu chính xác đến từng đồng",
    "Trả lời inbox nhanh hơn cả chatbot",
  ],
  donateLink: import.meta.env.VITE_DONATE_LINK || "",
  budgetItems: [
    { pct: "40%", desc: "Ăn uống (Cơm, mì tôm, trứng, rau. KHÔNG có tôm hùm!)" },
    { pct: "20%", desc: "Điện nước internet (Để sao kê cho anh chị)" },
    { pct: "15%", desc: "Thuê nhà (Phòng trọ 15m², không phải penthouse)" },
    { pct: "10%", desc: "Y tế (Thuốc cảm, vitamin C, khẩu trang)" },
    { pct: "10%", desc: "Học tập nâng cao (Sách, khóa học online để sao kê tốt hơn)" },
    { pct: "5%", desc: "Giải trí (Netflix? Không! Chỉ Youtube miễn phí thôi!)" },
  ],
  youtubeId: "dQw4w9WgXcQ",
  heartMessage: 'Trong thời đại mà "từ thiện" đã trở thành từ nhạy cảm, Tôi xin khẳng định: HÃY NUÔI TÔI!\n\nTôi nghèo, tôi cần tiền, nhưng tôi KHÔNG MẤT LƯƠNG TÂM! Mỗi đồng tiền các bạn gửi, tôi sẽ chi tiêu rõ ràng, minh bạch như bụng đói của tôi vậy! 🫃\n\nP/S: Tôi hứa sẽ không mua xe hơi bằng tiền donate. Vì... tôi chưa có bằng lái! 🚗❌',
  disclaimer: 'DISCLAIMER: Đây là trang web mang tính chất HÀI HƯỚC Mọi nội dung đều mang tính giải trí, không nhằm mục đích xúc phạm hay chỉ trích bất kỳ cá nhân/tổ chức nào.',
  comicFolderId: import.meta.env.VITE_COMIC_FOLDER_ID || "",
  artworkFolderId: import.meta.env.VITE_ARTWORK_FOLDER_ID || "",
  fanartFolderId: import.meta.env.VITE_FANART_FOLDER_ID || "",
  comicUrls: [],
  artworkUrls: [],
  fanartUrls: [],
  memberImages: {
    "Red Spade": [null, null],
    "Blue Clover": [null, null],
    "Purple Diamond": [null, null],
    "Silver Heart": [null, null],
    "Pink Heart": [null, null],
    "Yellow Joker": [null],
    "Golden Joker": [null],
    "Dương Chó Điên": [null],
    "midaoli": [null],
    "Fuongemyeu": [null],
    "Remind": [null],
    "Sheico": [null],
    "Kitakara Tome": [null],
    "Vân Vân": [null],
    "Astera Lycka": [null],
  },
  originalReleases: [
    {
      title: "Chiếu Phim Cuối",
      date: "Dec 19, 2024",
      artwork: "",
      composer: "Ragakov",
      producer: "Ragakov",
      vocal: "Red Spade, Blue Clover",
      lyrics: "Ragakov",
      mvLink: "",
      spotifyLink: "",
      appleMusicLink: "",
      zingLink: "",
      nctLink: "",
      description: "Bản nhạc gốc đầu tiên của Moonatics — một câu chuyện về ký ức và sự chia tay.",
    },
    {
      title: "Ánh Sáng Cuối Đường Hầm",
      date: "Mar 6, 2025",
      artwork: "",
      composer: "Ragakov",
      producer: "Ragakov",
      vocal: "Red Spade, Purple Diamond",
      lyrics: "Ragakov, Silver Heart",
      mvLink: "",
      spotifyLink: "",
      appleMusicLink: "",
      zingLink: "",
      nctLink: "",
      description: "Bản nhạc gốc thứ hai — giai điệu hy vọng giữa bóng tối.",
    },
  ],
  recentExpenses: [
    { label: "Món ăn cho tâm hồn", amount: 50000, category: "Ăn uống", date: "01/06/2026" },
    { label: "Trà sữa sau stream", amount: 35000, category: "Ăn uống", date: "02/06/2026" },
    { label: "Tiền điện tháng 5", amount: 180000, category: "Điện nước", date: "03/06/2026" },
    { label: "Mua mì tôm dự trữ", amount: 120000, category: "Thực phẩm", date: "04/06/2026" },
    { label: "Thuê phòng trọ tháng 6", amount: 2500000, category: "Nhà ở", date: "05/06/2026" },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("vi-VN") + " đ";

// ── Icons ─────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Be Vietnam Pro', sans-serif; background: #000000; color: #e2d9f3; }

  /* ── LAYOUT ── */
  .page { max-width: 960px; margin: 0 auto; background: radial-gradient(ellipse at 50% 0%, #1a1040 0%, #0a0a0f 50%, #000000 100%); min-height: 100vh; position: relative; }

  /* ── HERO ── */
  .hero {
    background: radial-gradient(ellipse at 60% 40%, #1a1040 0%, #0a0a0f 60%, #000000 100%);
    padding: 48px 24px 56px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(139,92,246,0.18) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(168,85,247,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-stars {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 35% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 10% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 75%, rgba(255,255,255,0.4) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 40% 85%, rgba(255,255,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 75% 55%, rgba(255,255,255,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.5) 0%, transparent 100%);
  }
  .hero-logo {
    width: 120px; height: 120px;
    background: #111; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px;
    box-shadow: 0 0 0 2px rgba(139,92,246,0.4), 0 0 40px rgba(139,92,246,0.25), 0 8px 32px rgba(0,0,0,0.6);
    overflow: hidden;
    position: relative; z-index: 1;
  }
  .hero-logo img { width: 100%; height: 100%; object-fit: cover; }
  .hero-logo-placeholder { font-size: 48px; }
  .hero-title {
    font-size: 36px; font-weight: 800;
    background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 3px;
    margin-bottom: 20px;
    position: relative; z-index: 1;
    text-shadow: none;
    filter: drop-shadow(0 0 20px rgba(139,92,246,0.5));
  }
  .hero-cta-box {
    background: rgba(255,255,255,0.04);
    border-radius: 16px; padding: 20px 32px;
    max-width: 600px; margin: 0 auto;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(139,92,246,0.35);
    box-shadow: 0 0 30px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative; z-index: 1;
  }
  .hero-cta {
    font-size: 20px; font-weight: 800;
    color: #e2d9f3;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: rgba(167,139,250,0.6);
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }
  .hero-sub {
    font-size: 14px;
    color: rgba(196,181,253,0.8);
    font-style: italic;
    letter-spacing: 0.3px;
  }

  /* ── MAIN CONTENT ── */
  .content { padding: 0 20px 40px; }

  /* ── DONATION BOX ── */
  .donate-box {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(139,92,246,0.35);
    border-radius: 20px; padding: 28px;
    margin: 24px 0;
    backdrop-filter: blur(12px);
    box-shadow: 0 0 40px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative; overflow: hidden;
  }
  .donate-box::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 50%);
    pointer-events: none;
  }
  .donate-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; position: relative; z-index: 1; }
  .donate-left { padding-right: 24px; border-right: 1px solid rgba(139,92,246,0.25); }
  .donate-right { padding-left: 24px; }
  .donate-label { font-size: 12px; color: rgba(196,181,253,0.7); margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }
  .donate-amount {
    font-size: 30px; font-weight: 800;
    background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 4px 0 4px; filter: drop-shadow(0 0 12px rgba(139,92,246,0.5));
  }
  .donate-sub { font-size: 12px; color: rgba(196,181,253,0.6); }
  .donate-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px; }
  .donate-row-label { color: rgba(196,181,253,0.7); }
  .donate-row-val { font-weight: 700; color: #e2d9f3; }
  .donate-row-val.red { color: #f87171; }
  .donate-row-val.neg { color: #f87171; }
  .donate-divider { border: none; border-top: 1px solid rgba(139,92,246,0.25); margin: 8px 0; }
  .progress-bar-wrap {
    background: rgba(139,92,246,0.15);
    border-radius: 99px; height: 10px; margin-top: 20px;
    overflow: hidden; position: relative; z-index: 1;
    border: 1px solid rgba(139,92,246,0.2);
  }
  .progress-bar {
    background: linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd);
    height: 100%; border-radius: 99px;
    transition: width 0.8s ease;
    box-shadow: 0 0 12px rgba(139,92,246,0.6);
  }
  .progress-goal { font-size: 12px; color: rgba(196,181,253,0.6); text-align: center; margin-top: 10px; position: relative; z-index: 1; }

  /* ── SECTION HEADING ── */
  .sec-heading {
    display: flex; align-items: center; gap: 10px;
    font-size: 18px; font-weight: 800; color: #c4b5fd;
    margin: 32px 0 16px;
    padding-left: 4px;
    letter-spacing: 1px;
  }
  .sec-heading::before {
    content: ''; width: 4px; height: 28px;
    background: linear-gradient(180deg, #8b5cf6, #a78bfa);
    border-radius: 99px; flex-shrink: 0;
    box-shadow: 0 0 8px rgba(139,92,246,0.6);
  }

  /* ── CHI TIEU SECTION ── */
  .chitieu-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 20px; padding: 24px;
    backdrop-filter: blur(8px);
  }
  .receipt-slider-wrap { position: relative; }
  .receipt-cards-wrap {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    overflow: hidden;
  }
  .receipt-slider-nav {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 16px;
  }
  .receipt-nav-btn {
    background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.35);
    color: #c4b5fd; border-radius: 8px; padding: 6px 14px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: all 0.2s;
  }
  .receipt-nav-btn:hover { background: rgba(139,92,246,0.35); }
  .receipt-nav-btn:disabled { opacity: 0.3; cursor: default; }
  .receipt-nav-dots { display: flex; gap: 6px; align-items: center; }
  .receipt-nav-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(139,92,246,0.3); transition: all 0.2s;
  }
  .receipt-nav-dot.active { background: #a78bfa; width: 18px; border-radius: 99px; }
  .receipt-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
    font-size: 12px;
    backdrop-filter: blur(8px);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .receipt-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(139,92,246,0.25); }
  .receipt-title { font-weight: 700; font-size: 10px; color: rgba(196,181,253,0.6); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  .receipt-amount {
    font-size: 18px; font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
  }
  .receipt-row { display: flex; justify-content: space-between; margin-bottom: 4px; color: rgba(196,181,253,0.6); font-size: 10px; }
  .receipt-label-bottom {
    background: linear-gradient(135deg, rgba(139,92,246,0.4), rgba(99,102,241,0.4));
    border: 1px solid rgba(139,92,246,0.4);
    color: #e2d9f3;
    font-size: 10px; font-weight: 600;
    padding: 6px 10px; border-radius: 8px;
    margin-top: 12px; text-align: center;
  }

  /* ── WHY CARDS ── */
  .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .why-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 14px; padding: 20px 14px;
    text-align: center;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .why-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(139,92,246,0.25); border-color: rgba(139,92,246,0.5); }
  .why-card.clickable { cursor: pointer; }
  .why-card.clickable:hover { border-color: rgba(167,139,250,0.7); }
  .why-emoji { font-size: 32px; margin-bottom: 10px; }
  .why-title { font-size: 13px; font-weight: 700; color: #c4b5fd; margin-bottom: 6px; }
  .why-desc { font-size: 11px; color: rgba(196,181,253,0.65); line-height: 1.5; }
  .why-badge { font-size: 9px; background: rgba(139,92,246,0.3); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.4); border-radius: 99px; padding: 2px 8px; margin-top: 8px; display: inline-block; }

  /* ── COMING SOON PAGE ── */
  .coming-page {
    position: fixed; inset: 0; z-index: 100;
    background: radial-gradient(ellipse at 50% 30%, #1a1040 0%, #0a0a0f 60%, #000 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 24px;
  }
  .coming-inner { text-align: center; max-width: 480px; }
  .coming-emoji { font-size: 64px; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  .coming-title {
    font-size: 28px; font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 16px;
  }
  .coming-desc {
    font-size: 16px; color: rgba(196,181,253,0.8);
    line-height: 1.7; margin-bottom: 32px;
    border: 1px solid rgba(139,92,246,0.3);
    background: rgba(255,255,255,0.04);
    border-radius: 16px; padding: 20px 24px;
    backdrop-filter: blur(8px);
  }
  .coming-back {
    background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.5);
    color: #c4b5fd; border-radius: 12px; padding: 12px 32px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: all 0.2s;
  }
  .coming-back:hover { background: rgba(139,92,246,0.4); }

  /* ── PROMISES ── */
  .promise-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.25);
    border-left: 4px solid #8b5cf6;
    border-radius: 0 16px 16px 0; padding: 20px 24px;
    backdrop-filter: blur(8px);
  }
  .promise-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; color: rgba(226,217,243,0.9); }
  .promise-item:last-child { margin-bottom: 0; }
  .check { color: #a78bfa; font-weight: 700; flex-shrink: 0; }
  .promise-bold { font-weight: 700; color: #c4b5fd; }

  /* ── COMPARE ── */
  .compare-box {
    border-radius: 14px; padding: 20px;
    margin-bottom: 16px; backdrop-filter: blur(8px);
  }
  .compare-box.red-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); }
  .compare-box.green-box { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.3); }
  .compare-title { font-size: 15px; font-weight: 700; margin-bottom: 14px; }
  .compare-title.red { color: #f87171; }
  .compare-title.green { color: #a78bfa; }
  .compare-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 13px; color: rgba(196,181,253,0.75); }

  /* ── DONATE CTA ── */
  .donate-cta-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.35);
    border-radius: 20px; padding: 32px 24px;
    text-align: center; margin: 24px 0;
    backdrop-filter: blur(12px);
    box-shadow: 0 0 60px rgba(139,92,246,0.1);
  }
  .donate-cta-title {
    font-size: 22px; font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #c4b5fd 60%, #a78bfa 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .donate-cta-sub { font-size: 13px; color: rgba(196,181,253,0.7); margin-bottom: 20px; }
  .donate-cta-sub a { color: #a78bfa; font-weight: 600; }
  .qr-wrap {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(139,92,246,0.3);
    border-radius: 16px; padding: 16px; display: inline-block;
    margin: 0 auto 16px;
  }
  .qr-img { width: 200px; height: 200px; display: block; }
  .qr-placeholder {
    width: 200px; height: 200px;
    background: rgba(139,92,246,0.15);
    border: 1px dashed rgba(139,92,246,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: rgba(196,181,253,0.6); text-align: center;
    border-radius: 8px;
  }
  .auto-mail { font-size: 13px; color: #a78bfa; font-weight: 600; margin-bottom: 16px; }
  .btn-donate {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white; border: none; border-radius: 12px;
    padding: 14px 40px; font-size: 16px; font-weight: 700;
    cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;
    transition: opacity 0.2s, box-shadow 0.2s; display: inline-block; text-decoration: none;
    box-shadow: 0 0 24px rgba(139,92,246,0.4);
  }
  .btn-donate:hover { opacity: 0.9; box-shadow: 0 0 40px rgba(139,92,246,0.6); }

  /* ── BUDGET ── */
  .budget-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.25);
    border-left: 4px solid #6366f1;
    border-radius: 0 16px 16px 0; padding: 20px 24px;
    backdrop-filter: blur(8px);
  }
  .budget-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 14px; color: rgba(226,217,243,0.9); }
  .budget-pct { font-weight: 800; color: #a78bfa; flex-shrink: 0; min-width: 40px; }
  .chart-note { text-align: center; color: #c4b5fd; font-size: 13px; font-weight: 600; margin: 16px 0; }
  .saoke-btn-wrap { text-align: center; margin: 24px 0; }
  .btn-saoke {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white; border: none; border-radius: 12px;
    padding: 14px 40px; font-size: 16px; font-weight: 700;
    cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;
    box-shadow: 0 0 24px rgba(139,92,246,0.4);
    transition: box-shadow 0.2s;
  }
  .btn-saoke:hover { box-shadow: 0 0 40px rgba(139,92,246,0.6); }

  /* ── VIDEO ── */
  .video-wrap { border-radius: 14px; overflow: hidden; margin: 16px 0; border: 1px solid rgba(139,92,246,0.3); box-shadow: 0 0 30px rgba(139,92,246,0.1); }
  .video-wrap iframe { display: block; width: 100%; height: 400px; border: none; }

  /* ── HEART MSG ── */
  .heart-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 16px; padding: 24px;
    backdrop-filter: blur(8px);
  }
  .heart-para { font-size: 14px; line-height: 1.8; color: rgba(226,217,243,0.85); margin-bottom: 12px; }
  .heart-para:last-child { margin-bottom: 0; }
  .heart-para strong { font-weight: 700; color: #c4b5fd; }
  .heart-para .red { color: #f87171; font-weight: 700; }
  .disclaimer-box {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(139,92,246,0.2);
    border-radius: 12px; padding: 16px 20px; margin-top: 24px;
    font-size: 12px; color: rgba(196,181,253,0.5);
  }

  /* ── ADMIN BTN ── */
  .admin-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 90;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white; border: none; border-radius: 50%;
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; box-shadow: 0 4px 20px rgba(139,92,246,0.4);
    font-size: 20px; transition: transform 0.2s;
  }
  .admin-fab:hover { transform: scale(1.1); }

  /* ── OVERLAY / MODAL ── */
  .overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
  }
  .modal {
    background: #0f0f1a; border: 1px solid rgba(139,92,246,0.3);
    border-radius: 20px;
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1);
  }
  .modal-head {
    background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2));
    border-bottom: 1px solid rgba(139,92,246,0.25);
    padding: 20px 24px; border-radius: 20px 20px 0 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .modal-title { font-size: 18px; font-weight: 700; color: #c4b5fd; }
  .modal-close {
    background: rgba(139,92,246,0.2); border: 1px solid rgba(139,92,246,0.3); border-radius: 50%;
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    color: #c4b5fd; cursor: pointer;
  }
  .modal-body { padding: 24px; }
  .cms-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(139,92,246,0.2); margin-bottom: 20px; flex-wrap: wrap; }
  .cms-tab {
    padding: 10px 14px; font-size: 12px; font-weight: 600;
    color: rgba(196,181,253,0.5); border: none; background: none; cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    font-family: 'Be Vietnam Pro', sans-serif; transition: color 0.2s;
  }
  .cms-tab.active { color: #a78bfa; border-bottom-color: #a78bfa; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(196,181,253,0.6); margin-bottom: 5px; }
  .field input, .field textarea {
    width: 100%; padding: 9px 12px;
    background: rgba(255,255,255,0.05); color: #e2d9f3;
    border: 1px solid rgba(139,92,246,0.25); border-radius: 8px;
    font-family: 'Be Vietnam Pro', sans-serif; font-size: 13px;
    outline: none; transition: border-color 0.2s;
  }
  .field input:focus, .field textarea:focus { border-color: #8b5cf6; }
  .field textarea { resize: vertical; min-height: 70px; }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .list-item-row {
    display: flex; align-items: center; gap: 8px;
    background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.15);
    border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;
  }
  .list-item-row input { flex: 1; border: none; background: transparent; font-size: 13px; font-family: 'Be Vietnam Pro', sans-serif; outline: none; color: #e2d9f3; }
  .icon-btn {
    width: 28px; height: 28px; border-radius: 6px;
    border: 1px solid rgba(139,92,246,0.25); background: rgba(139,92,246,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(196,181,253,0.7); flex-shrink: 0;
    transition: all 0.15s;
  }
  .icon-btn:hover { border-color: #f87171; color: #f87171; }
  .add-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(139,92,246,0.08); border: 1px dashed rgba(139,92,246,0.3);
    border-radius: 8px; padding: 8px 12px;
    font-size: 12px; color: rgba(196,181,253,0.6); cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif; width: 100%;
    justify-content: center; transition: all 0.15s;
  }
  .add-btn:hover { background: rgba(139,92,246,0.2); border-color: #8b5cf6; color: #c4b5fd; }
  .save-btn {
    width: 100%; background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white; border: none; border-radius: 10px;
    padding: 12px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin-top: 20px;
  }
  .toast {
    position: fixed; bottom: 88px; right: 24px; z-index: 300;
    background: #1f2937; color: white;
    padding: 12px 20px; border-radius: 10px;
    font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    animation: fadeUp 0.3s ease;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .login-box { padding: 32px; }
  .login-title { font-size: 22px; font-weight: 800; color: #1f2937; margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
  .login-err { color: #ef4444; font-size: 12px; margin-bottom: 12px; }
  .btn-login {
    width: 100%; background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white; border: none; border-radius: 10px;
    padding: 12px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif; margin-top: 8px;
  }
  /* ── NAVBAR ── */
  .navbar {
    position: sticky; top: 0; z-index: 80;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(139,92,246,0.2);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    height: 56px;
  }
  .navbar-left { display: flex; align-items: center; gap: 4px; }
  .navbar-right { display: flex; align-items: center; gap: 6px; }
  .social-btn {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.2);
    display: flex; align-items: center; justify-content: center;
    color: rgba(196,181,253,0.6); text-decoration: none;
    font-size: 14px; transition: all 0.2s;
  }
  .social-btn:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); color: #c4b5fd; transform: translateY(-1px); }
  .nav-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    font-size: 13px; font-weight: 600;
    color: rgba(196,181,253,0.6);
    background: none; border: none; cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif;
    transition: all 0.2s; white-space: nowrap;
  }
  .nav-btn:hover { color: #c4b5fd; background: rgba(139,92,246,0.1); }
  .nav-btn.active {
    color: #c4b5fd; background: rgba(139,92,246,0.15);
    border: 1px solid rgba(139,92,246,0.3);
  }

  /* ── INNER PAGE ── */
  .inner-page { max-width: 960px; margin: 0 auto; padding: 32px 24px 80px; }
  .page-title {
    font-size: 26px; font-weight: 800;
    background: linear-gradient(135deg, #fff 0%, #c4b5fd 60%, #a78bfa 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin-bottom: 24px;
    display: flex; align-items: center; gap: 10px;
  }

  /* ── MEMBERS ── */
  .member-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .member-tab {
    padding: 8px 20px; border-radius: 99px; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(139,92,246,0.3); background: none;
    color: rgba(196,181,253,0.6); cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif; transition: all 0.2s;
  }
  .member-tab.active { background: rgba(139,92,246,0.2); color: #c4b5fd; border-color: rgba(139,92,246,0.6); }
  .member-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .member-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(139,92,246,0.2);
    border-radius: 14px; padding: 18px 14px; text-align: center;
    backdrop-filter: blur(8px); transition: transform 0.2s, box-shadow 0.2s;
  }
  .member-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(139,92,246,0.2); }
  .member-avatar { font-size: 36px; margin-bottom: 10px; }
  .member-name { font-size: 13px; font-weight: 800; color: #e2d9f3; margin-bottom: 4px; }
  .member-role { font-size: 11px; color: rgba(196,181,253,0.6); margin-bottom: 6px; }
  .member-since { font-size: 10px; color: rgba(196,181,253,0.4); }

  /* ── PROFILE IMAGE SLIDER ── */
  .profile-slider { position: relative; width: 180px; flex-shrink: 0; }
  .profile-slider-track { width: 180px; height: 180px; border-radius: 14px; overflow: hidden; position: relative; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25); }
  .profile-slide { width: 100%; height: 100%; object-fit: cover; display: none; }
  .profile-slide.active { display: block; }
  .profile-slide-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 6px; color: rgba(196,181,253,0.4); font-size: 11px; }
  .profile-slider-dots { display: flex; gap: 5px; justify-content: center; margin-top: 8px; }
  .profile-slider-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(139,92,246,0.3); cursor: pointer; transition: all 0.2s; }
  .profile-slider-dot.active { background: #a78bfa; width: 14px; border-radius: 99px; }
  .profile-slider-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); border: 1px solid rgba(139,92,246,0.3); color: #c4b5fd; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; z-index: 2; }
  .profile-slider-btn.prev { left: 4px; }
  .profile-slider-btn.next { right: 4px; }

  /* ── SUPPORTEE CARDS ── */
  .supportee-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .supportee-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(139,92,246,0.2);
    border-radius: 16px; padding: 24px 20px;
    backdrop-filter: blur(8px); transition: transform 0.2s, box-shadow 0.2s;
  }
  .supportee-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(139,92,246,0.2); }
  .supportee-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .supportee-emoji { font-size: 44px; }
  .supportee-info-top { flex: 1; }
  .supportee-name { font-size: 15px; font-weight: 800; color: #e2d9f3; margin-bottom: 2px; }
  .supportee-alt { font-size: 10px; color: rgba(196,181,253,0.5); margin-bottom: 6px; }
  .supportee-meta { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: rgba(196,181,253,0.55); border-top: 1px solid rgba(139,92,246,0.15); padding-top: 12px; }
  .supportee-meta-row { display: flex; justify-content: space-between; }

  /* ── MUSIC ── */
  .music-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .music-tab {
    padding: 8px 20px; border-radius: 99px; font-size: 13px; font-weight: 600;
    border: 1px solid rgba(139,92,246,0.3); background: none;
    color: rgba(196,181,253,0.6); cursor: pointer;
    font-family: 'Be Vietnam Pro', sans-serif; transition: all 0.2s;
  }
  .music-tab.active { background: rgba(139,92,246,0.2); color: #c4b5fd; border-color: rgba(139,92,246,0.6); }
  .cover-list { display: flex; flex-direction: column; gap: 10px; }
  .cover-card {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 12px;
    align-items: center;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.18);
    border-radius: 12px;
    padding: 12px 14px;
    transition: background .15s;
  }
  .cover-card:hover { background: rgba(139,92,246,0.07); }
  .cover-art { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; background: rgba(139,92,246,0.12); flex-shrink: 0; display:flex; align-items:center; justify-content:center; font-size:22px; }
  .cover-info { min-width:0; }
  .cover-title { font-size: 13px; font-weight: 800; color: #e2d9f3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom: 3px; }
  .cover-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 11px; color: rgba(196,181,253,0.55); align-items:center; }
  .cover-meta b { color: rgba(196,181,253,0.85); }
  .cover-list { display: flex; flex-direction: column; gap: 10px; }
  .cover-card {
    display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: center;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(139,92,246,0.18);
    border-radius: 12px; padding: 12px 14px; transition: background .15s;
  }
  .cover-card:hover { background: rgba(139,92,246,0.07); }
  .cover-art { width:56px; height:56px; border-radius:8px; background:rgba(139,92,246,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cover-info { min-width:0; }
  .cover-title { font-size:13px; font-weight:800; color:#e2d9f3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
  .cover-meta { display:flex; flex-wrap:wrap; gap:4px 12px; font-size:11px; color:rgba(196,181,253,0.55); align-items:center; }
  .cover-meta b { color:rgba(196,181,253,0.85); }
  .music-table-wrap {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(139,92,246,0.2);
    border-radius: 16px; overflow: hidden;
    max-height: 560px; overflow-y: auto;
  }
  .music-table-wrap::-webkit-scrollbar { width: 6px; }
  .music-table-wrap::-webkit-scrollbar-track { background: rgba(139,92,246,0.05); }
  .music-table-wrap::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }
  .music-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .music-table thead { position: sticky; top: 0; background: rgba(20,10,40,0.95); backdrop-filter: blur(8px); }
  .music-table th { padding: 12px 14px; text-align: left; font-size: 10px; font-weight: 700; color: rgba(196,181,253,0.6); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(139,92,246,0.2); }
  .music-table td { padding: 11px 14px; border-bottom: 1px solid rgba(139,92,246,0.08); color: rgba(226,217,243,0.85); vertical-align: middle; }
  .music-table tr:last-child td { border-bottom: none; }
  .music-table tr:hover td { background: rgba(139,92,246,0.06); }
  .music-link { color: #a78bfa; text-decoration: none; font-weight: 600; font-size: 11px; }
  .music-link:hover { color: #c4b5fd; }
  .vocalist-tag {
    display: inline-block; background: rgba(139,92,246,0.2); color: #c4b5fd;
    border: 1px solid rgba(139,92,246,0.3); border-radius: 99px;
    font-size: 9px; font-weight: 700; padding: 2px 7px; margin: 1px;
  }
  .music-count { font-size: 12px; color: rgba(196,181,253,0.5); margin-bottom: 12px; }

  /* ── COMIC ── */
  .comic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .comic-placeholder {
    background: rgba(255,255,255,0.04); border: 2px dashed rgba(139,92,246,0.3);
    border-radius: 16px; aspect-ratio: 3/4;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: rgba(196,181,253,0.5); font-size: 13px; gap: 10px;
  }
  .comic-placeholder span { font-size: 36px; }

  /* ── GALLERY ── */
  .gallery-section-title { font-size: 15px; font-weight: 700; color: #c4b5fd; margin: 24px 0 12px; }
  .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .gallery-placeholder {
    background: rgba(255,255,255,0.04); border: 2px dashed rgba(139,92,246,0.3);
    border-radius: 12px; aspect-ratio: 1/1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: rgba(196,181,253,0.4); font-size: 11px; gap: 6px;
  }
  .gallery-placeholder span { font-size: 28px; }

  @media (max-width: 640px) {
    .why-grid { grid-template-columns: repeat(2, 1fr); }
    .donate-grid { grid-template-columns: 1fr; }
    .donate-left { border-right: none; border-bottom: 1px solid rgba(139,92,246,0.2); padding-right: 0; padding-bottom: 16px; margin-bottom: 16px; }
    .donate-right { padding-left: 0; }
    .hero-title { font-size: 28px; }
    .member-grid { grid-template-columns: repeat(2, 1fr); }
    .comic-grid { grid-template-columns: 1fr; }
    .gallery-grid { grid-template-columns: repeat(2, 1fr); }
    .navbar { flex-direction: column; height: auto; padding: 8px; gap: 6px; }
    .navbar-left { gap: 0; flex-wrap: wrap; justify-content: center; }
    .navbar-right { gap: 4px; }
    .nav-btn { padding: 6px 8px; font-size: 11px; }
  }
`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showCMS, setShowCMS] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [comingSoon, setComingSoon] = useState(null);
  const [expPage, setExpPage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("basic");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setData(saved ? JSON.parse(saved) : defaultData);
    } catch { setData(defaultData); }
  }, []);

  const save = async (next) => {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    setToast("Đã lưu! ✓");
    setTimeout(() => setToast(null), 2200);
  };

  const login = () => {
    if (pass === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setShowCMS(true); setPass(""); setPassErr(""); }
    else setPassErr("Sai mật khẩu!");
  };

  if (!data) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Be Vietnam Pro, sans-serif", color:"#9ca3af" }}>Đang tải...</div>;

  const remaining = data.totalReceived - data.totalSpent;
  const pct = Math.min((data.totalReceived / data.monthlyGoal) * 100, 100);

  return (
    <>
      <style>{css}</style>
      <div className="page">

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="navbar-left">
            {[
              ["home",    "🏠", "Trang Chủ"],
              ["members", "👥", "Thành Viên"],
              ["music",   "🎵", "Âm Nhạc"],
              ["comic",   "📖", "Truyện Tranh"],
              ["artwork", "🎨", "Artwork"],
              ["fanart",  "💜", "Fanart"],
            ].map(([id, icon, label]) => (
              <button key={id} className={`nav-btn${currentPage===id?" active":""}`} onClick={() => setCurrentPage(id)}>
                {icon} {label}
              </button>
            ))}
          </div>
          <div className="navbar-right">
            {[
              ["https://www.youtube.com/@moonaticsmusic", <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>, "YouTube"],
              ["https://www.facebook.com/moonaticsvn/", <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect x="1" y="1" width="22" height="22" rx="4"/><path d="M14.8 12H12.8v7.5h-3V12H8.3V9.4h1.5V7.8c0-2 1.2-3.3 3.2-3.3.9 0 1.9.2 1.9.2v2.1h-1.1c-1.1 0-1.4.7-1.4 1.4v1.2h2.4l-.4 2.6z" fill="white"/></svg>, "Facebook Fanpage"],
              ["https://discord.com/invite/5ySBAvzh6R", <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.3 3a19 19 0 0 0-4.7-1.5.1.1 0 0 0-.1 0 13 13 0 0 0-.6 1.2 17.6 17.6 0 0 0-5.3 0 12.4 12.4 0 0 0-.6-1.2.1.1 0 0 0-.1 0A19 19 0 0 0 4.2 3a.1.1 0 0 0-.1 0C.6 8.3-.4 13.4.1 18.5v.1a19.2 19.2 0 0 0 5.8 2.9.1.1 0 0 0 .1 0 13.8 13.8 0 0 0 1.2-1.9.1.1 0 0 0-.1-.1 12.7 12.7 0 0 1-1.8-.9.1.1 0 0 1 0-.1l.4-.3a.1.1 0 0 1 .1 0c3.7 1.7 7.8 1.7 11.5 0a.1.1 0 0 1 .1 0l.4.3a.1.1 0 0 1 0 .1 12 12 0 0 1-1.8.9.1.1 0 0 0 0 .1 15.5 15.5 0 0 0 1.2 1.9.1.1 0 0 0 .1 0 19.2 19.2 0 0 0 5.8-2.9v-.1c.6-5.9-.9-11-4-15.5a.1.1 0 0 0-.1 0zM8 15.6c-1.2 0-2.1-1.1-2.1-2.4S6.8 10.8 8 10.8s2.1 1.1 2.1 2.4S9.2 15.6 8 15.6zm8.1 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4z"/></svg>, "Discord"],
              ["https://www.facebook.com/groups/moonaticsmusic", <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm-8 0c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5c0-2.3-4.7-3.5-7-3.5zm8 0c-.3 0-.6 0-1 .1 1.2.9 2 2 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z"/></svg>, "Facebook Fan Group"],
              ["https://www.tiktok.com/@moonaticsvn", <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19.6 3a3.6 3.6 0 0 1-3.5-3H12.5v12.3a2.1 2.1 0 0 1-2.1 1.8 2.1 2.1 0 0 1-2.1-2.1 2.1 2.1 0 0 1 2.1-2.1c.2 0 .4 0 .6.1V6.3a5.8 5.8 0 0 0-.6 0 5.7 5.7 0 0 0-5.7 5.7 5.7 5.7 0 0 0 5.7 5.7 5.7 5.7 0 0 0 5.7-5.7V7.4a7.2 7.2 0 0 0 4.1 1.3V5.1A3.6 3.6 0 0 1 19.6 3z"/></svg>, "TikTok"],
              ["https://open.spotify.com/artist/1UTZCiWQpQhmRnnCERrX2a?si=hWeMLGNaTOiik8nBaXnTrA", <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3a.7.7 0 0 1-1 .2c-2.8-1.7-6.3-2.1-10.4-1.1a.7.7 0 0 1-.9-.5.7.7 0 0 1 .5-.9c4.5-1 8.4-.6 11.6 1.3a.7.7 0 0 1 .2 1zm1.5-3.3a.9.9 0 0 1-1.3.3C14.8 12.3 10.8 11.7 6 13a.9.9 0 0 1-1.1-.6.9.9 0 0 1 .6-1.1c5.3-1.4 9.8-.8 13.4 1.5a.9.9 0 0 1 .3 1.2zm.1-3.4c-4-2.4-10.6-2.6-14.5-1.5a1.1 1.1 0 0 1-1.4-.8 1.1 1.1 0 0 1 .8-1.4C8.6 5.5 15.9 5.7 20.4 8.5a1.1 1.1 0 0 1 .4 1.6 1.1 1.1 0 0 1-1.7.5z"/></svg>, "Spotify"],
            ].map(([href, icon, label], i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer" className="social-btn" title={label}>{icon}</a>
            ))}
          </div>
        </nav>

        {currentPage === "members" && <MembersPage data={data} />}
        {currentPage === "music" && <MusicPage data={data} />}
        {currentPage === "comic" && <ComicPage data={data} />}
        {currentPage === "artwork" && <GalleryPage data={data} defaultTab="artwork" />}
        {currentPage === "fanart"  && <GalleryPage data={data} defaultTab="fanart" />}
        {currentPage === "home" && <div className="hero">
          <div className="hero-stars" />
          <div className="hero-logo">
            {data.logoUrl ? <img src={driveImg(data.logoUrl)} alt="Moonatics Logo" /> : <span style={{fontSize:64}}>{data.logoEmoji || "🌙"}</span>}
          </div>
          <div className="hero-title">🌙 {data.siteName} 🌙</div>
          <div className="hero-cta-box">
            <div className="hero-cta">{data.heroCTA}</div>
            <div className="hero-sub">{data.heroSubtitle}</div>
          </div>
        </div>}

        {currentPage === "home" && <div className="content">

          {/* ── DONATION TRACKER ── */}
          <div className="donate-box">
            <div className="donate-grid">
              <div className="donate-left">
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:36}}>💜</span>
                  <div>
                    <div className="donate-label">Tổng Đã Nhận Được</div>
                    <div className="donate-amount">{fmt(data.totalReceived)}</div>
                    <div className="donate-sub">Từ {data.totalDonors} lượt donate 🙏</div>
                  </div>
                </div>
              </div>
              <div className="donate-right">
                <div>
                  <div className="donate-row">
                    <span className="donate-row-label">💰 Thu:</span>
                    <span className="donate-row-val">{fmt(data.totalReceived)}</span>
                  </div>
                  <div className="donate-row">
                    <span className="donate-row-label">💸 Chi:</span>
                    <span className="donate-row-val red">{fmt(data.totalSpent)}</span>
                  </div>
                  <hr className="donate-divider" />
                  <div className="donate-row">
                    <span className="donate-row-label">🏦 Còn lại:</span>
                    <span className={`donate-row-val ${remaining < 0 ? "neg" : ""}`}>{remaining < 0 ? "-" : "+"}{fmt(Math.abs(remaining))}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{width: pct + "%"}} />
            </div>
            <div className="progress-goal">🎯 Mục tiêu tháng này: {fmt(data.monthlyGoal)} — {pct.toFixed(1)}% đạt được</div>
          </div>

          {/* ── CHI TIEU ── */}
          <div className="sec-heading">💎 Chi Tiêu</div>
          <div className="chitieu-box">
            {(() => {
              const perPage = 4;
              const total = data.recentExpenses.length;
              const totalPages = Math.ceil(total / perPage);
              const visible = data.recentExpenses.slice(expPage * perPage, expPage * perPage + perPage);
              return (
                <div className="receipt-slider-wrap">
                  <div className="receipt-cards-wrap">
                    {visible.map((e, i) => (
                      <div className="receipt-card" key={expPage * perPage + i}>
                        <div className="receipt-title">Thanh toán #{expPage * perPage + i + 1}</div>
                        <div className="receipt-amount">{fmt(e.amount)}</div>
                        <div className="receipt-row"><span>Hạng mục</span><span style={{color:"#c4b5fd"}}>{e.category || "Khác"}</span></div>
                        <div className="receipt-row"><span>Ngày</span><span style={{color:"#c4b5fd"}}>{e.date || "—"}</span></div>
                        <div className="receipt-label-bottom">{e.label}</div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="receipt-slider-nav">
                      <button className="receipt-nav-btn" onClick={() => setExpPage(p => p - 1)} disabled={expPage === 0}>← Mới hơn</button>
                      <div className="receipt-nav-dots">
                        {Array.from({length: totalPages}).map((_, i) => (
                          <div key={i} className={`receipt-nav-dot${i === expPage ? " active" : ""}`} onClick={() => setExpPage(i)} style={{cursor:"pointer"}} />
                        ))}
                      </div>
                      <button className="receipt-nav-btn" onClick={() => setExpPage(p => p + 1)} disabled={expPage === totalPages - 1}>Cũ hơn →</button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ── WHY ── */}
          <div className="sec-heading"><img src="data:image/png;base64,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" style={{width:56,height:56,objectFit:"contain",flexShrink:0}} /> Tại Sao Nên Nuôi Moonatics?</div>
          {comingSoon && (
            <div className="coming-page">
              <div className="coming-inner">
                <div className="coming-emoji">🚧</div>
                <div className="coming-title">{comingSoon}</div>
                <div className="coming-desc">
                  Tính năng này đang được chúng tôi phát triển<br/>
                  <strong style={{color:"#a78bfa"}}>(Hoặc không bao giờ được phát triển)</strong>
                </div>
                <button className="coming-back" onClick={() => setComingSoon(null)}>← Quay lại</button>
              </div>
            </div>
          )}
          <div className="why-grid">
            {data.whyReasons.map((r, i) => {
              const isClickable = r.title === "Sao Kê Realtime" || r.title === "App Tracking";
              return (
                <div
                  className={`why-card${isClickable ? " clickable" : ""}`}
                  key={i}
                  onClick={isClickable ? () => setComingSoon(r.title) : undefined}
                >
                  <div className="why-emoji">{r.emoji}</div>
                  <div className="why-title">{r.title}</div>
                  <div className="why-desc">{r.desc}</div>
                  {isClickable && <div className="why-badge">{r.title === "App Tracking" ? "📲 Download App" : "📊 Chi tiết"}</div>}
                </div>
              );
            })}
          </div>

          {/* ── PROMISES + COMPARE (merged) ── */}
          <div className="sec-heading"><img src="data:image/png;base64,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" style={{width:56,height:56,objectFit:"contain",flexShrink:0}} /> Cam Kết & So Sánh</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            <div className="promise-box">
              <div style={{display:"flex",alignItems:"center",gap:6,fontWeight:800,fontSize:14,color:"#c4b5fd",marginBottom:14}}><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAABH40lEQVR4nO29d3gdV5k//nnPmZnb71XvVnOXHTe5xF2243QcUqQQQggQIBs6S1uWIiuwBDYBlg0ECOySAEuIFJPem+1UxynuknuRZUtW161Tzjm/P+ZKthzbccB2zO/rzxNHzyPduXNm3vP2coBzOIdzOIdzOIdzOIdzOIdzOIdzOIdzOIdzOIdzOIdzOIdzOId/APRBL+AUgmpraxkANDU1SQDqA17POZwikGps5KDDe5Uxhvr6evYBrukcTgXq6+vZEYQtuG7urHkXVo2eCYCnf/f/Jwn1/xZqa2sHiVjyw3/54m8e/vWfe1/92wtqdeMz6g//8fO3544un0xE5zj5nxGDxF163ugFf/nprw/ueX2H2vn6TtXycrPY+nKL076hXf3htl/sDwNZ9fWK4Rwn//OgtraWEzEsmTBmxt9+dU+s9e1WtXnlRmvD8+vkxhfWq43Pr1ObV240d7+2XX3/U5+9DQBerK/XPuh1f1D4ZxNfrLGxUSklM2+84fMPzJy9JNDT0yWEEDoAIiIQERzH0cG5Gj9x2k0Awot/8AMHHxAX19fXs/r6ek0pxZVSTCnFX6yv1+r/+d796UdjYyMHgB/e8qX7976xU218fr296cUNas/aXerQ5na17609asuqTWrjC+tV80vN4o1HVquPzp11CTBMZ58R1NbWcqXUCYl4JuyDfxrR1VjbyOuuvVZ88qKL6i65rK4uadmOpnOtqKgYXq83/SmFtv17EY5kQQpH5uTk04SJ0xfhlTVPfq6qiprOzFJJKUVEJIgIUzL0yZdcVndZcdnoGT5fIOTYVuLAgb2b/vT7u//Q0NCwvb6+njU0NMgzs7SzF6SUIgCBe37087171+6RG19YL2K7B5R9wFTJfXFl7k+q6M4+9cwfH1SbV21SG19Y5+xdu0f9bvltrwBA+vrTitra2iF//MKxZYt+/rXv/O3J/33A2bZ6s9q7drfau3aP2vvGbrXrtW3qkbv/L/rxCy6oA04vJ/9TcHB9fT0nIueLy5ZdO33mgtJYPObk5+dpXq8Xtu0AAHTDg/6+boAInHE4tsWEFMjMKawCkEmM9cLVw6clwtVYW8vrmpoEgJI7vvyNn86YvaiuvHIcTNuBbZtOKtpPBIL7H5PTZiwMCiH/tGvvtjdvvfXWXfUAawBOOSf/Uyj65cuXSwCYMHnmTcFwluKcUSSSASEEiABN02DbJjaufxM5uUWQUoAxRrZtq+zs3IxLxlaOhFIYDGWeatQvXKjVNTWJxSOLF/3l9l+trbv+lrr8kkrZN9AvbNuEpmmarukcAIcCB5Te19drT54yy7ig5rLrlFKoOU1cfNYTuB5gRExW54ZHjigbPTNlmQiFQoxzDqUUGGOwbBMP/N/dYNwLr88PIQQAggJERkY2ykePGgkAVYcOnXIxXVtbyxtWrXIumThu6Re+8oMn5y9eVtA7MOAQFCspKeEVFRUoKytDaWkpCgoK4PF4oJQCSBHnusrLLz4PAGqWLz8tkuWsJzDq6xmgMHfOopqy8lGaUlKEQiGSUoKIoJSEx+PD0svqsKNlHXZu3QiPxwsoBSkFfH4/MjLzSwAANTWneGn1bMWKFWJOWe6Umz79tYeqZ1/g6eo5JLKzs7SKigqEw2Fw7hrvnHP4/X4YhmfoeiIiTdd8p3RRR+GsJ3ANagAAJaUV0/yBEDjnh7kAABGHlAKte3aiavIsjBx7HizLBDEGJSUM3YNIKDPX/a5TCpowYQJJKY3rr//8n2bNv8jf29slCgsKeUFBAZRSEEJASgkpXdWqaRr27dk29AVKSZipZPzULms4zn4CL69RABAKZ5YScRiGToy5y1ZSQvfo2LjuDezY3gxICce2MRjTUACIc+i6kel+Wc0pW1d9fT2vq6sTX7nyim8tufDKif3Rfic3N5fn5OSkVYQLTdPhCwXg8fmwrXk9zFQKum4AIAjHRryvZzcArFy+/LRY+f8MVrQEAK8vkK8I8BqetGhWIMZgpUyMq5qC8orReGX1swhn5uCwoazAiIE4DwNATU3NKdFz9QBbvny5eOpXPxu9+KJr/l3zBoQOyfPy8oaIq5SCpuno7mpH8+Z3wJiGVMpCSdlo2LYFTddpYKAPrfu2bwSAlStXnoqlvQtnOwcT55oCoHl9/hwA0HWNBsWzq2cl/KEQtjZvQF5BBTTdGBLfwOnxiSY0NhIRqWuu+8x/TZo6x2tZKRQVFdOR92XEwD0asnLy0N3VDd0bQtnI8ZBSQCkFzjXe3r5fvvray+sBAKtWnZZgx9lOYEj3pYUNjy9DKYBzjQCAiMA4hzfox8a3XkMiaSIzOw+ObYGGcsQEKAUiFQOAlStX/sNisLG2ll977bWitnryZfNqLrk0aVkiLyeX67o+pGsBQJHC9s0bsGXjOzAMHTub10EpObj5pKHp6D50oPWdntguxhgaTpN/flaLaAWAlEIRENB03a/gukWDnJJMxtH8xkuIxmIoLhsLy0odQVxXE0vpIJlI9QIAVv7DS6LaxkZVR2Qsufia2/NLKpWUgiIZGXAcN+AyuDalFPbt3QEhOUZUVKF8FIdj2yAiECMJJenQwdaXAZhCCE5E4gT3/btxVnPw8vp6AhTKsoMBXTcMpP1eACBGeO6pB5FIOagcM/kozkX6Mwy2ZSER7zsIACv/QQqnI2rycxdfeNOchReNT5mmzM3NYYACEcHj9cEwPDA8Xni9Ppw/dwmsZBSWmYSm6QCQFs869fZ00KbNbzwKAMtrak5bGPWsJvCWLVsIALKycsM+r58UoBgjUkqBQKhZcjkcK4F9u7eBseHJIqVcA8s0k+jv6zsEAPjHDBlavny5ABCev/TD3w+Es5XPa5DfH4BUCsJxsHPbJrS17sTuHZvx2kvPYvXzT6KgeCSCoQiEsNPrkspjePj2rZt7H3hm5TNEDA2rVp0W7gXOcgIPIpKfHfZ6/SBAEtycrxAC4YwszK25EMGAB22t28G5NszAAhGLxaLo7jzYCgBb8vL+bj2X5l71pSuX3TRl6pwC00qJ7Owc5m42BiEFNqx7Ezu2b0frvlZoehAVY6cgGI5ASjeyBgCMa4KUxK7tmx/uB3qlFBynsQL0rCZwbfpnOJSZltAKg9kaIoJj2zB0D86bMhM8rZsHZZ1SSnHGWV9vj1i3ecMBAKhqavp7X+Qg9xpTqxd83hMIKa/Hw3w+H6SUEMJBMBRGWVklIpl5KC4bg2A4A45tQTiHaw2UkjB0D9u7extWv/T0bwCgrq7u71zSyeGsNrIG87e2bZKSEqB3qyrGGA60toJzHYxzCOEMhTk450gmor1bBsxDIIYGJf8uAtcvXMiJyPnkwnnLJk2eNdK0TFFUWMgBDOl9IQTKKsdg7ZqX4fF6MRhKHQ4SHsNgm9a//tITG5rXKKXY6TKuBnFWc/AgnFTSdBzn3S8sHezoaG+DP5gBKcSRLpJijCEej3UDiLFjbI6TxfKVKyUAzJi79KtZecUwDB1+v38oqEFEsMwUsosKkJubi56uDuhH++NKwuPxom3fDnr++Ud/RESoq6s77Tnqs5qDB2ElTVMIx03aH+GGaIaBvp5D6OntRVllFRzHHrqGiBQBSCVjBwBIIRxGRO87mOAW+ZG4eMKYGeMnVs8xbUvm5eYM4143qRFAX8ch9HR1obB0DBzHPmpDkvDoOn9p1RPPPLj2nafOBPcC/ywEtpO2kAJQio6UsYwYtm7ZjEhWPmzHhhRiKHtDjJSSAtGB3r21tbX8nuXL9fqFC53Ba1cCyMvLU+/V5vK5z32OmpqaULPosk+Vlo8BaVyGQiE2FNRQCt5AAF3tB7D29dUoLBkFztkww0pKoYKhDGx459XU31b87gtKKVr+D0iU94OzmsBVVVUKAHpTiaRt2yDGCBj0JTlisX60t+9Ddm4htu5pQUZWAUaUjYJlmeCMw0olMdDbt7mpqUk0AcfhFoKql2z5yhqGVavkUVUVtHjJEgeAt2zk+A8R58iIhNngGogApmnYsv5N7NqxDaWVVTAMA8PViYKmG8JOxrQXn33wB2vaotubmpp4w3HXc2pxVhMYDQ0AgPb2roRlmoIRcQCKiEhKCY/Xj6UXXwXGCGteeQHh7IKhiBIxxmLRfrVn94b9186cfKHhC0yWkrwa06JSCJG0452d3W17Vu04tJ0aqBtpwiqlWF1dHTU1NYna2lrW1NQkPjJ79pyyslHFRCQDgUCaexV0jxcvvfAEurt6MGnaXDjChm2ZIDps2kipZCgY0B5/8N6NP3vggdsaGxt5XV3dGSuyO6sJ3OCGiLBlwOw1rVSMMRYZZrhIAX8ohN3bt8ARQCAYgmWm0pkcg21vfluR8t9VNX52ZmF+GbIyi2DbNqQUsBwLsXgflg50dg/0H9zQ0bnnmbebX3qciDYCbjK/pqaGmpqaMHP2givzC4oRDockY5y5pUIMjmVjwnnV2N+6B9tb3kY4kousnPwh/SulUP5AWDVvWisfbLr7M8SY1dTUdFr93qNxVhMYcPWsVKI3lUgccgksFdJF7koRHMvCru1bkVNQBtsyoZSEbnhxsHUb1q1cT2U5NZlmnyW3de+U4ewOjBk3HVwRvDrIH8hmhYVjsxnUIjMVXTRx4gU/7OzYsXLT1pfubGhoeLimpoYB4PklFRf6AiFASkbEoOluCJSIkF1YCCkd7Ny6CaFIzhErd0WzslLa80+vuOPZ7W1r6uvrtYaGBuc4j3pacLYTWA1av6aZ2AeF0ZqmKyjAMk0EQmHs2dUC3RtAKCMLlpkEVxp0Q8P2Dc3QqAgew6cM6WUBRFj/oXZsMl/GhPPmQAgBIRQsC4qIJOceVTZikjaqfNqSyrLJSzze+760aNGiOxePLplZOmLU6Lb9OxXzScb3c4woGYWsgnw4poW3Xn4R7QfbMWbCTOgeb1pEE4QUMhQKaM88dt+22//61+83NipeV3f6reajcbYTGCtXrmQAZF9fbytjDK2tu1QiOQBf0A9zXxIb33gN2Tkj0Pz26yDG4A+E4Igk9m/tgGFkQwib3OI8jqyMYuza/zrAVmHy5KUwzQSYa7hxKQWEsGGCnPyC8bRg9jW/aN624dXPffX2xXl5hRS1up1pixZo8Z4B7G3ZivaOfTjQug+a4cfoCdVwbGuIuFIKFQpF5NbNb9GDTfd8koglm5rqzqhoHsRZT+DBBEE01rc1NtCHlIyias5ktLz9DjavXYfedhupgX4Q3CZCXbdxcP9GOJYOjweQEuDcgGnFcaBzA3IzRyLRE0Vb21YUFo2GbaWGjCIiBgK0eLJflo2YSB+76ovPdu5ptjc7USyuXcZdM4wgpMSOzVtQMXoS/IEgLNNNUw5WmuiGR5ixfu2Jh/78H09s3vrqByGaB3HWt1XW19YaqDokE9tLr7zuY59r3N+6WcT7bd7bbiIYzIXH50v7nGnXhQE7Nr8OmcwG4wRGHCkriq6B3cjLGAWPEYJwbPSmdmLKjAXQuBdKvduoVUopw/BQT1cLbJuQV5INPWBj87q3MGfh1SitHAczFU+7S3TkdSIcCvMH/vKbl77285/UvPjii2zRokUCH9BIibOWg2tra3ljbS2ors4CgE8tu2T3+tdXwYx7yB8sQHauB45jwbJS6RyxAhGHZcZgJS0YnINxN0TYGz2AwsyJ8Hr9sEUShscLv5WPttZtGDV6OkwzMcy1AVwrzrIsFQyXwbK6yYyFEOuOIi9zLNateQaBYABZucUwUwkgnQQRQqhwOINefenJ/rvv+snHGeNy5cpFwAc4L+SsJXBTU5OgpibMG1VaNWv6lAVelfUJjYqUNztAUtgwU0l4fR6ACGbKBGMExjhSyX5AaiBNh5VIYG/HekTCEdh0CPv3dSLiLQLIBBjh0Pb9yCsoh98XgZTv7jAlUkRkgJEXltOBYKQMUDnwevLR8s5GlI2JorB0JISQELYNnz8gOg/u0x7525/+ZatJe+oXztMaGlZ9IKJ5EGclgaurq/UJWeHZE6dVz1l62bL6nWs3eZ1ENhTnEI7rnhSWFSI7PxPEGdr3dqDzQCc0jcGxTdimhKZ3I1JmofaqxRg3ZTK2bXoHG99JYuzYcuTmRRDOyYKZTGD1oxsQ8GVBKeddySrGuJsk8OVAxFuRiLfD682GbvgghQ/b1+9G54E2jJk0Db5AhtAZaU8+dt+f73v5tb++WP+itqhh0QdKXODs08GU1mmBh+65t+OKGz/uf+be+7G/JeH4QyEmpWDCEcgryUNJZTEsywIjNw+8fcMOOLZAIj6AUGYMNVcvQF5BHuANArYNJ56AFgkDTLlBQkcAXj8evvt/cWCbhqyc3HTuFuliLgYzlQTjEkpq0AwP4vFdCASKwZgBkAJjOpKxfijqkVPmzqZtLRt3fvZf/+X8AaV603r5A28LPdvShQrLlxOBYltbttc+9cc/9u1v6RW+YIhL6TAA4BpHZm4GHNsBFCClBNc4whlBCMeGYQQQCGchr6QI0lQQfX0QiQQ0jUMMDMDu7ofTPwA7FoMz0IeZ86uRSB0EKZ4uKAAgOYTqwZQlGpbekI+FtREEMiz4PIWIx1rBOEuX7NowPH7kF0+U3W2ttOIvd/05CnQvr1uu4SwgLnD2ERg3P/YYV0T41o9/+PprT7/hZGaPYGASSrmdDB6fB4bXeJf1qnsMKAXoHh0H9wygY+c+MK8OYmyoEpMxBj3oh+bzQg8GoIWCKBw/FUUVQfT1doNrHIx09PTtwoKrMzF18XgUjc5BKm4jFXPg9UegpA9dHbvANY9LZCUgHJuXjZ0pr7vhX79x6XnjrmtoarDqFy48K9TfB70IAoDaWrCqQwtp+cqVgohsP1B4w4UXPjFp0uKcvNJs6Q+VsD3NexHtG4DX63H7f48qAJBysFdJAcqHbRt3In9UBVRKHe6E0DRsXPuW3PLOO6yrsxMEQvWCBZh/0Rw8+D+vQOO56O48hJFTGcomjIKyTWx98yBeeqgPkcwMRPv7UDzKC66nsL/5ECI5OVDSRiqRooH+HkyeVhP45KfEX8xf/yDRsGrVwwsXLtRWrfp/0MhS9YrxH3CpFJRSCk1NSgCr0ECEa2bOrC3MzvlpeWn1iFB2lgxG/IwxhpyiXAz0RcEN7d2WgwKslAkAkELA5w+iZcMuzFrSD133ASrdiSgERpSOoLKKcsTjCWxrbsET9zdBwYGX5yDPHgtLdqF63ngoCQjbwpY1vQiFMxCPReEJ7ceSj8yGP+TDH297ClYqA5rOYKVspOImRfU+OWX6Enz8E/HGvl98Z8Hq1S+tqa2t5U1uY/gHgg+EwNQwVFnhAxCeW5ZVUVE+eVFJ4Zirx4ycXh3ta0Uoo0wGwl5mGD5IJZBM9sO2ksfyVyGEQDKeAkv3DOseA4kujl1bd2Dc9OkQ8TgYYyAAGTk5BKUQzs5C4ZhRWHjFh/DKE0/h97ffDp9WjtwyL7LzIiAo9HT2obNjAAEjhEDmQVz+6VnwZ2Sjc28bbJNDmB3IyBoBx7bRe6gXkaww6+/vkXPnLzOiA70rmn9cP6OxsbF9OdFp6d4/GZxRAg8OHPla3S23Zkayr7atVMjQ9UgomBnOzS6G35eB/oEumUwlKD+YyfwBP/bvbcbmdaugBIehFUGKofYPQAGMMyRiCZgpE0KY0DQDSgoE/DnY8vZ2jJtRPWwNyrYBIijHgUqaUFCYe9mlGDW2Ev/17Z8hp3wCuMcLSAlGQCJuIRhpw4c+PR3+jHwc3L4DT967Gz5jIrr6NyARD8Lri6C/dwDR/hiC4SAbiPaLCy/+aHFHR9tfiGhRY2Mjg1t/dcYDHmfUyJowYQIBgM/wLZg1eUnVxPFzR4wdc344P3+UUqQ5SduU3T17mc+fSbrhQVfnfuzfuxXnL/gwps1ahnAkH8l4HIPFkQoKjBO62rtB4IjHe3GgbSuIGALBENp29yB2qAP8yAK4I8puGWfgnMPuPIT8UeOxeNkitLftBrgBCIFQOAxpHFALryqHPyMfh/buwpN/3A5DK4GCiXBGBQ4c2OLaAgpo39eRvo/ipu04V155U82nLrygvq6uTtQvrD+jY5wGcUYJvPlXvyIA2LZr7Z87uvbDti07mYwp2zZJSqERwBKJfgTCuTATcWjcjzmLr0IoIw9dHZ0gBiRjKUR7ozA8BnRdQ9fBbvR19QEQiEQKEY/3wLKS0HQNygliy/otgNeDE1XMcsOAjPZh9pIaJBMmEj19ABGMgB/V80uopLwQsd52NN71Ogw2CsrTicJx3VCSEArn4+DBZnh8fsQGojiw5yB0XYdlJbk/kiMuu/T6708vyJ5x6+ofOGd6VhdwhgncsGqVUErRs6++1LR736ZDPl+Ap+OBIOKw7ZRrJHnDkEqg80A3DuzZj90tu5CMp9yCOgL2725D2+4D2LttH9p2tYExBpke5cA1D/bvbwbnHKFQLra8vROwkyB2/JgOAZC2g2BRIUorK/D2q+8AhjtZYczEsXjxqdX4291vIMCmorNrD8onEhZdMRG2OoT8vLFIJPoQjXbD4/Ghq70LrTv3gzFOphnH1BmL2XXXfea3SkmttrZ28HZnDGfaD1ZNdXWsF9S/oXn19+KxLuY1AkpKmY4jR8E0DzTNAADYlo39O9vQ19k35MsSEaQj0dHagZ7OPlC6GQ1EsC0LOQUF0PxRxKNRBENh9Lbb2L9jF5jXO7yt5SgwxoBUEksvuxRvvLQRUALSNFFUWYLcglz098Zg8Z2YcoGG+Zedj95DMShHAaRQVDQeBw40Q8GdxdHV3o0dm3ai80AXP3Sw05k4fv7UuvNnfsEV1QvPKBef8UBHXVOTqK29hje99trdL615+E/JRC9pmi6JCKaZgN8XxuAmJyJougamHbVMAjRdg6Yd8a5U+vfkQ/Xc89A/sB+McXg9OVi3ZiOg8xOKaSKCSCRQPLEKDEG88cLL4MFMiFgUE2dOwhcbLsMnvzULi66YDTANW97eCcf0QsGG35+JcCgXB9taoOteME4wEyYO7DmIrRua+UCPIydNWPj9ygDylq9cKXAG3/sHE8lqagIRw1+ffPD7m1pWpaIDnWBcU5YVh+ENDsvPKqWOaXsq14k+/AtyuTARS2FERQUKyj3o6TqErJwC7NrSgXhnB5iu44SGLBHgOLh42TJ1/93PysRAL3ggAGcgDiUYdOYFFEf/oTasf6UPWdlFEI6AbZsoKBiNVCqGgf4OaFwHMYKmadB0nWxhyrEjZ2Qunn3RvxGRaqxtPGNi+oMgMKG2EUpJz80f+WzjrOoP+3XDDyhFyVQSXo8fSh2rr+e9vhQAFBjT0N8dx4LL5qK3bzc8Hi+UE8b6NetAfi+kOLGYlvE4xk2fTJVlU9g9P3kUA33d0MIhkN8LCgTQ092B++96DQFjFIi7G9H1xR0Ul1ThYPu2YQUIACAchzPNK0ePnPnZ87JQUttYK3GG3v0ZJ3BjbSNraqoTH5u/8BvVE2tmWI7l+LxBFkt0C0v22obuH8bBg6Uw7w13ZpZh+NG29wDyRo1H2dgwDrW3Ii+vFOtf3wYn1g/GT6wClVIA0zH3omr0HQzgLz99A083vog3V67DcytW4v/ueA26Mwa+gGfYNB0pBbzeILKzR6C1dRN0/XClCGOMTCslK8vPC8yefsm/nkkuPtMEZrWNtXKcH4UTxs35hmaEpJA2TyZNGKEoHzO+Qnfs4cQVQijLstTJEFlKCY/hRV9XDMpKYskVSzAQ3wuP149U1ItNa9eBAn5IcfygEmMMKpnC+KkTkZkPhIzx2P2GH68+2I9trxrIDk2CL+B5VyyciGDbJnJyykBE6OzcPYzIQjicmEeVl06+qSCI3DQXn3Yin1EC19fXMyJS8+Zc/JVRFVPDKSshdc1Lff1tmD5/HCCNdCjS1a+cGeju3yfbu1okZ4eDFcezhpWSMDwexPosJLo6kDNyNKbOG4m21m3ILxiFtas2QKbihy3v40A6DjwZ2aiqrkB3z17kFRahoLAMObl5ADmQ4tgqZJDIJSUT0dPThmRyAJy7ep8xRrZjiYqy88IXTa/5JBGpMxH8OJMEpltvvdXJBCLlZZM+RZpXERRLxhPIzAfGTByHaH/cDVAo192IRgdQOjrMyypyeCIRH6q9Onhg6zFvoBTANQ1WiuFQeyeUaWHBpYvBfd0gEOJ9BjavfQcs4B82EeddC+UEFU9i+rwZkKwXZtKEbZvptpj3YjrXlSsprkJr66bBbwQACOEwjyekKkon3QzAs3zl8sMdaqcJp5TA9fX1TCnFBiezH4na2lqmlELNzOoLiwtGZ9u2KTjXWH9/B6qmVYKYDtsabLmUYExDNHoIU2aOR2ZuGGYqASIC5zq6uvena5qH32awiELXgtizYy+IAboRwMW1i9B2YAPy8sbgteffhrTcIjuVnrPlXps206SEkgrSthDILUBVdSm6uw5AN7w4uVAyQQgb/kAGMjOLsG/fhiFRTQSWsi05snxS5fVzZ17vcvHp9YtPKYEbGhokEcm6ujpx9Dj7qqoqAoCykklLRxSNomQqyru628F0E6OrRsFJpsC5hqHd7khoXhOloyuQkR2CbbuZJMY4bJFCLNYFxo6ayQGCkA4CgQy07uwAHAtOIoHKqVMxfnoeogOdsOIhrHtlDVgwAGYY4H6/22fkOIBSYD4feCgIruuQ8STOr5kNW3ZCOiefJyBisO0U8vIqQYzhYPs2GOnIGAHEjWyVkzPu3wB40n7x2T1lR6VnHf/HzTfNXfnH3z39b9df8zkikkcRWQJAd3/XI6vXPvrK9u2v9pIkFcnxqIzCIhCxIW5yo1pxZOV5wUPZyCvMgZBxlxC2g9LyMiiKDSX5j4SUEl6fH32HTPR1dEDzeiCicVxY+yEo4yD8vny8sXIT7Hg/dmxpwcrHnsCzTzyBF558Ck89+hiee/AhrFu1GtGBATCPgXDxCIyfXoKuzv3QdM8Jo2FHwiVyEqUjJiE60In+voMAGWjv2MZ8epucPWXk6AsmlNcRkVp4Grn41KQLly8HGhowc/Kkny1ctmzm1AlVF4bDGaOI6F/T7ZJi8FyCPz3/6GMAHvvqVdev8Hl8VxWV+4UjOX/2kUdgJhNgGYNGloPu7jb0te1HcWUZdN/LcGwbUgKRjGyAxZBKxOH1G8MJrQDOCRB+7Nq2C9NKSqFSKeiBID70sYvQ+Otn4Tfy8fhf/yYmzpxOE6dOYcFgAF6/H2CEaF8/du/chVXPPoeMrCxUz5+PmksvwJY3/xfCKT7WmJATwJUolZXV2L7jLUTC+7Fs8TRUlpcDfr/q7Dn46ec2/+ZPK1eulO/X7z9ZnAoOJs65BOALRkIjZF+vCOflW1/84i1f/cI1H/pmXV2dOFInq0b3eJncnLKRtpNCQUkevfHsMxg9oQp5JQUwU66oTqaimDJzGlKJhDQimSgsjSAW7U9niRhGVo1ALN4FxvRhXOU2fjnwB7Kxq6UVUAKMcYhEHMWjx2HxVVMRS/Zh75YYLy7JZzmVo+HNzkZ0YABtu/eCEcOk+Qtw+Sc+jaKyUrzw8KOIp4SYWTMeHQf3QDdOHNN+F6QEkYFIyIe6i6tRWTEa8XiSSUuQz+eb5QXKGGOyFuD1CxcOHb9zLDvm78H74WCqX7iQo6YGWLlycHjXkU8qbSiHhYI80d2DYGGB+OSNN/zghVWr/lZbW7szfSaBYtdyoeok/9HN3wsyLhAI+VE6chRCRSOwduUmSOEAxOCIJMZPGo+csnKmTBsTqsfhsWZ3ZH9nZwIjx1ej5e1XXMPsqG0qhUAgEER7axuSvd3w+SNQQkAMRDF53hwISerpv74hm36/gk1eOJ2ebXwAOzZuQHwgCl8wiKKyMkxfMA9Lr7oSlePGoXNfq5q1ZB7eee33MJMmuDY0KuTwyyECY2xY8EMpBV33oL1jD+bNKEdh2WgkozFohkFMOcLvy/LMnzh5/pxN61uXKyWJSDUc5Vu/r810DJw0BxORali1ymloaHAaVq1yiDHV2FjLASghBAEwewei+6FxcI9OIh5X02oWGDd/9tP1RKSWu6eeKCkF1QPKskSP5SQQjoQRKirDi01/wavPPw3Da4ARQ39fO+7/wx+gHAfkCFSOHwt/xIFpWhCOgsfwY+qcMejuOgj9CN04+NPjNaAhV735ykYLHgNSSjDO4PTHMG3xArr+S5fhiYdXqB/f8jm8/dyzMPv7oRNg9vdh25trcc9P/hNfvOJqPP/wI8gdVanpwQgWXFSN9vZtaav4SKnBYNkOevv6oDC8ijOZTCEzYmHq9KmwpAMe8IIbOuKpmHJECFUjz5vbAEgiCt60aM4tv/naFx6+b/l3Vn677qpblVKDp8383TgZDib3vSnvR+bOWFZZUZ7XvK2l/cE3Nq6qq2vqZIzhrbvv1gDYnb3dWwA1W+NcCiE5d4RcunhR3aS//PUHjLFtcOcsswbA+dj2197Ky5w0I6ugWL788Ar2y+8tRyCUBctOwesNwjYH8PifH8JAXwLf+vEPoYUimDp7LNY+3wqPJ4juQ12YVjMHa1/aAjNlgetuoxljGmzTRsfBNiSsbgpGSqUSAgSXG7jHQKK7B/9z++1c9R0C0zRIpZBKJqHpOjxeLwyvB34FmAN9uOu730fzuvX4zDe/gcmLF+Od1zeht6cL4UjEnclFDLbtQKMOjBkZwM5du8C0QgT8PhBxRKMHsHjRKDC/H0gk3ekDXgM79uwgoQLIziwcVaxh1u3f/c49ly65YFwkIxNgGq4c6F/oDQYOENFv/pHuxPfk4PQOot9+4yt//NUdt9//vW99485f//RnTY/96vbNn75g3r9LKan6s591AFDzlpbX7L4+cM6JMSKZSMjxkycb111x+SeUUvjFF7+o33rrrc75hTnTPvfJaz5SUzNHvvL8i/x3P/whIsEglDSRTPRBN7yIRfuQGQnjscYm579vuz0GCVTPPx/B7BQScQuJeArMF8KiZbPQ1b1PQejo7+1F677N6I5tRslEjo9++RJMnVvtVSkTxAgKgNI0ddcPb3M2v/U2Rk+fgeoLl6LmmqsxedEiZI0YgWgshlj/AJSU0DweZGZlYuWKFaj/l1vQub8dV954JTq7mwEcPhQkkYxhXHkmFtfMQd0lU2DwgyplmhCOQCBoY/T40XAcB8zQQBoHPBwtO9u54cmCaUZn3n3HbSuv++SnxkUyMx0raQqzr8/0ZGfZo0tKLgCA5f/ApPoTcnA6tCgnFGSNv3DevNqswiIhUgmVX1REl40amTt/7vz/GPP73y0gousY571/efzRZ2+88WPJ86qrfcq2leMIpkc8mDZ16lUA6r/03//tfPnOO9n11179q9lXXZXx5hNPiF//4mdMkxJMN6BSMbS1bgUhpEZOHEef/t7NiPVG+erVL1FfWxsyigpx6UeX4lfL70XnwTzASWDc5POwb2cbtm/cgoKyMGZPmooxE8bCE8kCTBsykRwKTXLGYEWjuPSaq9Snv/plZGRnAR4PwBggBFLRKDavW48n72/ChpdegtdjwPB4kJGVhT0bN+K7N34cP/j973Dp1XPw1IqNGDlqEhzHLfTrj1uQ0ShCkWwsu3A6NT62TpmpTJowvQR6ZgbsATdEagQC6OrtQFc3R7RvJy64cEq45pJLYB7qkiSlBgboPo8yu7q1tZs2rQSA5SuXnx4CNzQ0KCJCv5Uc6OzrTZUradiWxaRSJM2UCmdnO9/4929fFAyFn/vcbT+/qL1f7Wve0rzmvNmzagCSjClOpqUqKyvGTC8rmkhE71w1e9pFH7nhY+cnOrvFo488xGUiAe4PQCkJ25YorPSo6iVFqiB/AkonjicISbOWLg7IWBwyFkNeaTlqP3OJ2tG8TUKCi5SJC6+8kC643ALzBwAwIJmC6I+CGA2LOyulYHg8VDVzhg7LgrJtSMsaav/0ahqqF8xD9fx5WP3kk/jLf92J3vaDCIXDCIbDiHV34jufvAn/fvttGHteCD0HexGKhMG5hv5kQjGvQUlbIFJYhGlTuvD081swuuoygDEwQ4NiBGkAr7+0ET0dUYyv9qFm2SXK7BkA9xhMOQ4kkw7zB7S/Nv5148//9uj//KMD095LRKv777+f7+9Jtj309DN32Yk484ZDtlQSumGQHY/pkMq+5Ztfn/ab7379cSWltqVl6x+c3l7oBgdAgOOI8vJyWrpgzmICMHvWrI/3RmOq/utfVS2bNsLn9wMExKIDmHPhRfjCrfU0s2YmKx1ZQaK3D2JgACIaSw/SZpDRGCZOn0Ifvu4qrhJub7C0HBA0iFgCIhaDUq5BdSzfUikFEYtBpstnGWNgnA8ZRmIgChmLYcHll+O2P9+LqTU16O/vB5SE1x9Aqr8X9V/8CvbvbcHuva9AKQaNa0gkBTlE0DwGpBAYPbacikf6RU5BPqRwoHQOLRLCnl278fqLLRgxTsdl118JJ2mR5jEIGgN0zfFkZGgPPXB/f/0v77xWKZWq+wfLbd9TB9fV1UlVX89+9Jemf/uv/77zcTuZNDzhsO3YlmIahyOlDtN0bv7aV2fe++P6xoZf/+GZluaWKLxerpRUwrZJy8rE2LFjLlcAlZSPmP3H39xFW955i0XCIRBjcEwTOUUl+NRXvwwZjcHp7oc0TffFp1++Sx13ELg0Lbf8Jk0/l5CuPmTvkSkC3JTg8QILjHN3Tb19yIxE8G//+Z9YctXV6O3tAwHQvV4YDHjhoUfQunsNDrStg655YdsSNiSYrkMSEMiKYPK0MYw4A+kaSNMAr47mjXuQXeTDlZ++CkQ6yOCQBGg+r6NnZ2oPNd7X03D7T5fujdvNREytWLFCNP4D1ZgnY0Wrmx97TFPukZp1ff39//eVr37xw7mVoyDiCUFEXDiOxhmJj9/8mSsFKM/weGy3XQRQSnHYjpo++/zZEWDJ5GlTfVd98kb8749/Qi8+8gg4EZKpFD7xzW8ilJMLq7cXmq6DpHrX9qN0DZa07aECvJOJAB0+Y+nkPQ6ucTixOJQC/uUbX0cqkcCrTz2FcCSEvv4BVI4bh6/++3ewf88urF61DoWlhVCcQIYOCQnN6wUpolQqBX8wAFIKKmVj3KSRmL1oOryGH9I0oTiDnhkBTFNruueelXVf/+51APoqgYm2DtVqqz11TU3x9OO+b05+zydmjL0rtfax+dU3fekrX71jxoUXZMCy4SQTg9wj4fUyJFOHy1aIACLFA3765e0/2/WhKz+cXzZ1cuDNxx+HlTKx8a230Nvbp76x/PukhITmMaAkIJUAM/TDI4QZQ2xgQBJAwbw8t9I8ZUIJ9xSTdM3dcKK79x76p5yT9DSUgrIdKEccsZE0/Of3voe3XnsZSy//EK67/mMIBUMAAx5rehg72vrwpa9/CooIUinoAT+aN28RBSVFLDMnh1Q6mUFeD+AIyPRaWEamam/Zkrzt375778OPPfvYj29ruDIjGPxwQPdke5hG7V1d+5584fnv/ubpF//09xxFeyICD8n+a8+fctP0iRMXE6csGJ6u9o72h/678TGz4ZZP3PCJmz+zrGDMGI/o7x8M70gajC2Rm2HgHg9eW70aFSMrUVhZAWsgimcefBiXX3m1O9silVRKCWK6ju6eHngCfgQjGW7ngsaHOgO7u7vltpYWxHr7WVFJMSpGj0IgGAT0wxtB2TZE+rQxIQQcx4FlWVBCIDsSOSniStuBEhKU7heWSQtMEWID/ejq7MTIceMgk0k4tuVOAbAdvLbhbcy7+CLAEVCMwAN+HGjd74RCQRaKRJhMV4AMi0x5PGrlE0/Yd93xX6suq72GLZ43d0lZ5Si3OT1lAUlLweOlbW+/ie/99I55TWvefuWaa655X81sxxXRqr6eqKFB/+WXb/nzdVd8uDYrKwvwGoDfh1Qy/rFrr7++79WXXln9xc/e8srHPnXjvMuvucZQtk3k9tC7xeRKQQsFsXHNGwiGQygcNVIq22adnYeQFQ5D2TasWAKappGCBPMS7vnVn2EEg/hy/efhpI7I1ToOcjIzWc5Fl+Dxe/6Ab3/8E6gYMwaRnCwEwxFwjUMpYHQkDC4ElJSA5QDCgWbbSCqFxd/+FjJzciDto0f9HgEhgSOSF8p0AMs9oi7oDyAyMgyrr9+10MHAiKG7P4qCypFgwQBkMukabI6DoqJCTSkFdcQc6yOli51MUrS3n9/x27uWlk+aAvT2KKcvKqVpMSUllC3ISKasytIyIysjY5RS6pX3e8DmMQlcv3ChRg0NzkfnTl9yw4evrA3nFdi2nSQSgsi2ldcXoOmz52VMr1m07Opt27Bt2zYpUiZpuj5Ug6TgVlfE+/rQ0XEIFyy7HE4sxrRgEL1d3SjIywdJAcbd8w6MQBCb31iDA202HBnF6sefx4IrLoVIJME0DhDBcRxw20RhcTECfh+inYfQ1bYfkBIJx8HV48bj/PJSCKlAjMCIAM7h83qxr78fPYc6kVlQAFjWYdE/bFe7nD94NICyHCjLFa2KCMIREKYF4umj9YQC4xztPd2q6LyxBClwZGBcKQXi3FUNxxhmrnOOK276BIdpQfR0SpWyGGmMM6EBjoDNhGShiPbCow/FH33j1eeJCA3v8wCtY5qcg4dX9MRjid7+AUAJEkppBHAAmmPb3OrvU05vryguK8WiD13GdK67mZPB9RNAQT92bt2GylEjAc5ACoCUMJMmcjKzIB0bbvUGg52K4dFHX4JmZCIczsEjK15Dd+s+MMMYZiSRUgiGw2CaDqZpCAQCgNeLC8ZXYdmEKgjdADweKN2Ao+lwGEMSACmJZE8PwNjxLRXlvngAgJBQjjhMGDWo49OfkwqcMcT6+2GRRHZuDqRlD32cOEc8Hhdtra02GcOnvx8J0dsHmUyBcc4Yd2etKaUgpBS+zGy5d2szu7fpgS+39ST333/NNRzvsw31mARuamoSSin21LqW1fc98tATADSv12s58rDRwTknAnHHNGEPDEAhnVw6/HdI00RvXy9KR1ZAmSaYrkE6NoRlw+fxQjgOpBDQgl6sfe1VtO634PV6wZiElfDh6YdfBHm0oY6EQVGdkZUFr98HKQQsx0HY48Gl5WVIWFa6UD69jiMO6dBAsGKxY3NuGirNvUopSCHc8gsp3I0rncPiWyoo6c6s7jjUgdziIkL6lLVBSCHgCwb5np27dDMRH+L6dxGA88N9U7omdZ/P0cMheLIy+Z7mzdodd925/M+vvPE/R5ww/r5wXB1MRCpNzOtDwcAjn7/55vmecARg5EBIOMIhAjgjBrDDegVpQ4IZBroPHoTP74cWCkHE4+C6hngsBmY70DUNliPANA3Jvj6sWt2MQCAXUjpQSiEUDuHtN/aphdt2oLiigqSdHtcvBIKhIHyBIBKpLqQALC0pRqbXi6hlgR/PvwWg0sfB07GYSSkooVz3TCkoIQHHJSqlqzwh4YY100NYFID+VALj83MBxx4eNZMSPBhAZmYGOg4cROmYMZCp1PF1vwJYJMSSbQfZpjffwfYtm9966KGHf9r01pb7BosmTkzKY+NEfrAiImKM9X3hv397cX9/3y8XX7Dk+rETJxiZ2TnQIpmAmXKPWT9qdyoA0Dj6enqQkZkx+BuAccQGYvCQG+VSUkJjDAMDMfT0JKHrESjlVi4SEYQtYSZSQ99L5F7j8/sRyoigt/0gIsEQphcUwnQcHO/gDQVAYwzmwEA6LHmMDwkJCOHqXuEaaDQ0tj/9g1FaAChwAsxUCtA15fX6SEo1LC/tShuBSCSCrs5OlB7RPPeu9SklWTBAD//5vtd//bM771izoeWtPmAvAPz2s5/V6+rq7HdddJJ4r0CHklISYyzxnXvv/1TZvfff/qFLa+bkFBWVlFSOrLq69uprwpmZpByHjrXwlGkikpnpijUFgDEkE3F4Nc19oQBs00R2QSEuuXQqVqzYgKzMPCglEY3GMO38EqqcMM41tAz3aDgpJXgggJy8PDSvX48Z5eXI8/kQt+3jE1gp6IzBHhgYZiccCSmEy5VKALYAKQkFBUqnYwdH+LsfViBNh2nFoBuGIsZIseFigYjcJvJIBK179h73vunvJkiJQCDgm1uzYDI3ePsTb27uBTBw8913226MKb2z3idOKpL1vfnztR+98oqz13Gaf/nEymYAxZ+9etnnL192uWCMaSI96dV9MmDoOAJG4JqWXpcb0LeSKfgMj8stUoJ0DfZAHIuXLkTLtjZsb4kjFAyCa3FceOmHAVu4T5VOCCilAE1DfkkxpJSYkpf/nk+tlGvtykQCwnHAjw4JKQVICQUJchQgxJCrpNxhXK5YH0YhV19LKAZGx5YKUsIfCEBICdj2cQvuGWOkEklc8OFlUy64aOmUXes2ff/zm5sPbm9pfvmxp5+9l4gex+G3+76I/J4ETmczHACh6+ZXX1uzcNFHZ86ZvWjK7JmAEBCmmV44ucqN4O56pRAKRxCPxQBKW64E2KaFiK67+swRgOY2dUtb4ZqrFuP2O5owECVMnTEChWXlsBNJMP2oZRKQW1yMoOFBSTgEe9h5Scd4BrgiWqVSsG17uJ4mAMKVMKQApH1oYu5zHO5uZMPEu1ISmqZBSakgFeEY0WL3aAENum5AOM6J4+REEAMDkltCVo4cySpHjymEeXHtFRddWvvkM88+9fX/+uUn40p1ENH7IvJJ5YOvnnHejR+tra2vqVlYkVVe5vqLAzGhDM4xuOgjRBRjBNg28osK0d3ZJWA7fPBt2pYFYl6ApV+oVCDGIZIp5JWUYOnSybjvvhdw0UVfgLLEEHcNxiIHRV9ecREygwEENA3iBOIPgFvvzBiYZblHwHvdISvu3wYbzuASepBziQ5/hghQMp3sYFCQEELB5/NDmBZZlgnd5z32raWEOFG3pOv6KUdIBSHJtm1NJi1I21YcJMsrKsQtX/jSxfB5f0REn1IvvqjRopOfgXlcAg9abt+54drv/8sNNzSUjB8L2JZjR6MEAiPlNk8yDw3zPA53CCh4PR4Ul47gShxu1OKaBulI16sgcgmTTu85iRRqFs5GZnYY+QX5kLYNzt3vcrmKD7lK2QUFyAhHwJXCyTwtMQLZtjsC0UdHGTwKLocCdKzGNDcs57KNlEOCkhMhOxBUu3bswLjzZ5EzMDB0btPgu3CEQHZujmCcc3m0pCGCFA4Y46RlZRIsG2BxBXABxl27AJxgW0imEr3A+z8K/ngEpuuuu04AMJbOm/+vJROn2ImO/YprmsZ8huK6LhjXCH4/h+MoIRxiw03ItFuo3KK5wQSAlAiEQ0i19wIgKHKtUUgJxVwRyLmGGbNmQlgmyDAAuP6sy00chLR1mpWFiuIi99rBjXJCuJPahTyWt5GmmJRQgwJwUCAdEfxwzYt0+BQE206hrKiE1mzZiH0tzap0fBWJ/gFXgqXtBc45xowdy9UxzjJUSikThGdXPBRNJOL7CnJzRuVnZnvzMrO1oMcLZUvsP9CGJ595+rGv/fLuW9PG1vtyl45HYHXffffxuro6e+26dX+dPmXKzYGifPcvOgekQE97O95ZvwHBzAyqnjtXSikZYywd7sFQQGGIo92OMiiCams/SBWVIwHLdI9wJ5YOTLguih139S6lYxYgSlvirqEFIRAIBlFWUgwRjQGGMSzIcMwHAmAwhmNuBXcQpiuWGbmiehCkoFTa1Vc4QvmlM1iMoTgzR937mwfkh+qW8slzZwHxFIRjD/UiH7cbUkrHn5mr90ejT934lX+/1gOUT8sNFVVWja3MycwrVCBrzVtvvLWmtfPltOt46oyswcObvvHr339h1+5du+fPm3NFIBjM6u3rH2g90LZx946tL/3phTXv/Pz7X7tz1qUXz4eQlhMd0Bnn73KZ3JisBmEl8cwjL1Km7gHSA7hVOgLE1KClDTDQ0EYh5XK6wuGolJQSus8HLTsHVk8vDM97t5S4w1uEOzL4GHFh9wUygHHASXMyAUhL5MHuCZ5usZFKpiNsCh2d3VRUNJG//NQmtO7cjQs+fAm8kQwgnoBwhKsejrinlBIEcnhmrv7mU084v/nlb3+s6TosIfa81hnd89qqN1896v2dFjdJpV+M8+unXvjJr5964SdwTZEhJUWM4wu3/vRqx7SbPvaZTyzMrqgATNuBZZIjxOCmBzFO3Kuj8dd/gE5FSIgoBnp7EAhGXIeK0v+TCsRcUlI63KgIR5B26IEBzuArzEeieQt8RCevh49JXPf+LgezQcNnyD2TUsIwDEDYiMdj8BoeeDw+SNMChMC+A13QjAIUl41F2+59+N87/hfTF07FlBnTYEQigGlBpExJjBTTNMUDfgZN0155/GHr9h/958df27H3nXQoUtbW1rKqQ4cINTUAgC1btqh/pCbrZFJPVF+/kC9fvlJomqYcx6GVy5fzzi1bVFNTEx4gJpSS/Ia51V+5rPbKby659OK8nIoKQHMzIkhbqA//z5/QuttB+cgqtB3YhekVPlRPmwbTToFpblchEYE4cwmsaYBHd5MWjIE4A3ncvK+UEjwYxObXXkXi3j+jPCcHpuMc92EUAAPANsdB1Te+jqyMCIblZ23XNVK2A9jC9VnTcWnhOPDoXuzfvw8r12xEytHgYQ6Kc0KYXDUGwkrhwdVbkV1QCWGb0D0+WCkLne27oXuSGH1eBSZVT0Ju5Uh3MdEYNr6zDquff/65n9z6s2+3Am+ezoGl7yu3iGM72sQ5V+mWjfxPzKu+vnrunKsqxo8bk52bneUJR9i+rbvRuiNOxWWjQQB2bF2HkDaAm2/8KCzhgLgbuiTGhuqXiTM3K8RcopPG3ZKdwa4Bw0D7gYNovuOnOC8YREodzeeHoQAYSqFZKUz51jcQCQSghDgcOHEE1GD2yLIBW4KUhBQ2dMOLXdu34eHn3kJO0QT4PB5Yto1YfABk9yHa2wYjNEKNKB1LppmElAKcM2i6B2bSRH/vIcRibSq/PLxVOk7njubmNx9Z8eCK9b2pVwDg700inCzeL4GPi8baWn7tihVCHS7vyTSAHA3w/+Drtz03dtyUnEQipnZvf4v8gQi4puGSmeUoGzPWPTmFGMA0DMZMFANIM0C65lo4+mECDy7cIsKLt/0EkxIJCF13xfoxoIigOw5avD7M/NbX4UtPpXX/6CbkIRWUJaBsy00V2hJc19DffQh/bHwGBaXV0LiC4wgwRuBMgwAgHIH2tm0Qjo2SsnEwPD7YlgUp3cCGx+MXlpniP73j21esad35yNCalKLly4kaGk7vFNpT1gBe19QklJSU7pAjxlivw/n2BNH6pBldJ4WF7c2vy3BGLkorz4MvmIu1m7fDHeDtfgcRhnTuYDRsaAeKw0YN4MaODb8f3soKxJJJaCeIEhHgdhZEIsrj9eKITZi+r+vWEEsvQnO9AcaBZ158FZHssdA4wXFEWqwDjnCgHBucKZSWT0AonI2dW99E294tUFLA4w2AcR2mlVIEiclTp4xQSrE/3FjvTR86rU43cYFTP6NDNaxa5RCRklLSp2+6SYdS2Nay9tCOrW+hsHg0AuFcGYv2IhLORHsfsHvnDni8PigiKDZoOqf/DaYhBw3sI4IQg5Gm/IkT0C0EtBOUHDLGYDoO9NwcYvrwdtNhRXmMuRUYiqCHg9ja3IyOXkIkMwNO+rSXYUgT27ZN5OSNwKhxM8EYx65ta7FnxzuI9ndC4zoJx0Z/78H9RKSeSGyxz+SA8NM2L7q2tpb97u7f2QsmjJkxc8YF1xYWj5aOcHjr3q0oLRsLxzGRlVuO1Ws2orSsAsTT51gMvmywI+ZQuv+klEMFX+5syRRKx47FvsxMCNN0DbtjiGkGICUE/IWuL/+uvAHS0oPRUOWJIuDtDTuQmT0ifZTPCSQEudN1iAiZuSNkbkEF6+0+gK6Ofeg+tI8l4gPy9Xde3eoGZ5tOwds9eZy2KTuNjY1KQWFmdc0PKirP41JKlYj1w+Pxg3MNQgj4/T7ERQZeev116MGgO4Vu8M1zl4PloD96DAjHgT8SQWDyJPTG48cU0woAUwoxxhApGQE4zruDHYMimlxXSfN7cfBAK7r7BAKBEMQJ5modCc51dHbsR39fJ/ILR2Lk2BkoLpugKkdPoxs+8pXfAspfW9uI4z/RqcdpIXBax8j5VaNnjhk1+cKUmZIgcMu24PH4Abi73rJMFBSVYV1LJ5rXvw1POAPCSQf+OR0OSBxdkZgGMQaYJipmzcRBEHQcu2BJOg7MUBhZRYXptN0xCAy4KkFjgN+DrS074fFmAji5sYpEBCkFcnKL2EB/N2zbhG2lwLnG/MEsef6MxQtuXnb1HXV1daK+/swNBz9dBAYAnD/9gm8WFZaR7VgSSsHr9aO//xCIDreOCNtC8YiJePrF9WjZ8DY8mVmA5rZ/AEcRlbNhUSgickf+VlSApkxCX18/dE0bposZYzBNE3pFuQpFIscvfk+7aIwxSDOFffs6EQhlQoj3V0zhxpwPG24AYFlJZkvlTJs6/5aFY8tqbr311jM2HPx0EJjq6q4VZX4UFBWUXOq43QFcCIFgMIKAP4jtLW+AcQ6u6emuCYHisql46oVNeGJFEwAFw5f2VY8wselYcyaJoEwTU66+Cs0eHSqZBNe4WxsHQOMcUccROVMmO8C7nfgjoUBgXi+6DrYjNiDh8XqPOcnnmNcqCU3X0dvdhoA/PGxjMsbINBOsqHiUWjj3Q79TSgUbGxuPZQqccpxyAtfW1jJAYdL46vOysvJ9jnCkGyYn2LaFgqJKRDLzsHXTK0jG+2F4/ZBSQCkHpZWTsbNV4g93/x/27t4BLTsTzDAgCYf94aNARFC2jYzMDFTd/FmstW2oWBxejcPLOURfHw5lZ6OoarymUqkTjjFUSgGGjl0794BrQRApnIR0BqDAuY5EfACxWB+yckvgOMOL64kYSyaTclr1olGfveRDdxGRbKxtPO2TBk/5DQYr77OycrN93oBSUg4NEh3Uu3n5ZSirnITWXRtxoLUFhuFzLVEriRHlY+HLHI8V96/EEw88iKhIQcvJAhnG8BNXjgAxBplIonLMGMz41tfRnJevdg0MqB3xOLbk5WH0x2/gfq+X1HsYS0QE2BZ2b29DMJjlDoQ5SSYjxrBv13oUFo9Km+TvXqdUggvizrz5l99w1Yzqj9Y11YnTLapPuYgYbJCaUzV6yo21X3gnN79MWlaS0bCKfwmu6SAQWndthGkmUDpyMjzeACwzAU3TwLiBzoOtsJxOTJg2EtWzpyOSX+CGFVMpSJluCjuCq5WUYB4PHClxcF+r4rpGOYWFMNI12ics61EKTDfQ03EAf/2fJ5BfNAGOc+JrBq8zPD7s2roWvkAEhcWjYR3jfKcjnl0GAmFs2vBK7y/u/NH4g0p1/b2ZopPBKefghoYGqZRir27Zvm7LpjUPejSNEfFhlgoRg3QcCGGjbPRU5BSUYWfLGnR17IHHG4BSgGUmkFtYgoKCSdi6rhf33tmIh+/9K/bt2A4yOHg4BOb3gZgbdpRSQgEQqRS442BERTkVFRfDEOK9iZtuVIPHQMvGFjAeBrHjx7aHrlMShseH/bs3gWs6CkvGnJC46WdniWRcVlVNz/7wldd+hojU6bSqT0ugI52loUqiWzIys6fNmHVxWTQeFYzoyHoWAC4hM7MKEQpnY9/ODejv7cCIiokwDD9sKwUihvziMkgxAof2H8KDW59HONtAaWUhyipLUVhcgEAkAuiGG52QbtmrTLmHXp2o2RsAiHOQzwcmJVQqjq2b9iCSUQnh2O/OGx8Bd/i4D53tu5FIDGBM1WxY5omJe/hiCU0zZNAfKjv5t/r34XRFsuTy5cR2E3U88Nc7L+FEz02dsbQonogLIvAjNYM7hsiNFI0cPwtdHXuxs+UN5BVWIjO7GFIK2JYJIiA7Nw/ZeYVIxuPYsakXm99eA00XCGd4kZ2XgZz8bOTkZiErJwuRjAwAzC3DOV4xABEGBgbU/j17KZ5I4vXnnwOjEcjI8sKyjt+FMDjgrL/vELo69mLMhLlDkaz3glIKmm6gu/sga25582HAzfm+7zd8kjitZrqb53xAjDHUuOtv+Pyz1edfUpJIJISC5Me6tVISuuGFbaXQ29mGjJwiMD48/Dg4uohzDYNTYs1UCqlUApaVhFIONIOU5nHU+EnlYvKUKcwfCnDlDC94G+w5PrBvn0zaDkv09+Gpv72MispqqBPkAFS6bswyk9jR8gbGVJ3vnqwmxAk5fvBaEDmRYFh77oX7X/vp/90zV9UrOuIsx1OO03p2YVNTk3CPWF3dcs+ffrVEKvnE1BkXjbRsWyol3yXLiJjLrYwjt7DSDTIcxX2DSXrHsYZKtDw+A76Aa4lDAYxp1Na6k7y6ToGcLIhY/F01yYPuVfHo0SzW3Yk/Nj2H8opqtzzsBK/bnXggsHvH2ygfNQW64X2XS3Tca7mmfIZHe/utFw698PwjNymlsPzk/LC/G2ckJpomslMKVXnDxz/92JTpF46TgMJRM6WPxPH6eE6Ew22mgFIM3Z2bce2nr0RWTj7UMYigiGA6Fv74i3vg9Y1EMBR411kMwz4PBY3r2Ll1LTKzC5GTV/aeRtUgiEhFBzrRsnnNusefuO9TW/rtdfXu/M7TmjL8/wCG0cKIQjcmzwAAAABJRU5ErkJggg==" style={{width:56,height:56,objectFit:"contain",flexShrink:0}} />Cam Kết Vàng</div>
              {data.promises.map((p, i) => (
                <div className="promise-item" key={i}>
                  <span className="check">✓</span>
                  <span><span className="promise-bold">{p.text}</span> {p.detail}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="compare-box red-box">
                <div className="compare-title red" style={{display:"flex",alignItems:"center",gap:6}}><img src="data:image/png;base64,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" style={{width:56,height:56,objectFit:"contain",flexShrink:0}} /> Người Khác:</div>
                {data.othersItems.map((item, i) => (
                  <div className="compare-item" key={i}><span style={{color:"#f87171"}}>✗</span><span>{item}</span></div>
                ))}
              </div>
              <div className="compare-box green-box">
                <div className="compare-title green" style={{display:"flex",alignItems:"center",gap:6}}><img src="data:image/png;base64,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" style={{width:56,height:56,objectFit:"contain",flexShrink:0}} /><span>Nuôi Moonatics:</span></div>
                {data.meItems.map((item, i) => (
                  <div className="compare-item" key={i}><span className="check">✓</span><span>{item}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DONATE CTA ── */}
          <div className="donate-cta-box">
            <div className="donate-cta-title"><img src="data:image/png;base64,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" alt="" style={{width:56,height:56,objectFit:"contain",flexShrink:0}} /><span>DONATE NGAY ĐI, NẾU BẠN ĐANG CƯỜI!!</span></div>
            <div className="donate-cta-sub">
              Quét mã QR này để nuôi tôi (và nhận bản sao kê ngay lập tức!) hoặc vào link này <a href={data.donateLink} target="_blank" rel="noreferrer">{data.donateLink}</a>
            </div>
            <div className="qr-wrap">
              {data.qrUrl
                ? <img src={driveImg(data.qrUrl)} alt="QR Donate" className="qr-img" style={{borderRadius:12}} />
                : <img src="data:image/png;base64,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" alt="QR Donate" className="qr-img" style={{borderRadius:12}} />}
            </div>
            <div className="auto-mail">⚡ Chuyển xong là có tin nhắn tự động từ ngân hàng! ⚡</div>
            <a className="btn-donate" href={data.donateLink} target="_blank" rel="noreferrer">🎁 TÔI MUỐN NUÔI BẠN!</a>
          </div>

          {/* ── HEART MSG ── */}
          <div className="sec-heading"><img src="data:image/png;base64,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" alt="icon" style={{width:56,height:56,objectFit:"contain",verticalAlign:"middle",marginRight:4}} /> Lời Nhắn Từ Trái Tim</div>
          <div className="heart-box">
            {data.heartMessage.split("\n\n").map((para, i) => (
              <p className="heart-para" key={i}
                dangerouslySetInnerHTML={{__html: para
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/(HÃY NUÔI TÔI!)/g, '<span class="red">$1</span>')
                  .replace(/(KHÔNG MẤT LƯƠNG TÂM!)/g, '<strong>$1</strong>')
                }}
              />
            ))}
          </div>

          {/* ── DISCLAIMER ── */}
          <div className="disclaimer-box">
            ⚠️ <em><strong>DISCLAIMER:</strong> Đây không phải là một trang kêu gọi Donate, đây là một trang giải trí</em>
          </div>

        </div>}{/* /home content */}
      </div>{/* /page */}

      {/* ── ADMIN FAB ── */}
      <button className="admin-fab" onClick={() => isAdmin ? setShowCMS(true) : setShowLogin(true)} title="Admin CMS">
        {isAdmin ? "⚙️" : "🔒"}
      </button>

      {/* ── LOGIN ── */}
      {showLogin && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="modal" style={{maxWidth:380}}>
            <div className="modal-head">
              <span className="modal-title">🔐 Admin Login</span>
              <button className="modal-close" onClick={() => setShowLogin(false)}><CloseIcon /></button>
            </div>
            <div className="login-box">
              <div className="login-title">Đăng nhập CMS</div>
              <div className="login-sub">Nhập mật khẩu để chỉnh sửa nội dung.</div>
              {passErr && <div className="login-err">{passErr}</div>}
              <div className="field">
                <label>Mật khẩu</label>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && login()} placeholder="Nhập mật khẩu..." autoFocus />
              </div>
              <button className="btn-login" onClick={login}>Đăng nhập</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CMS ── */}
      {showCMS && <CMSPanel data={data} onSave={save} onClose={() => setShowCMS(false)} tab={tab} setTab={setTab} />}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ─── Members Page ─────────────────────────────────────────────────────────────
const MEMBERS_ACTIVE = [
  {
    name: "Red Spade", altName: "Ragakov, ZEROKZ", color: "#ef4444", icon: "♠",
    gender: "Nam", star: "Bạch Dương", vocal: "Male Countertenor", status: "Active",
    joined: "Oct 2024", roles: ["Producer", "Composer", "Lyricist", "Vocalist"],
    images: [null, null], // placeholders
    bio: "Nhóm trưởng của Moonatics. Làm kẻ ác thì thảnh thơi. Thẳng thắn, hài dón bựa đét nhưng lúc làm việc thì nghiêm túc và rất khách quan.",
    facts: ["Yêu Bọ Cạp hận Ma Kết", "Ông trùm ngôn ngữ", "Tư bản độc ác"],
    achievements: [{ title: "B2B Headliner - 1900 The Tunnel", date: "2023" }, { title: "Headliner - NOXX City : Path of Redemption", date: "2024" }, { title: "MC/Announcer - SEAGAME 31th", date: "2022" }],
  },
  {
    name: "Blue Clover", altName: "Tryle Huynh", color: "#3b82f6", icon: "♣",
    gender: "Nam", star: "Kim Ngưu", vocal: "Male Altor 2", status: "Active",
    joined: "Oct 2024", roles: ["Vocalist", "Composer", "Sub-Producer"],
    images: [null, null],
    bio: "Là giọng ca và sáng tác chính của Moonatics. Là một chàng trai lowkey, sống khá ẩn mình. Nếu RED là nhạc trưởng thì BLUE chính là tay nhạc công cừ khôi luôn ở cạnh để giúp đỡ.",
    facts: ["Là một người thích sống theo kiểu anh lớn, bao bọc các em", "Cut the bullshit, I just wanna do music with RED"],
    achievements: [{ title: "Á Quân Moisong mùa 1", date: "" }],
  },
  {
    name: "Purple Diamond", altName: "Romillia, Ana", color: "#a78bfa", icon: "♦",
    gender: "Nữ", star: "Ma Kết", vocal: "Female Altor", status: "Active",
    joined: "Dec 2024", roles: ["Vocalist", "Illustrator", "Streamer"],
    images: [null, null],
    bio: "Nhóc ác, em út của Moonatics. Luôn hô to khẩu hiệu \"Tôi nghèo, bạn cũng thế\". Mặc dù tuy rất xinh xắn nhưng tính cách thì vặn vẹo, nhưng được cái đáng thương.",
    facts: ["Tím là người vẽ toàn bộ các Emoji của Youtube Membership", "Thường xuyên ăn vặt, gần như lúc nào cũng đang ăn một thứ gì đó", "Luôn mồm than nghèo kể khổ"],
    achievements: [],
  },
  {
    name: "Silver Heart", altName: "Gii, ailagiang", color: "#ffffff", icon: "♥",
    gender: "Nữ", star: "Thiên Yết", vocal: "Female Altor", status: "Active",
    joined: "Apr 2025", roles: ["Vocalist", "Lyricist", "Composer"],
    images: [null, null],
    bio: "Thành viên ẩn, thành viên thứ 6 của nhóm. White thoắt ẩn thoắt hiện trong các sản phẩm và thường xuyên đứng trên cương diện hỗ trợ, vá lốp cho các thành viên khác.",
    facts: ["Trắng là một Gym Freak", "Đam mê nấu ăn và làm đẹp - House Wife Materials", "Người bí ẩn tồn tại vất vưởng trong Moonatics"],
    achievements: [],
  },
];

const MEMBERS_GRADUATED = [
  {
    name: "Pink Heart", altName: "MJA, MJA TRAN", color: "#ec4899", icon: "♥",
    gender: "Nữ", star: "Thiên Yết", vocal: "Female Mezzo Soprano", status: "Inactive",
    joined: "Oct 2024", roles: ["Vocalist", "Lyricist", "Composer"],
    images: [null, null],
    bio: "Thành viên nữ đầu tiên của Moonatics. Là một cô gái thùy mị nết na với niềm đam mê \"lổ\" nhà sếp. Bộ não bất thường nhất Moonatics. Luôn luôn vui tươi với phương châm \"Chúng mày sủa vãi mèo\".",
    facts: ["Như mọi bọ cạp khác, MJA rất hay \"nghiện mà ngại\"", "Rất thích sử dụng meme và thuật ngữ genZ"],
    achievements: [],
    extra: { color: "Hồng Neon", instruments: "Đàn ông, Guitar, Ukelele", likes: "Ngủ, ăn, xem meme", idols: "YOASOBI, Nicki Minaj, SZA, Ariana Grande" },
  },
];

const MEMBERS_SUPPORT = [
  {
    name: "Yellow Joker", altName: "Rimiyuu, Jin", emoji: "🃏", gender: "Nam",
    star: "Thiên Bình", vocal: "Male Alto", color: "Vàng",
    roles: ["Vocal Part Time", "Community Manager", "Discord Manager"],
    images: [null],
    desc: "Quản lý Discord server và cộng đồng Moonatics. Giọng hát trầm ấm, đảm nhận các bài cover part time.",
  },
  {
    name: "Golden Joker", altName: "Sheico", emoji: "🌟", gender: "Nam",
    star: "Bọ Cạp", vocal: "Male Tenor", color: "Gold",
    roles: ["Vocal Part Time", "Video Editor", "Lyricist"],
    images: [null],
    desc: "Nhân tố đa năng của nhóm — vừa viết lời, vừa chỉnh video, vừa hát part time.",
  },
  {
    name: "Dương Chó Điên", altName: "Dương Chiến Đo", emoji: "🐕", gender: "Nam",
    star: "Xử Nữ", vocal: "60.000Hz", color: "Shiba Inu",
    roles: ["Video Editor", "Designer"],
    images: [null],
    desc: "Người chịu trách nhiệm về hình ảnh và video của nhóm. Tần số vocal đặc biệt không thể nhầm lẫn.",
  },
];

const MEMBERS_GUEST = [
  { name: "midaoli",       role: "Lyricist",            since: "Oct 2024", emoji: "✍️" },
  { name: "Fuongemyeu",    role: "Vocalist",            since: "Jan 2025", emoji: "🎤" },
  { name: "Remind",        role: "Vocalist",            since: "Jun 2025", emoji: "🎵" },
  { name: "Sheico",        role: "Vocalist, Lyricist",  since: "May 2025", emoji: "🎶" },
  { name: "Kitakara Tome", role: "Vocalist",            since: "Jun 2025", emoji: "🌸" },
  { name: "Vân Vân",       role: "Vocalist",            since: "Jun 2025", emoji: "☁️" },
  { name: "Astera Lycka",  role: "Vocalist",            since: "Jun 2025", emoji: "⭐" },
];

function ProfileSlider({ images, color, name }) {
  const [idx, setIdx] = useState(0);
  const validImages = (images || []).filter(Boolean);
  const count = images?.length || 1;
  const current = images?.[idx];
  return (
    <div className="profile-slider">
      <div className="profile-slider-track">
        {count > 1 && <button className="profile-slider-btn prev" onClick={() => setIdx(i => (i-1+count)%count)}>‹</button>}
        {current
          ? <ZoomImg src={driveImg(current)} alt={name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
          : <div className="profile-slide-placeholder">
              <span style={{fontSize:48,color,WebkitTextFillColor:color}}>{name?.charAt(0)}</span>
              <span style={{fontSize:10,color:"rgba(196,181,253,0.4)"}}>Ảnh {idx+1}/{count}</span>
            </div>
        }
        {count > 1 && <button className="profile-slider-btn next" onClick={() => setIdx(i => (i+1)%count)}>›</button>}
      </div>
      {count > 1 && <div className="profile-slider-dots">
        {Array.from({length:count}).map((_,i) => (
          <div key={i} className={`profile-slider-dot${i===idx?" active":""}`} onClick={() => setIdx(i)} />
        ))}
      </div>}
    </div>
  );
}

function MemberDetailCard({ m, memberImages }) {
  const images = memberImages?.[m.name] || m.images || [null];
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${m.color}44`,borderLeft:`4px solid ${m.color}`,borderRadius:16,padding:20,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:20,marginBottom:14}}>
        <ProfileSlider images={images} color={m.color} name={m.name} />
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:32,color:m.color,fontWeight:900,lineHeight:1,WebkitTextFillColor:m.color,filter:`drop-shadow(0 0 6px ${m.color}88)`}}>{m.icon}</span>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:"#e2d9f3"}}>{m.name}</div>
              <div style={{fontSize:11,color:"rgba(196,181,253,0.5)"}}>aka {m.altName}</div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right",fontSize:11}}>
              <div style={{color: m.status==="Active" ? "#a78bfa" : "#f87171", fontWeight:700,marginBottom:3}}>{m.status}</div>
              <div style={{color:"rgba(196,181,253,0.5)"}}>Từ {m.joined}</div>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,margin:"10px 0"}}>
            {m.roles.map((r,i) => <span key={i} className="vocalist-tag">{r}</span>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:11,color:"rgba(196,181,253,0.6)",marginBottom:10}}>
            <span>⚧ {m.gender}</span><span>⭐ {m.star}</span>
            <span>🎙️ {m.vocal}</span>
          </div>
          <div style={{fontSize:12,color:"rgba(196,181,253,0.75)",lineHeight:1.7}}>{m.bio}</div>
        </div>
      </div>
      {m.facts?.length > 0 && <div style={{borderTop:"1px solid rgba(139,92,246,0.15)",paddingTop:10,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(196,181,253,0.4)",textTransform:"uppercase",marginBottom:6}}>Fun Facts</div>
        {m.facts.map((f,i) => <div key={i} style={{fontSize:11,color:"rgba(196,181,253,0.65)",marginBottom:3}}>• {f}</div>)}
      </div>}
      {m.achievements?.filter(a=>a.title).length > 0 && <div style={{marginTop:10,borderTop:"1px solid rgba(139,92,246,0.15)",paddingTop:10}}>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(196,181,253,0.4)",textTransform:"uppercase",marginBottom:6}}>Thành Tích</div>
        {m.achievements.filter(a=>a.title).map((a,i) => <div key={i} style={{fontSize:11,color:"rgba(196,181,253,0.7)",marginBottom:2}}>🏅 {a.title} {a.date && `(${a.date})`}</div>)}
      </div>}
    </div>
  );
}

function MembersPage({ data }) {
  const [tab, setTab] = useState("active");
  const memberImages = data?.memberImages || {};
  const activeMembers = data?.membersActive || MEMBERS_ACTIVE;
  const graduatedMembers = data?.membersGraduated || MEMBERS_GRADUATED;
  const supportMembers = data?.membersSupport || MEMBERS_SUPPORT;
  const guestMembers = data?.membersGuest || MEMBERS_GUEST;
  return (
    <div className="inner-page">
      <div className="page-title">👥 Thành Viên</div>
      <div className="member-tabs">
        {[["active","♠ Active"],["graduated","🎓 Graduated"],["support","🛠️ Supportee"],["guest","🎤 Khách Mời"]].map(([id,label]) => (
          <button key={id} className={`member-tab${tab===id?" active":""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "active" && <div>{activeMembers.map((m,i) => <MemberDetailCard key={i} m={m} memberImages={memberImages} />)}</div>}

      {tab === "graduated" && <div>
        <div style={{fontSize:12,color:"rgba(196,181,253,0.5)",marginBottom:16,padding:"10px 14px",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10}}>
          Các thành viên đã tốt nghiệp khỏi Moonatics. Cảm ơn vì những đóng góp của họ! 💙
        </div>
        {graduatedMembers.map((m,i) => <MemberDetailCard key={i} m={m} memberImages={memberImages} />)}
      </div>}

      {tab === "support" && <div>
        <div style={{fontSize:12,color:"rgba(196,181,253,0.5)",marginBottom:20,padding:"10px 14px",background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:10}}>
          Các thành viên vệ tinh của nhóm — hỗ trợ từ hậu trường.
        </div>
        <div className="supportee-grid">
          {supportMembers.map((m,i) => (
            <div className="supportee-card" key={i}>
              <div style={{width:"100%",aspectRatio:"1/1",borderRadius:12,overflow:"hidden",marginBottom:14,border:"1px solid rgba(139,92,246,0.2)"}}>
                {memberImages?.[m.name]?.[0]
                  ? <ZoomImg src={driveImg(memberImages[m.name][0])} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  : <div style={{width:"100%",height:"100%",background:"rgba(139,92,246,0.08)",border:"1px dashed rgba(139,92,246,0.3)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:11,color:"rgba(196,181,253,0.4)",gap:6}}>
                      <span style={{fontSize:36}}>{m.emoji}</span><span>Placeholder</span>
                    </div>
                }
              </div>
              <div className="supportee-top">
                <div className="supportee-info-top">
                  <div className="supportee-name">{m.name}</div>
                  <div className="supportee-alt">aka {m.altName}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                    {m.roles.map((r,j) => <span key={j} className="vocalist-tag">{r}</span>)}
                  </div>
                </div>
              </div>
              {m.desc && <div style={{fontSize:11,color:"rgba(196,181,253,0.65)",lineHeight:1.5,margin:"10px 0 0",borderTop:"1px solid rgba(139,92,246,0.15)",paddingTop:10}}>{m.desc}</div>}
              <div className="supportee-meta">
                <div className="supportee-meta-row"><span>⚧ Giới tính</span><span style={{color:"#e2d9f3"}}>{m.gender}</span></div>
                <div className="supportee-meta-row"><span>⭐ Chòm sao</span><span style={{color:"#e2d9f3"}}>{m.star}</span></div>
                <div className="supportee-meta-row"><span>🎙️ Vocal Range</span><span style={{color:"#e2d9f3"}}>{m.vocal}</span></div>
                <div className="supportee-meta-row"><span>🎨 Màu sắc</span><span style={{color:"#e2d9f3"}}>{m.color}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {tab === "guest" && (
        <div className="music-table-wrap">
          <table className="music-table">
            <thead><tr><th>#</th><th>Tên</th><th>Vai trò</th><th>Xuất hiện từ</th></tr></thead>
            <tbody>
              {guestMembers.map((g,i) => (
                <tr key={i}>
                  <td>
                    {memberImages?.[g.name]?.[0]
                      ? <img src={driveImg(memberImages[g.name][0])} alt={g.name} style={{width:36,height:36,borderRadius:8,objectFit:"cover",display:"block",cursor:"default"}} />
                      : <div style={{width:36,height:36,borderRadius:8,background:"rgba(139,92,246,0.1)",border:"1px dashed rgba(139,92,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{g.emoji}</div>
                    }
                  </td>
                  <td style={{fontWeight:700,color:"#e2d9f3"}}>{g.name}</td>
                  <td>{g.role.split(", ").map((r,j) => <span key={j} className="vocalist-tag">{r}</span>)}</td>
                  <td style={{color:"rgba(196,181,253,0.5)",fontSize:11}}>{g.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Original Tab ──────────────────────────────────────────────────────────────
function OriginalTab({ releases }) {
  const [detail, setDetail] = useState(null);

  if (detail !== null && releases[detail]) {
    const r = releases[detail];
    const ytId = r.mvLink ? (r.mvLink.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]) : null;
    return (
      <div style={{animation:"fadeIn .25s ease"}}>
        <button onClick={() => setDetail(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#a78bfa",fontSize:13,cursor:"pointer",marginBottom:20,padding:0}}>
          ← Quay lại danh sách
        </button>
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.4fr)",gap:24}}>
          {/* Left: artwork + meta */}
          <div>
            <div style={{borderRadius:16,overflow:"hidden",aspectRatio:"1/1",background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.2)",marginBottom:16}}>
              {r.artwork
                ? <ZoomImg src={driveImg(r.artwork)} alt={r.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64}}>🎵</div>
              }
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:10}}>
              {[
                ["🎤 Vocal", r.vocal],
                ["🎼 Composer", r.composer],
                ["🎹 Producer", r.producer],
                ["✍️ Lyrics", r.lyrics],
                ["📅 Release", r.date],
              ].map(([k,v]) => v ? (
                <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,borderBottom:"1px solid rgba(139,92,246,0.1)",paddingBottom:8}}>
                  <span style={{color:"rgba(196,181,253,0.55)"}}>{k}</span>
                  <span style={{color:"#e2d9f3",fontWeight:600,textAlign:"right",maxWidth:"60%"}}>{v}</span>
                </div>
              ) : null)}
              {/* Streaming links */}
              {(r.spotifyLink || r.appleMusicLink || r.zingLink || r.nctLink) && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingTop:4}}>
                  {r.spotifyLink && <a href={r.spotifyLink} target="_blank" rel="noreferrer" style={{background:"#1DB954",color:"#000",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,textDecoration:"none"}}>▶ Spotify</a>}
                  {r.appleMusicLink && <a href={r.appleMusicLink} target="_blank" rel="noreferrer" style={{background:"#FA243C",color:"#fff",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,textDecoration:"none"}}>🍎 Apple Music</a>}
                  {r.zingLink && <a href={r.zingLink} target="_blank" rel="noreferrer" style={{background:"#005BFF",color:"#fff",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,textDecoration:"none"}}>♫ Zing MP3</a>}
                  {r.nctLink && <a href={r.nctLink} target="_blank" rel="noreferrer" style={{background:"rgba(139,92,246,0.3)",color:"#c4b5fd",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,textDecoration:"none"}}>🎵 Nhaccuatui</a>}
                </div>
              )}
            </div>
          </div>
          {/* Right: title + MV embed */}
          <div>
            <div style={{fontSize:22,fontWeight:900,color:"#e2d9f3",marginBottom:4,lineHeight:1.3}}>{r.title}</div>
            <div style={{fontSize:12,color:"rgba(196,181,253,0.5)",marginBottom:20}}>{r.date}</div>
            {ytId
              ? <div style={{borderRadius:14,overflow:"hidden",aspectRatio:"16/9",background:"#000"}}>
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title={r.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{display:"block"}}
                  />
                </div>
              : r.mvLink
                ? <a href={r.mvLink} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(139,92,246,0.2)",border:"1px solid rgba(139,92,246,0.4)",color:"#c4b5fd",padding:"12px 20px",borderRadius:12,fontSize:13,fontWeight:700,textDecoration:"none"}}>▶ Xem MV</a>
                : <div style={{color:"rgba(196,181,253,0.3)",fontSize:13,padding:"40px 0"}}>Chưa có link MV</div>
            }
            {r.description && (
              <div style={{marginTop:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:12,padding:"16px 18px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(196,181,253,0.45)",letterSpacing:"0.08em",marginBottom:10,textTransform:"uppercase"}}>🎤 Lyrics</div>
                <div style={{fontSize:13,color:"rgba(196,181,253,0.8)",lineHeight:2,whiteSpace:"pre-wrap",fontFamily:"Be Vietnam Pro, sans-serif"}}>
                  {r.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!releases || releases.length === 0) {
    return (
      <div style={{textAlign:"center",padding:"60px 0",color:"rgba(196,181,253,0.4)"}}>
        <div style={{fontSize:48,marginBottom:12}}>🎵</div>
        <div style={{fontSize:14}}>Chưa có bản nhạc gốc nào. Hãy thêm qua CMS!</div>
      </div>
    );
  }

  // Display newest first (last added = index 0 after CMS prepend)
  const displayed = [...releases].reverse();
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
      {displayed.map((r, i) => {
        const origIdx = releases.length - 1 - i;
        return (
        <div key={origIdx} onClick={() => setDetail(origIdx)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"transform .2s, box-shadow .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 30px rgba(139,92,246,0.25)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
          <div style={{aspectRatio:"1/1",background:"rgba(139,92,246,0.1)"}}>
            {r.artwork
              ? <ZoomImg src={driveImg(r.artwork)} alt={r.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
              : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🎵</div>
            }
          </div>
          <div style={{padding:"12px 14px"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#e2d9f3",marginBottom:3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.title}</div>
            <div style={{fontSize:10,color:"rgba(196,181,253,0.45)"}}>{r.date}</div>
            {r.vocal && <div style={{fontSize:10,color:"rgba(196,181,253,0.55)",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>🎤 {r.vocal}</div>}
          </div>
        </div>
        );
      })}
    </div>
  );
}

// ─── Music Page ────────────────────────────────────────────────────────────────
const COVERS_2024 = [
  { title:"Bản Ngã Trong Tôi", orig:"KAIBUTSU - YOASOBI", lyricist:"midaoli", vocalist:"RED, BLUE, PURPLE, PINK", date:"Oct 30, 2024", link:"https://moonatics.fanlink.tv/BNTT" },
  { title:"Nàng Thỏ Mê Hoặc", orig:"Bunny Girl - AKASAKI", lyricist:"midaoli", vocalist:"RED, PINK", date:"Nov 7, 2024", link:"https://moonatics.fanlink.tv/NTMH" },
  { title:"Giả Dối Chính là Tình Yêu", orig:"Mephisto - QUEEN BEE", lyricist:"midaoli", vocalist:"RED, BLUE", date:"Nov 14, 2024", link:"https://moonatics.fanlink.tv/GDCLTY" },
  { title:"Dưới Tán Cây", orig:"UNDER THE TREE - SiM", lyricist:"midaoli", vocalist:"RED, BLUE", date:"Nov 21, 2024", link:"https://moonatics.fanlink.tv/DuoiTanCay" },
  { title:"Điệu Nhảy Trong Đêm", orig:"Night Dancer - imase", lyricist:"midaoli", vocalist:"PINK", date:"Nov 28, 2024", link:"https://moonatics.fanlink.tv/DNTD" },
  { title:"Nhà Tập Thể", orig:"APT - Rosé, Bruno Mars", lyricist:"RED, WHITE", vocalist:"RED, BLUE, SILVER", date:"Dec 8, 2024", link:"https://moonatics.fanlink.tv/NhaTapThe" },
  { title:"Chạy Vào Màn Đêm", orig:"Yoruni Kakeru - YOASOBI", lyricist:"midaoli", vocalist:"BLUE", date:"Dec 15, 2024", link:"https://moonatics.fanlink.tv/CVMD" },
  { title:"Ngôi Sao Dối Trá", orig:"IDOL - YOASOBI", lyricist:"midaoli (verse 1, chorus 1), RED, PINK", vocalist:"PINK", date:"Dec 21, 2024", link:"https://moonatics.fanlink.tv/NSDT" },
  { title:"Chắc Vậy", orig:"Tabun - YOASOBI", lyricist:"midaoli, PINK (minor fix)", vocalist:"PINK", date:"Dec 26, 2024", link:"https://moonatics.fanlink.tv/ChacVay" },
];

const COVERS_2025 = [
  { title:"Ngôi Sao Ấy Chắc Vẫn Vậy", orig:"Comet, Tabun - Yoasobi", lyricist:"midaoli, RED (mashup arrange)", vocalist:"PINK", date:"Jan 2, 2025", link:"https://moonatics.fanlink.tv/NSACVV" },
  { title:"GIẢI", lyricist:"midaoli", orig:"Unravel - TK from 凛として時雨", vocalist:"RED, BLUE", date:"Jan 9, 2025", link:"https://moonatics.fanlink.tv/Giai" },
  { title:"Sủa Vãi Mèo", lyricist:"RED, PINK", orig:"Usseewa - Ado", vocalist:"PINK", date:"Jan 16, 2025", link:"https://moonatics.fanlink.tv/SuaVaiMeo" },
  { title:"Ngôi Sao Dịu Êm", lyricist:"midaoli", orig:"Comet - Yoasobi", vocalist:"PINK", date:"Jan 23, 2025", link:"https://moonatics.fanlink.tv/NSDE" },
  { title:"Thời Đại Mới", lyricist:"midaoli", orig:"NEW GENESIS - Ado", vocalist:"PURPLE", date:"Jan 30, 2025", link:"https://moonatics.fanlink.tv/ThoiDaiMoi" },
  { title:"Cánh Bướm", lyricist:"midaoli, RED (minor fix)", orig:"Butterfly - Wada Kouji", vocalist:"RED", date:"Feb 6, 2025", link:"https://moonatics.fanlink.tv/CanhBuom" },
  { title:"Sao Bắc Cực", lyricist:"RED", orig:"Polaris - BLUE ENCOUNTER", vocalist:"RED", date:"Feb 13, 2025", link:"https://moonatics.fanlink.tv/SaoBacCuc" },
  { title:"Lam Điểu", lyricist:"RED, PINK", orig:"Blue Bird - Ikimonogakari", vocalist:"PINK", date:"Feb 18, 2025", link:"https://moonatics.fanlink.tv/LamDieu" },
  { title:"Hắc Ảnh", lyricist:"RED, PINK", orig:"Silhouette - KANA-BOON", vocalist:"PINK, RED, BLUE", date:"Feb 23, 2025", link:"https://moonatics.fanlink.tv/HacAnh" },
  { title:"Lọ Lem & Hoàng Tử", lyricist:"midaoli", orig:"Cendrillon - Hatsune Miku x KAITO", vocalist:"PURPLE, RED", date:"Mar 5, 2025", link:"https://moonatics.fanlink.tv/LLVHT" },
  { title:"Điệu Nhảy Quá Liều Trong Đêm", lyricist:"midaoli, RED (mashup arrange)", orig:"Night Dancer, Overdose", vocalist:"RED, BLUE", date:"Mar 10, 2025", link:"https://moonatics.fanlink.tv/DNQLTD" },
  { title:"Siêu Nhân Cuồng Phong, Tham Chiến!", lyricist:"midaoli", orig:"Hurricaneger Sanjou!", vocalist:"RED, PURPLE, YELLOW", date:"Mar 15, 2025", link:"https://moonatics.fanlink.tv/SNCPTC" },
  { title:"Đẹp xinh thay phần bạn mình xin lỗi", lyricist:"Moonatics", orig:"Kawaikute Gomen", vocalist:"SILVER", date:"Mar 20, 2025", link:"https://moonatics.fanlink.tv/DXTPBMXL" },
  { title:"Lộng Ngôn", lyricist:"RED, BLUE (minor fix)", orig:"ITTE - Yorushika", vocalist:"BLUE", date:"Mar 25, 2025", link:"https://moonatics.fanlink.tv/LongNgon" },
  { title:"Tình Đầu", lyricist:"RED", orig:"First Love - Utada Hikaru", vocalist:"Fuongemyeu", date:"Mar 30, 2025", link:"https://moonatics.fanlink.tv/TinhDau" },
  { title:"LAM", lyricist:"Moonatics", orig:"BLUE - BIG BANG", vocalist:"RED", date:"Apr 4, 2025", link:"https://moonatics.fanlink.tv/Lam" },
  { title:"Phúc Lành", lyricist:"midaoli", orig:"The Blessing - Yoasobi", vocalist:"PURPLE", date:"Apr 9, 2025", link:"https://moonatics.fanlink.tv/PhucLanh" },
  { title:"Mộng Ảo Thiên Mã", lyricist:"RED", orig:"Pegasus Fantasy - MAKE-UP", vocalist:"RED", date:"Apr 14, 2025", link:"https://moonatics.fanlink.tv/MATM" },
  { title:"Vũ Công", lyricist:"SILVER", orig:"odoriko - Vaundy", vocalist:"SILVER", date:"Apr 19, 2025", link:"https://moonatics.fanlink.tv/VuCong" },
  { title:"Khi cuộc đời cho bạn màu cam", lyricist:"RED, BLUE", orig:"Orange - 7!!", vocalist:"BLUE", date:"Apr 24, 2025", link:"https://moonatics.fanlink.tv/KCDCBMC" },
  { title:"Hạ Không", lyricist:"RED, BLUE", orig:"Summertime - Cinnamons x Evening Cinema", vocalist:"SILVER, BLUE", date:"May 4, 2025", link:"https://moonatics.fanlink.tv/HaKhong" },
  { title:"Thần Tình Yêu Ngâu Vãi Mèo", lyricist:"SILVER", orig:"CUPID - FIFTY FIFTY", vocalist:"SILVER", date:"May 9, 2025", link:"https://moonatics.fanlink.tv/TTYNVM" },
  { title:"Lỡ Cưới Phải Lo", lyricist:"RED", orig:"Tháp Rơi Tự Do - LBI利比", vocalist:"RED, Fuongemyeu", date:"May 10, 2025", link:"https://moonatics.fanlink.tv/LCPL" },
  { title:"Tàn Dư", lyricist:"RED", orig:"Haruna Kanata - ASIAN KUNG-FU GENERATION", vocalist:"BLUE", date:"May 14, 2025", link:"https://moonatics.fanlink.tv/TanDu" },
  { title:"Luận Điểm Của Thiên Sứ Tàn Khóc", lyricist:"RED, PINK, SILVER", orig:"A Cruel Angel's Thesis", vocalist:"SILVER", date:"May 16, 2025", link:"https://moonatics.fanlink.tv/LDCTSTK" },
  { title:"Dấu Hiệu", lyricist:"RED", orig:"SIGN - FLOW", vocalist:"RED", date:"May 21, 2025", link:"https://moonatics.fanlink.tv/DH" },
  { title:"Khúc Bing Chling Ca Lỉnh Chi", lyricist:"SILVER", orig:"Ai♡Scream! - AiScReam", vocalist:"SILVER", date:"May 26, 2025", link:"https://moonatics.fanlink.tv/KBCLC" },
  { title:"Nhát Súng Định Mệnh", lyricist:"PURPLE, GOLDEN", orig:"Only My Railgun - Fripside", vocalist:"PURPLE, GOLDEN", date:"May 31, 2025", link:"https://moonatics.fanlink.tv/NSDM" },
  { title:"Anh Hùng", lyricist:"SILVER", orig:"Yuusha - YOASOBI", vocalist:"SILVER", date:"Jun 5, 2025", link:"https://moonatics.fanlink.tv/AnhHung" },
  { title:"Khát Vọng", lyricist:"midaoli", orig:"Hollow Hunger - OxT", vocalist:"BLUE", date:"Jun 10, 2025", link:"https://moonatics.fanlink.tv/KhatVong" },
  { title:"Em Muốn Hấp Anh", lyricist:"SILVER", orig:"Love Trap Muchuu - MAISONdes", vocalist:"SILVER", date:"Jun 15, 2025", link:"https://moonatics.fanlink.tv/EMHA" },
  { title:"Táo Hỏng", lyricist:"RED", orig:"BAD APPLE - TOUHOU", vocalist:"VânVân", date:"Jun 27, 2025", link:"https://moonatics.fanlink.tv/TH" },
  { title:"Bling Bang Bang Born", lyricist:"RED, midaoli", orig:"Bling Bang Bang Born - Creepy Nuts", vocalist:"BLUE", date:"Jul 4, 2025", link:"https://moonatics.fanlink.tv/BBBB" },
  { title:"Vũ Điệu", lyricist:"SILVER", orig:"Odo - Ado", vocalist:"SILVER", date:"Jul 11, 2025", link:"https://moonatics.fanlink.tv/vudieu" },
  { title:"Dương", lyricist:"BLUE", orig:"Blue - Yungkai", vocalist:"RED", date:"Jul 18, 2025", link:"https://moonatics.fanlink.tv/Duong" },
  { title:"Đứa Trẻ Đố Kỵ", lyricist:"RED", orig:"Envybaby - Kanaria", vocalist:"KitakaraTome", date:"Jul 25, 2025", link:"https://moonatics.fanlink.tv/DTDK" },
  { title:"VUA", lyricist:"RED", orig:"KING - Kanaria", vocalist:"Remind", date:"Aug 1, 2025", link:"https://moonatics.fanlink.tv/VUA" },
  { title:"Kẻ Say Khờ", lyricist:"BLUE", orig:"Yoidore Shirazu - Kanaria", vocalist:"BLUE", date:"Aug 8, 2025", link:"https://moonatics.fanlink.tv/KeSayKho" },
  { title:"Nữ Hoàng", lyricist:"PURPLE, RED", orig:"QUEEN - Kanaria", vocalist:"PURPLE", date:"Aug 8, 2025", link:"https://moonatics.fanlink.tv/nuhoang" },
  { title:"Ma Vương", lyricist:"PINK", orig:"Demon Lord - Kanaria", vocalist:"PINK", date:"Aug 8, 2025", link:"https://moonatics.fanlink.tv/mavuong" },
  { title:"Mắt Dưới", lyricist:"SILVER", orig:"EYE - Kanaria", vocalist:"SILVER", date:"Aug 8, 2025", link:"https://moonatics.fanlink.tv/MatDuoi" },
  { title:"Thế Giới Của Em", lyricist:"PINK", orig:"World is mine - Hatsune Miku", vocalist:"PINK", date:"Aug 15, 2025", link:"https://moonatics.fanlink.tv/TGCE" },
  { title:"Chanh", lyricist:"PINK", orig:"Lemon - Kenshi Yonezu", vocalist:"RED", date:"Aug 22, 2025", link:"https://moonatics.fanlink.tv/chanh" },
  { title:"Chiến Đội Quyền Thú GekiRanger", lyricist:"RED", orig:"Gekiranger OP", vocalist:"BLUE", date:"Aug 29, 2025", link:"https://moonatics.fanlink.tv/ChienDoiQuyenThu" },
  { title:"Tầm nhìn", lyricist:"RED, PINK", orig:"Vision - Kamen Rider Zetz", vocalist:"PINK", date:"Sep 7, 2025", link:"https://moonatics.fanlink.tv/TamNhin" },
  { title:"Vòng Lặp Tình Yêu", lyricist:"SILVER", orig:"Renai Circulation - Kana Hanazawa", vocalist:"SILVER", date:"Sep 12, 2025", link:"https://moonatics.fanlink.tv/VongLapTinhYeu" },
  { title:"Tán Anh Đào", lyricist:"PINK", orig:"SAKURA - IKIMONOGAKARI", vocalist:"PINK", date:"Sep 19, 2025", link:"https://moonatics.fanlink.tv/TanAnhDao" },
  { title:"Hành Trình Đột Xuất", lyricist:"RED", orig:"SURPRISE DRIVE - Kamen Rider Drive", vocalist:"RED", date:"Sep 26, 2025", link:"https://moonatics.fanlink.tv/HanhTrinhDotXuat" },
  { title:"IRIS OUT", lyricist:"BLUE", orig:"IRIS OUT - Chainsaw Man", vocalist:"BLUE", date:"Oct 3, 2025", link:"" },
  { title:"Giả Tạo", lyricist:"SILVER", orig:"Phony - Kafu", vocalist:"SILVER", date:"Oct 10, 2025", link:"" },
  { title:"Điên lên nào nhóc", lyricist:"RED", orig:"KYORAN HEY KIDS - THE ORAL CIGARETTES", vocalist:"BLUE", date:"Oct 17, 2025", link:"" },
  { title:"JANE DOE", lyricist:"SILVER", orig:"JANE DOE - Chainsaw Man", vocalist:"SILVER, BLUE", date:"Oct 24, 2025", link:"" },
  { title:"Mãi Bên Tôi", lyricist:"PINK", orig:"Itsumo Nando Demo - Spirited Away", vocalist:"PINK", date:"Oct 31, 2025", link:"" },
];

const ALL_COVERS = [
  ...[...COVERS_2025].reverse().map(s => ({...s, year:"2025"})),
  ...[...COVERS_2024].reverse().map(s => ({...s, year:"2024"})),
];
// ALL_COVERS is mutable — CMS can splice in new songs at the front

function LyricsModal({ song, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"20px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1a0f2e",border:"1px solid rgba(139,92,246,0.35)",borderRadius:18,padding:"28px 30px",maxWidth:540,width:"100%",maxHeight:"80vh",overflowY:"auto",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:18,background:"none",border:"none",color:"rgba(196,181,253,0.5)",fontSize:22,cursor:"pointer",lineHeight:1}}>✕</button>
        <div style={{fontSize:16,fontWeight:800,color:"#e2d9f3",marginBottom:4}}>{song.title}</div>
        <div style={{fontSize:11,color:"rgba(196,181,253,0.45)",marginBottom:16}}>✍️ {song.lyricist || "—"} &nbsp;|&nbsp; 🎵 {song.orig}</div>
        <div style={{fontSize:13,color:"rgba(220,210,255,0.85)",lineHeight:2.1,whiteSpace:"pre-wrap",fontFamily:"Be Vietnam Pro, sans-serif"}}>
          {song.lyrics || "(Chưa có lyrics)"}
        </div>
      </div>
    </div>
  );
}

function MusicTable({ songs }) {
  const PER_PAGE = 50;
  const [page, setPage] = useState(0);
  const [lyricsFor, setLyricsFor] = useState(null);
  const totalPages = Math.ceil(songs.length / PER_PAGE);
  const pageSongs = songs.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  return (
    <>
    {lyricsFor && <LyricsModal song={lyricsFor} onClose={() => setLyricsFor(null)} />}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,fontSize:12,color:"rgba(196,181,253,0.55)"}}>
      <span>{songs.length} bài • Trang {page+1}/{totalPages}</span>
      <div style={{display:"flex",gap:6}}>
        {Array.from({length:totalPages},(_,i)=>(
          <button key={i} onClick={()=>setPage(i)} style={{padding:"3px 10px",borderRadius:6,border:"1px solid rgba(139,92,246,0.3)",background:page===i?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.03)",color:page===i?"#c4b5fd":"rgba(196,181,253,0.5)",cursor:"pointer",fontSize:11}}>{i+1}</button>
        ))}
      </div>
    </div>
    <div className="cover-list">
      {pageSongs.map((s, i) => (
        <div key={i} className="cover-card">
          {/* Artwork / number */}
          {s.artwork
            ? <ZoomImg src={driveImg(s.artwork)} alt={s.title} style={{width:56,height:56,borderRadius:8,objectFit:"cover",display:"block",flexShrink:0}} />
            : <div className="cover-art" style={{color:"rgba(196,181,253,0.3)",fontSize:11,textAlign:"center",lineHeight:1.2}}>{page * PER_PAGE + i + 1}</div>
          }
          <div className="cover-info">
            <div className="cover-title">
              {s.year && <span style={{fontSize:9,background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.25)",borderRadius:4,padding:"1px 5px",marginRight:6,color:"rgba(196,181,253,0.55)"}}>{s.year}</span>}
              {s.title}
            </div>
            <div className="cover-meta">
              {s.orig && <span>🎵 <b>{s.orig}</b></span>}
              {s.lyricist && <span>✍️ <b>{s.lyricist}</b></span>}
              {s.vocalist && <span>🎤 {s.vocalist.split(", ").map((v,j) => <span key={j} className="vocalist-tag" style={{fontSize:10,padding:"1px 6px"}}>{v}</span>)}</span>}
              {s.date && <span style={{marginLeft:"auto",color:"rgba(196,181,253,0.4)",fontSize:10,whiteSpace:"nowrap"}}>{s.date}</span>}
            </div>
            <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
              {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="music-link" style={{fontSize:11}}>▶ Nghe</a>}
              {s.ytLink && (
                <a href={s.ytLink} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,0,0,0.15)",border:"1px solid rgba(255,80,80,0.3)",color:"#ff8080",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,textDecoration:"none"}}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
                  YouTube
                </a>
              )}
              {s.lyrics && (
                <button onClick={() => setLyricsFor(s)} style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",color:"#a78bfa",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  📝 Lyrics
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:16}}>
      <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"5px 14px",borderRadius:8,border:"1px solid rgba(139,92,246,0.3)",background:"rgba(255,255,255,0.03)",color:"rgba(196,181,253,0.6)",cursor:page===0?"not-allowed":"pointer",opacity:page===0?.4:1}}>← Trước</button>
      <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} style={{padding:"5px 14px",borderRadius:8,border:"1px solid rgba(139,92,246,0.3)",background:"rgba(255,255,255,0.03)",color:"rgba(196,181,253,0.6)",cursor:page===totalPages-1?"not-allowed":"pointer",opacity:page===totalPages-1?.4:1}}>Sau →</button>
    </div>
    </>
  );
}

function MusicPage({ data }) {
  const [tab, setTab] = useState("original");
  return (
    <div className="inner-page">
      <div className="page-title">🎵 Âm Nhạc</div>
      <div className="music-tabs">
        <button className={`music-tab${tab==="original"?" active":""}`} onClick={() => setTab("original")}>Original</button>
        <button className={`music-tab${tab==="covers"?" active":""}`} onClick={() => setTab("covers")}>Cover ({ALL_COVERS.length})</button>
      </div>
      {tab === "covers" && <>
        <div className="music-count">{ALL_COVERS.length} bài • Cuộn để xem thêm</div>
        <MusicTable songs={ALL_COVERS} />
      </>}
      {tab === "original" && <OriginalTab releases={data?.originalReleases || []} />}
    </div>
  );
}

// ─── Comic Page ────────────────────────────────────────────────────────────────

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"zoom-out",backdropFilter:"blur(6px)"}}>
      <button onClick={onClose} style={{position:"absolute",top:18,right:22,background:"none",border:"none",color:"#fff",fontSize:28,cursor:"pointer",lineHeight:1,opacity:.7}}>✕</button>
      <img
        src={src} alt={alt||""}
        onClick={e => e.stopPropagation()}
        style={{maxWidth:"92vw",maxHeight:"90vh",objectFit:"contain",borderRadius:10,boxShadow:"0 8px 60px rgba(0,0,0,0.7)",cursor:"default"}}
      />
    </div>
  );
}

// ─── clickable image wrapper ───────────────────────────────────────────────────
function ZoomImg({ src, alt, style, className }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <img src={src} alt={alt||""} style={{...style, cursor:"zoom-in"}} className={className} onClick={() => setOpen(true)} />
      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── Fetch Google Drive folder files ──────────────────────────────────────────
// Uses the public Drive API with no-CORS trick via a shared fetch approach.
// Files must be shared "Anyone with the link". Returns [{id, name}] or null on error.
// Fetch public Google Drive folder contents via our Vercel serverless function.
// Folders must be shared "Anyone with the link can view".
async function fetchDriveFolder(folderId) {
  if (!folderId) return [];
  try {
    const res = await fetch(`/api/drive-folder?id=${folderId}`, {
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data;
    throw new Error(data.error || 'bad response');
  } catch (err) {
    console.error('fetchDriveFolder error:', err);
    return null;
  }
}

function ComicPage({ data }) {
  const folderId = data?.comicFolderId || import.meta.env.VITE_COMIC_FOLDER_ID || "";
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDriveFolder(folderId).then(res => {
      setFiles(res);
      setLoading(false);
    });
  }, [folderId]);

  return (
    <div className="inner-page">
      <div className="page-title">📖 Truyện Tranh Moonatics</div>
      {loading && <div style={{textAlign:"center",padding:"40px 0",color:"rgba(196,181,253,0.5)"}}>⏳ Đang tải...</div>}
      {!loading && files === null && <div style={{textAlign:"center",padding:"40px 0",color:"rgba(196,181,253,0.4)",fontSize:13}}>⚠️ Không thể tải ảnh. Folder phải được chia sẻ "Anyone with the link".</div>}
      {!loading && files && files.length === 0 && <div style={{textAlign:"center",padding:"40px 0",color:"rgba(196,181,253,0.4)"}}>Chưa có trang nào.</div>}
      {!loading && files && files.length > 0 && (
        <div className="comic-grid">
          {files.map((f,i) => {
            const cleanName = f.name.replace(/^\d+[-_]?/, "").trim() || f.name;
            return (
              <div key={f.id}>
                <ZoomImg src={`https://lh3.googleusercontent.com/d/${f.id}`} alt={cleanName} style={{width:"100%",borderRadius:16,border:"1px solid rgba(139,92,246,0.3)"}} />
                {cleanName && <div style={{textAlign:"center",fontSize:11,color:"rgba(196,181,253,0.5)",marginTop:6,marginBottom:4}}>✏️ {cleanName}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DriveFolderGrid({ folderId, emptyMsg }) {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!folderId) { setLoading(false); return; }
    setLoading(true);
    fetchDriveFolder(folderId).then(res => { setFiles(res); setLoading(false); });
  }, [folderId]);

  if (loading) return <div style={{color:"rgba(196,181,253,0.4)",fontSize:12,padding:"20px 0"}}>⏳ Đang tải...</div>;
  if (!files) return <div style={{color:"rgba(196,181,253,0.4)",fontSize:12,padding:"8px 0"}}>⚠️ Không thể tải — hãy chắc chắn folder đã public.</div>;
  if (files.length === 0) return <div style={{color:"rgba(196,181,253,0.4)",fontSize:12}}>{emptyMsg || "Chưa có ảnh."}</div>;
  return (
    <div className="gallery-grid">
      {files.map(f => {
        const src = `https://lh3.googleusercontent.com/d/${f.id}`;
        const cleanName = f.name.replace(/^\d+[-_]?/, "").trim() || f.name;
        return (
          <div key={f.id} style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(139,92,246,0.3)"}}>
            <ZoomImg src={src} alt={cleanName} style={{width:"100%",aspectRatio:"1/1",objectFit:"cover",display:"block"}} />
            {cleanName && (
              <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)",padding:"6px 10px",fontSize:11,color:"#c4b5fd",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                ✏️ {cleanName}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GalleryPage({ data, defaultTab = "artwork" }) {
  const artworkFolderId = data?.artworkFolderId || import.meta.env.VITE_ARTWORK_FOLDER_ID || "";
  const fanartFolderId  = data?.fanartFolderId  || import.meta.env.VITE_FANART_FOLDER_ID || "";
  const isArtwork = defaultTab === "artwork";
  return (
    <div className="inner-page">
      <div className="page-title">{isArtwork ? "🎨 Artwork" : "💜 Fanart"}</div>
      <DriveFolderGrid folderId={isArtwork ? artworkFolderId : fanartFolderId} emptyMsg={isArtwork ? "Chưa có artwork." : "Chưa có fanart."} />
    </div>
  );
}

// ─── CMS Panel ────────────────────────────────────────────────────────────────
function CMSPanel({ data, onSave, onClose, tab, setTab }) {
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">⚙️ Quản lý nội dung</span>
          <button className="modal-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <div className="cms-tabs">
            {[["basic","Cơ bản"],["donate","Donate"],["expenses","Chi Tiêu"],["content","Nội dung"],["lists","Danh sách"],["members","Thành Viên"],["music","Cover"],["original","Original"],["media","Comic & Gallery"]].map(([k,l]) => (
              <button key={k} className={`cms-tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          {tab === "basic" && <BasicTab data={data} onSave={onSave} />}
          {tab === "donate" && <DonateTab data={data} onSave={onSave} />}
          {tab === "expenses" && <ExpensesTab data={data} onSave={onSave} />}
          {tab === "content" && <ContentTab data={data} onSave={onSave} />}
          {tab === "lists" && <ListsTab data={data} onSave={onSave} />}
          {tab === "members" && <MembersCMSTab data={data} onSave={onSave} />}
          {tab === "music" && <MusicCMSTab data={data} onSave={onSave} />}
          {tab === "original" && <OriginalCMSTab data={data} onSave={onSave} />}
          {tab === "media" && <MediaCMSTab data={data} onSave={onSave} />}
        </div>
      </div>
    </div>
  );
}

function BasicTab({ data, onSave }) {
  const [f, setF] = useState({ siteName: data.siteName, heroCTA: data.heroCTA, heroSubtitle: data.heroSubtitle, youtubeId: data.youtubeId, donateLink: data.donateLink, logoUrl: data.logoUrl||"", logoEmoji: data.logoEmoji||"🌙" });
  return (
    <>
      <Field label="🖼️ Logo URL (Google Drive / link ảnh trực tiếp)" value={f.logoUrl} onChange={v => setF(p=>({...p,logoUrl:v}))} />
      <div style={{fontSize:11,color:"rgba(196,181,253,0.5)",marginTop:-8,marginBottom:10}}>
        💡 Google Drive: mở ảnh → Share → Anyone with link → copy ID từ URL → dùng: https://drive.google.com/uc?id=ID_CỦA_BẠN
      </div>
      <Field label="Emoji dự phòng (nếu không có URL)" value={f.logoEmoji} onChange={v => setF(p=>({...p,logoEmoji:v}))} />
      <Field label="Tên website" value={f.siteName} onChange={v => setF(p=>({...p,siteName:v}))} />
      <Field label="CTA chính" value={f.heroCTA} onChange={v => setF(p=>({...p,heroCTA:v}))} />
      <Field label="Phụ đề CTA" value={f.heroSubtitle} onChange={v => setF(p=>({...p,heroSubtitle:v}))} />
      <Field label="Link Donate" value={f.donateLink} onChange={v => setF(p=>({...p,donateLink:v}))} />
      <button className="save-btn" onClick={() => onSave({...data,...f})}><SaveIcon /> Lưu</button>
    </>
  );
}

function DonateTab({ data, onSave }) {
  const [f, setF] = useState({ totalReceived: data.totalReceived, totalDonors: data.totalDonors, totalSpent: data.totalSpent, monthlyGoal: data.monthlyGoal, qrUrl: data.qrUrl||"" });
  return (
    <>
      <Field label="🔗 QR Code URL (thay thế ảnh QR mặc định)" value={f.qrUrl} onChange={v => setF(p=>({...p,qrUrl:v}))} />
      <div style={{fontSize:11,color:"rgba(196,181,253,0.5)",marginTop:-8,marginBottom:10}}>
        💡 Upload QR lên Google Drive / Imgur / bất kỳ host ảnh nào → paste link trực tiếp vào đây
      </div>
      <div className="row2">
        <Field label="Tổng nhận (đ)" value={f.totalReceived} onChange={v => setF(p=>({...p,totalReceived:+v}))} type="number" />
        <Field label="Số lượt donate" value={f.totalDonors} onChange={v => setF(p=>({...p,totalDonors:+v}))} type="number" />
      </div>
      <div className="row2">
        <Field label="Tổng chi (đ)" value={f.totalSpent} onChange={v => setF(p=>({...p,totalSpent:+v}))} type="number" />
        <Field label="Mục tiêu tháng (đ)" value={f.monthlyGoal} onChange={v => setF(p=>({...p,monthlyGoal:+v}))} type="number" />
      </div>
      <button className="save-btn" onClick={() => onSave({...data,...f})}><SaveIcon /> Lưu</button>
    </>
  );
}

function ContentTab({ data, onSave }) {
  const [heartMessage, setHeart] = useState(data.heartMessage);
  const [disclaimer, setDisclaimer] = useState(data.disclaimer);
  return (
    <>
      <Field label="Lời nhắn từ trái tim" value={heartMessage} onChange={setHeart} textarea rows={6} />
      <Field label="Disclaimer" value={disclaimer} onChange={setDisclaimer} textarea />
      <button className="save-btn" onClick={() => onSave({...data,heartMessage,disclaimer})}><SaveIcon /> Lưu</button>
    </>
  );
}

function ExpensesTab({ data, onSave }) {
  const [expenses, setExpenses] = useState(data.recentExpenses.map(e=>({...e})));
  const update = (i, field, val) => setExpenses(expenses.map((x,idx) => idx===i ? {...x,[field]:val} : x));
  const del = (i) => setExpenses(expenses.filter((_,idx) => idx!==i));
  const add = () => setExpenses(p=>[...p,{label:"Khoản chi mới",amount:0,category:"Khác",date:""}]);
  return (
    <>
      <div style={{fontWeight:700,fontSize:13,color:"#c4b5fd",marginBottom:12}}>💎 Các khoản chi tiêu</div>
      {expenses.map((e,i) => (
        <div key={i} style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:10,padding:12,marginBottom:10}}>
          <div className="row2">
            <Field label="Số tiền (đ)" value={e.amount} onChange={v => update(i,"amount",+v)} type="number" />
            <Field label="Ngày" value={e.date} onChange={v => update(i,"date",v)} />
          </div>
          <Field label="Hạng mục" value={e.category} onChange={v => update(i,"category",v)} />
          <Field label="Mô tả / Nhãn" value={e.label} onChange={v => update(i,"label",v)} />
          <button className="icon-btn" style={{marginTop:4,color:"#f87171"}} onClick={() => del(i)}><TrashIcon /> Xoá</button>
        </div>
      ))}
      <button className="add-btn" onClick={add}><PlusIcon /> Thêm khoản chi</button>
      <button className="save-btn" onClick={() => onSave({...data,recentExpenses:expenses})}><SaveIcon /> Lưu</button>
    </>
  );
}

function ListsTab({ data, onSave }) {
  const [promises, setPromises] = useState(data.promises.map(p=>({...p})));
  const [othersItems, setOthers] = useState([...data.othersItems]);
  const [meItems, setMe] = useState([...data.meItems]);
  const [budgetItems, setBudget] = useState(data.budgetItems.map(b=>({...b})));

  const updateArr = (arr, setArr, i, field, val) => setArr(arr.map((x,idx) => idx===i ? (typeof x==="string" ? val : {...x,[field]:val}) : x));
  const delArr = (arr, setArr, i) => setArr(arr.filter((_,idx) => idx!==i));

  return (
    <>
      <div style={{fontWeight:700,fontSize:13,color:"#7c3aed",marginBottom:8}}>Cam kết vàng</div>
      {promises.map((p,i) => (
        <div className="list-item-row" key={i}>
          <input value={p.text} onChange={e => updateArr(promises, setPromises, i, "text", e.target.value)} placeholder="Tên cam kết" />
          <input value={p.detail} onChange={e => updateArr(promises, setPromises, i, "detail", e.target.value)} placeholder="Chi tiết" />
          <button className="icon-btn" onClick={() => delArr(promises, setPromises, i)}><TrashIcon /></button>
        </div>
      ))}
      <button className="add-btn" onClick={() => setPromises(p=>[...p,{text:"",detail:""}])}><PlusIcon /> Thêm</button>

      <div style={{fontWeight:700,fontSize:13,color:"#ef4444",margin:"16px 0 8px"}}>Người khác (❌)</div>
      {othersItems.map((item,i) => (
        <div className="list-item-row" key={i}>
          <input value={item} onChange={e => updateArr(othersItems, setOthers, i, null, e.target.value)} />
          <button className="icon-btn" onClick={() => delArr(othersItems, setOthers, i)}><TrashIcon /></button>
        </div>
      ))}
      <button className="add-btn" onClick={() => setOthers(p=>[...p,""])}><PlusIcon /> Thêm</button>

      <div style={{fontWeight:700,fontSize:13,color:"#16a34a",margin:"16px 0 8px"}}>Nuôi Tôi (✅)</div>
      {meItems.map((item,i) => (
        <div className="list-item-row" key={i}>
          <input value={item} onChange={e => updateArr(meItems, setMe, i, null, e.target.value)} />
          <button className="icon-btn" onClick={() => delArr(meItems, setMe, i)}><TrashIcon /></button>
        </div>
      ))}
      <button className="add-btn" onClick={() => setMe(p=>[...p,""])}><PlusIcon /> Thêm</button>

      <div style={{fontWeight:700,fontSize:13,color:"#1d4ed8",margin:"16px 0 8px"}}>Dùng tiền vào đâu</div>
      {budgetItems.map((b,i) => (
        <div className="list-item-row" key={i}>
          <input value={b.pct} onChange={e => updateArr(budgetItems, setBudget, i, "pct", e.target.value)} style={{maxWidth:60}} />
          <input value={b.desc} onChange={e => updateArr(budgetItems, setBudget, i, "desc", e.target.value)} />
          <button className="icon-btn" onClick={() => delArr(budgetItems, setBudget, i)}><TrashIcon /></button>
        </div>
      ))}
      <button className="add-btn" onClick={() => setBudget(p=>[...p,{pct:"",desc:""}])}><PlusIcon /> Thêm</button>

      <button className="save-btn" onClick={() => onSave({...data,promises,othersItems,meItems,budgetItems})}><SaveIcon /> Lưu tất cả</button>
    </>
  );
}

// ─── Members CMS ──────────────────────────────────────────────────────────────
function MembersCMSTab({ data, onSave }) {
  const [section, setSection] = useState("active");
  const [members, setMembers] = useState((data.membersActive || MEMBERS_ACTIVE).map(m=>({...m})));
  const [graduated, setGraduated] = useState((data.membersGraduated || MEMBERS_GRADUATED).map(m=>({...m})));
  const [support, setSupport] = useState((data.membersSupport || MEMBERS_SUPPORT).map(m=>({...m})));
  const [guests, setGuests] = useState((data.membersGuest || MEMBERS_GUEST).map(g=>({...g})));

  const updateField = (arr, setArr, i, field, val) =>
    setArr(arr.map((x,idx) => idx===i ? {...x,[field]:val} : x));
  const del = (arr, setArr, i) => setArr(arr.filter((_,idx) => idx!==i));

  const MemberRow = ({arr, setArr, m, i, fields}) => (
    <div style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:10,padding:12,marginBottom:10}}>
      <div className="row2">
        <Field label="Tên" value={m.name} onChange={v=>updateField(arr,setArr,i,"name",v)} />
        <Field label="Alt Name" value={m.altName||""} onChange={v=>updateField(arr,setArr,i,"altName",v)} />
      </div>
      {fields?.includes("bio") && <Field label="Bio" value={m.bio||""} onChange={v=>updateField(arr,setArr,i,"bio",v)} textarea rows={2} />}
      {fields?.includes("roles") && <Field label="Roles (phân cách bởi dấu phẩy)" value={(m.roles||[]).join(", ")} onChange={v=>updateField(arr,setArr,i,"roles",v.split(", "))} />}
      {fields?.includes("desc") && <Field label="Mô tả ngắn" value={m.desc||""} onChange={v=>updateField(arr,setArr,i,"desc",v)} textarea rows={2} />}
      {fields?.includes("joined") && <Field label="Ngày tham gia" value={m.joined||""} onChange={v=>updateField(arr,setArr,i,"joined",v)} />}
      {fields?.includes("status") && <Field label="Status" value={m.status||""} onChange={v=>updateField(arr,setArr,i,"status",v)} />}
      {fields?.includes("role") && <Field label="Vai trò" value={m.role||""} onChange={v=>updateField(arr,setArr,i,"role",v)} />}
      {fields?.includes("since") && <Field label="Xuất hiện từ" value={m.since||""} onChange={v=>updateField(arr,setArr,i,"since",v)} />}
      <button className="icon-btn" style={{color:"#f87171",marginTop:4}} onClick={()=>del(arr,setArr,i)}><TrashIcon /> Xoá</button>
    </div>
  );

  return (
    <>
      <div className="cms-tabs" style={{marginBottom:14}}>
        {[["active","Active"],["graduated","Graduated"],["support","Supportee"],["guest","Khách Mời"]].map(([k,l])=>(
          <button key={k} className={`cms-tab ${section===k?"active":""}`} onClick={()=>setSection(k)}>{l}</button>
        ))}
      </div>

      {section==="active" && <>
        {members.map((m,i)=><MemberRow key={i} arr={members} setArr={setMembers} m={m} i={i} fields={["bio","roles","joined","status"]} />)}
        <button className="add-btn" onClick={()=>setMembers(p=>[...p,{name:"Thành viên mới",altName:"",bio:"",roles:[],joined:"",status:"Active",color:"#a78bfa",icon:"♦",images:[null]}])}><PlusIcon /> Thêm</button>
      </>}

      {section==="graduated" && <>
        {graduated.map((m,i)=><MemberRow key={i} arr={graduated} setArr={setGraduated} m={m} i={i} fields={["bio","roles","joined","status"]} />)}
        <button className="add-btn" onClick={()=>setGraduated(p=>[...p,{name:"",altName:"",bio:"",roles:[],joined:"",status:"Inactive",color:"#ec4899",icon:"♥",images:[null]}])}><PlusIcon /> Thêm</button>
      </>}

      {section==="support" && <>
        {support.map((m,i)=><MemberRow key={i} arr={support} setArr={setSupport} m={m} i={i} fields={["roles","desc"]} />)}
        <button className="add-btn" onClick={()=>setSupport(p=>[...p,{name:"",altName:"",emoji:"⭐",gender:"",star:"",vocal:"",color:"",roles:[],images:[null]}])}><PlusIcon /> Thêm</button>
      </>}

      {section==="guest" && <>
        {guests.map((g,i)=><MemberRow key={i} arr={guests} setArr={setGuests} g={g} m={g} i={i} fields={["role","since"]} />)}
        <button className="add-btn" onClick={()=>setGuests(p=>[...p,{name:"",role:"",since:""}])}><PlusIcon /> Thêm</button>
      </>}

      <button className="save-btn" onClick={()=>onSave({...data, membersActive:members, membersGraduated:graduated, membersSupport:support, membersGuest:guests})}><SaveIcon /> Lưu</button>
    </>
  );
}

// ─── Music CMS ────────────────────────────────────────────────────────────────
function MusicCMSTab({ data, onSave }) {
  const [songs, setSongs] = useState(ALL_COVERS.map(s=>({...s})));
  const update = (i,field,val) => setSongs(songs.map((x,idx)=>idx===i?{...x,[field]:val}:x));
  const del = (i) => setSongs(songs.filter((_,idx)=>idx!==i));
  const add = () => setSongs(p=>[{title:"",orig:"",lyricist:"",vocalist:"",date:"",link:"",ytLink:"",lyrics:"",artwork:"",year:"2025"}, ...p]);

  return (
    <>
      <div style={{fontWeight:700,fontSize:13,color:"#c4b5fd",marginBottom:12}}>🎵 Danh sách bài hát ({songs.length} bài)</div>
      <div style={{maxHeight:420,overflowY:"auto",paddingRight:4}}>
        {songs.map((s,i)=>(
          <div key={i} style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:10,padding:12,marginBottom:8}}>
            <div className="row2">
              <Field label="Tên bài" value={s.title} onChange={v=>update(i,"title",v)} />
              <Field label="Năm" value={s.year||"2025"} onChange={v=>update(i,"year",v)} />
            </div>
            <Field label="Bài gốc" value={s.orig} onChange={v=>update(i,"orig",v)} />
            <div className="row2">
              <Field label="Lyricist Chuyển Ngữ" value={s.lyricist||""} onChange={v=>update(i,"lyricist",v)} />
              <Field label="Vocalist" value={s.vocalist} onChange={v=>update(i,"vocalist",v)} />
            </div>
            <div className="row2">
              <Field label="Ngày" value={s.date} onChange={v=>update(i,"date",v)} />
              <Field label="Artwork URL" value={s.artwork||""} onChange={v=>update(i,"artwork",v)} />
            </div>
            <Field label="Link Nghe (fanlink/spotify/...)" value={s.link} onChange={v=>update(i,"link",v)} />
            <Field label="▶ YouTube URL" value={s.ytLink||""} onChange={v=>update(i,"ytLink",v)} />
            <Field label="📝 Lyrics (xuống dòng = xuống dòng)" value={s.lyrics||""} onChange={v=>update(i,"lyrics",v)} textarea rows={5} />
            <button className="icon-btn" style={{color:"#f87171",marginTop:4}} onClick={()=>del(i)}><TrashIcon /> Xoá</button>
          </div>
        ))}
      </div>
      <button className="add-btn" onClick={add}><PlusIcon /> Thêm bài hát (xuất hiện đầu tiên)</button>
      <div style={{fontSize:11,color:"rgba(196,181,253,0.4)",margin:"8px 0"}}>⚠️ Thay đổi sẽ có hiệu lực sau khi refresh trang.</div>
      <button className="save-btn" onClick={()=>{ ALL_COVERS.splice(0,ALL_COVERS.length,...songs); onSave({...data}); }}><SaveIcon /> Lưu</button>
    </>
  );
}

// ─── Original Releases CMS ────────────────────────────────────────────────────
function OriginalCMSTab({ data, onSave }) {
  const blank = () => ({ title:"", date:"", artwork:"", composer:"", producer:"", vocal:"", lyrics:"", mvLink:"", spotifyLink:"", appleMusicLink:"", zingLink:"", nctLink:"", description:"" });
  const [releases, setReleases] = useState((data.originalReleases || []).map(r=>({...r})));
  const [openIdx, setOpenIdx] = useState(null);
  const update = (i, field, val) => setReleases(rs => rs.map((x,idx) => idx===i ? {...x,[field]:val} : x));
  // New releases are prepended so they appear first (newest on left in grid)

  return (
    <>
      <div style={{fontWeight:700,fontSize:13,color:"#c4b5fd",marginBottom:12}}>🎵 Original Releases ({releases.length} bản nhạc)</div>
      <div style={{maxHeight:500,overflowY:"auto",paddingRight:4}}>
        {releases.map((r,i) => (
          <div key={i} style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:10,padding:12,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setOpenIdx(openIdx===i?null:i)}>
              <span style={{fontWeight:700,color:"#e2d9f3",fontSize:13}}>{r.title || "(Chưa đặt tên)"}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:11,color:"rgba(196,181,253,0.45)"}}>{r.date}</span>
                <span style={{color:"#a78bfa"}}>{openIdx===i?"▲":"▼"}</span>
              </div>
            </div>
            {openIdx===i && (
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:2}}>
                <div className="row2">
                  <Field label="Tên bản nhạc" value={r.title} onChange={v=>update(i,"title",v)} />
                  <Field label="Ngày phát hành" value={r.date} onChange={v=>update(i,"date",v)} />
                </div>
                <Field label="🖼️ Artwork URL" value={r.artwork} onChange={v=>update(i,"artwork",v)} />
                <div className="row2">
                  <Field label="🎼 Composer" value={r.composer} onChange={v=>update(i,"composer",v)} />
                  <Field label="🎹 Producer" value={r.producer} onChange={v=>update(i,"producer",v)} />
                </div>
                <div className="row2">
                  <Field label="🎤 Vocal" value={r.vocal} onChange={v=>update(i,"vocal",v)} />
                  <Field label="✍️ Lyrics" value={r.lyrics} onChange={v=>update(i,"lyrics",v)} />
                </div>
                <Field label="▶ Link MV (YouTube URL)" value={r.mvLink} onChange={v=>update(i,"mvLink",v)} />
                <div className="row2">
                  <Field label="Spotify URL" value={r.spotifyLink} onChange={v=>update(i,"spotifyLink",v)} />
                  <Field label="Apple Music URL" value={r.appleMusicLink} onChange={v=>update(i,"appleMusicLink",v)} />
                </div>
                <div className="row2">
                  <Field label="Zing MP3 URL" value={r.zingLink} onChange={v=>update(i,"zingLink",v)} />
                  <Field label="Nhaccuatui URL" value={r.nctLink} onChange={v=>update(i,"nctLink",v)} />
                </div>
                <Field label="🎤 Lyrics" value={r.description} onChange={v=>update(i,"description",v)} textarea />
                <button className="icon-btn" style={{color:"#f87171",marginTop:4}} onClick={()=>setReleases(rs=>rs.filter((_,idx)=>idx!==i))}><TrashIcon /> Xoá bản nhạc này</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="add-btn" onClick={()=>{setReleases(r=>[blank(),...r]);setOpenIdx(0);}}><PlusIcon /> Thêm bản nhạc mới (xuất hiện đầu tiên)</button>
      <button className="save-btn" onClick={()=>onSave({...data,originalReleases:releases})}><SaveIcon /> Lưu</button>
    </>
  );
}

// ─── Media CMS ────────────────────────────────────────────────────────────────
function MediaCMSTab({ data, onSave }) {
  const [comicFolderId, setComicFolderId] = useState(data.comicFolderId || import.meta.env.VITE_COMIC_FOLDER_ID || "");
  const [artworkFolderId, setArtworkFolderId] = useState(data.artworkFolderId || import.meta.env.VITE_ARTWORK_FOLDER_ID || "");
  const [fanartFolderId, setFanartFolderId] = useState(data.fanartFolderId || import.meta.env.VITE_FANART_FOLDER_ID || "");
  const [memberImages, setMemberImages] = useState(
    data.memberImages ? JSON.parse(JSON.stringify(data.memberImages)) : {}
  );
  const [memberTab, setMemberTab] = useState("Red Spade");

  const allMemberNames = [
    ...MEMBERS_ACTIVE.map(m=>m.name),
    ...MEMBERS_GRADUATED.map(m=>m.name),
    ...MEMBERS_SUPPORT.map(m=>m.name),
    ...MEMBERS_GUEST.map(m=>m.name),
  ];

  const updateMemberImg = (name, i, val) => {
    setMemberImages(prev => {
      const next = {...prev};
      const arr = [...(next[name] || [null])];
      arr[i] = val || null;
      next[name] = arr;
      return next;
    });
  };

  const addMemberImg = (name) => {
    setMemberImages(prev => ({...prev, [name]: [...(prev[name] || [null]), null]}));
  };

  const removeMemberImg = (name, i) => {
    setMemberImages(prev => ({...prev, [name]: (prev[name]||[]).filter((_,idx)=>idx!==i)}));
  };

  return (
    <>
      {/* ── Profile Images ── */}
      <div style={{fontWeight:700,fontSize:13,color:"#c4b5fd",marginBottom:10}}>👤 Profile Images</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {allMemberNames.map(name => (
          <button key={name} className={`cms-tab${memberTab===name?" active":""}`} style={{fontSize:10,padding:"4px 10px"}} onClick={()=>setMemberTab(name)}>{name.split(" ")[0]}</button>
        ))}
      </div>
      {(memberImages[memberTab] || [null]).map((url,i) => (
        <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <div className="field" style={{flex:1,marginBottom:0}}>
            <label>Ảnh {i+1} (URL)</label>
            <input type="text" value={url||""} onChange={e=>updateMemberImg(memberTab,i,e.target.value)} placeholder="https://..." style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",color:"#e2d9f3",border:"1px solid rgba(139,92,246,0.25)",borderRadius:8,fontFamily:"Be Vietnam Pro,sans-serif",fontSize:13,outline:"none"}} />
          </div>
          <button className="icon-btn" style={{color:"#f87171",marginTop:16,flexShrink:0}} onClick={()=>removeMemberImg(memberTab,i)}><TrashIcon /></button>
        </div>
      ))}
      <button className="add-btn" onClick={()=>addMemberImg(memberTab)} style={{marginBottom:20}}><PlusIcon /> Thêm ảnh cho {memberTab.split(" ")[0]}</button>

      {/* ── Folder IDs ── */}
      <div style={{fontWeight:700,fontSize:13,color:"#c4b5fd",marginBottom:6}}>📁 Google Drive Folder IDs</div>
      <div style={{fontSize:11,color:"rgba(196,181,253,0.45)",marginBottom:12,lineHeight:1.6}}>
        Ảnh được tải tự động từ folder Drive. Tên file = Credit hiển thị. Folder phải được chia sẻ "Anyone with the link can view".
      </div>
      <Field label="📖 Truyện Tranh — Folder ID" value={comicFolderId} onChange={setComicFolderId} />
      <div style={{fontSize:10,color:"rgba(196,181,253,0.35)",marginTop:-8,marginBottom:12}}>
        VD: https://drive.google.com/drive/folders/<b style={{color:"#a78bfa"}}>FOLDER_ID</b>
      </div>
      <Field label="🎨 Artwork — Folder ID" value={artworkFolderId} onChange={setArtworkFolderId} />
      <div style={{fontSize:10,color:"rgba(196,181,253,0.35)",marginTop:-8,marginBottom:12}}>
        VD: https://drive.google.com/drive/folders/<b style={{color:"#a78bfa"}}>FOLDER_ID</b>
      </div>
      <Field label="💜 Fanart — Folder ID" value={fanartFolderId} onChange={setFanartFolderId} />
      <div style={{fontSize:10,color:"rgba(196,181,253,0.35)",marginTop:-8,marginBottom:16}}>
        VD: https://drive.google.com/drive/folders/<b style={{color:"#a78bfa"}}>FOLDER_ID</b>
      </div>

      <button className="save-btn" onClick={()=>onSave({...data,comicFolderId,artworkFolderId,fanartFolderId,memberImages})}><SaveIcon /> Lưu tất cả</button>
    </>
  );
}

function Field({ label, value, onChange, textarea, type="text", rows=3 }) {
  return (
    <div className="field">
      <label>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}
