<div align="center">

# 🍽️ POS Manager - Restaurant SaaS

<p align="center">
  <strong>Hệ thống quản lý nhà hàng hiện đại, toàn diện</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.6-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Zustand-5.0.8-FF6B35?style=for-the-badge" alt="Zustand" />
</p>

<p align="center">
  <a href="#-tính-năng-chính">Tính năng</a> •
  <a href="#-công-nghệ-sử-dụng">Công nghệ</a> •
  <a href="#-cài-đặt">Cài đặt</a> •
  <a href="#-cấu-trúc-dự-án">Cấu trúc</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

---

</div>

## 📋 Giới thiệu

**POS Manager** là một hệ thống Point of Sale (POS) hiện đại được xây dựng dành riêng cho nhà hàng, quán ăn. Với giao diện thân thiện, tối ưu trải nghiệm người dùng và tích hợp đầy đủ các tính năng cần thiết để quản lý nhà hàng một cách chuyên nghiệp.

## ✨ Tính năng chính

### 🎯 Quản lý Bán hàng (POS Dashboard)
- ✅ Giao diện bán hàng trực quan, nhanh chóng
- ✅ Danh mục món ăn theo categories
- ✅ Giỏ hàng thời gian thực
- ✅ Quick actions cho các thao tác nhanh
- ✅ Tính toán tổng tiền, thuế, giảm giá tự động

### 🍔 Quản lý Thực đơn (Menu Management)
- ✅ Thêm, sửa, xóa món ăn
- ✅ Quản lý giá cả và mô tả
- ✅ Upload hình ảnh món ăn
- ✅ Phân loại theo danh mục
- ✅ Quản lý tình trạng kho (available, low_stock, unavailable)
- ✅ Bulk actions (chỉnh sửa hàng loạt)
- ✅ View mode: Table & Grid

### 🪑 Quản lý Bàn (Table Management)
- ✅ Sơ đồ bàn trực quan (drag & drop)
- ✅ Trạng thái bàn real-time (available, occupied, reserved, cleaning)
- ✅ Merge tables (gộp bàn)
- ✅ Quick actions bar
- ✅ Thông tin công suất và khách hiện tại
- ✅ Tạo đơn hàng từ bàn
- ✅ Gọi phục vụ, in hóa đơn

### 👥 Quản lý Nhân viên (Staff Management)
- ✅ Danh sách nhân viên với thông tin chi tiết
- ✅ Phân quyền theo vai trò (owner, manager, cashier, kitchen, waiter)
- ✅ Theo dõi trạng thái (active, on-break, inactive)
- ✅ Quản lý ca làm việc
- ✅ Thống kê hiệu suất (orders today, hours worked)
- ✅ Bulk actions
- ✅ View mode: Cards & Table

### 💳 Xử lý Thanh toán (Payment Processing)
- ✅ Nhiều phương thức thanh toán:
  - 💵 Tiền mặt (Cash)
  - 💳 Thẻ ngân hàng (Card)
  - 📱 Ví điện tử (MoMo, ZaloPay, Banking)
- ✅ Thông tin khách hàng
- ✅ Order summary chi tiết
- ✅ Payment success confirmation
- ✅ Multi-step wizard (Customer Info → Method → Payment → Success)

### 📊 Lịch sử Đơn hàng (Order History)
- ✅ Xem lịch sử đơn hàng
- ✅ Filters nâng cao (status, payment method, table, time range)
- ✅ Order details modal
- ✅ Export & print
- ✅ Summary cards (tổng quan doanh thu)
- ✅ Search by order ID, customer name, phone

### 🔐 Authentication System
- ✅ Sign Up / Sign In
- ✅ Email & Phone number support
- ✅ OTP verification (Email, SMS, Telegram)
- ✅ Google OAuth2 integration
- ✅ Apple Sign-In (UI ready)
- ✅ Password strength validation
- ✅ Remember me functionality
- ✅ Forgot password flow

### 🎨 UI/UX Features
- ✅ Modern, clean design
- ✅ Dark/Light mode support
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Smooth animations (Framer Motion)
- ✅ Toast notifications (Radix UI)
- ✅ Icon library (Lucide React)
- ✅ Loading states & error handling
- ✅ Collapsible sidebar
- ✅ Operational status toggle

## 🛠️ Công nghệ sử dụng

### Core
- **React 18.2.0** - UI library với concurrent features
- **Vite 5.0.0** - Build tool cực nhanh
- **React Router 6.0.2** - Routing
- **Zustand 5.0.8** - State management (lightweight)

### Styling & UI
- **TailwindCSS 3.4.6** - Utility-first CSS framework
- **Radix UI** - Headless UI components (Toast)
- **Lucide React** - Icon library
- **Framer Motion 10.16.4** - Animation library
- **Class Variance Authority** - Variant management
- **Tailwind Merge** - Conflict-free class merging

### Forms & Validation
- **React Hook Form 7.55.0** - Form management
- **Axios 1.8.4** - HTTP client

### Data Visualization
- **D3.js 7.9.0** - Powerful data visualization
- **Recharts 2.15.2** - Chart library

### Developer Tools
- **Vite TSConfig Paths** - Path aliases
- **PostCSS & Autoprefixer** - CSS processing
- **ESLint** - Code linting

## � Cài đặt

### Prerequisites
- Node.js >= 14.x
- npm hoặc yarn
- Git

### Installation Steps

1. **Clone repository**
```bash
git clone https://github.com/dinhdev-nu/restaurant-manager-saas-ui.git
cd pos_manager
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
```

3. **Cấu hình environment variables**
```bash
# Tạo file .env
cp .env.example .env

# Chỉnh sửa các biến môi trường
VITE_SERVER_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000/api
```

4. **Chạy development server**
```bash
npm start
# hoặc
yarn start
```

Server sẽ chạy tại: `http://localhost:5173`

5. **Build cho production**
```bash
npm run build
# hoặc
yarn build
```

6. **Preview production build**
```bash
npm run serve
# hoặc
yarn serve
```

## 📁 Cấu trúc dự án

```
pos_manager/
├── public/                      # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO robots
│   └── assets/
│       └── images/             # Public images
│
├── src/
│   ├── api/                    # API integration
│   │   ├── auth.jsx           # Authentication APIs
│   │   └── axios.js           # Axios instance config
│   │
│   ├── components/            # Shared components
│   │   ├── ui/               # UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Toaster.jsx
│   │   ├── AppIcon.jsx
│   │   ├── AppImage.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ScrollToTop.jsx
│   │
│   ├── pages/                 # Page components
│   │   ├── auth/             # Authentication pages
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── auth-card.jsx
│   │   │       ├── auth-form.jsx
│   │   │       ├── sign-in-form.jsx
│   │   │       ├── sign-up-form.jsx
│   │   │       └── social-login.jsx
│   │   │
│   │   ├── main-pos-dashboard/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── MenuCategory.jsx
│   │   │       ├── MenuGrid.jsx
│   │   │       ├── OrderCart.jsx
│   │   │       ├── PaymentSection.jsx
│   │   │       └── QuickActions.jsx
│   │   │
│   │   ├── menu-management/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── MenuItemCard.jsx
│   │   │       ├── MenuItemModal.jsx
│   │   │       ├── MenuTable.jsx
│   │   │       ├── CategoryFilter.jsx
│   │   │       ├── MenuStats.jsx
│   │   │       └── BulkActionsBar.jsx
│   │   │
│   │   ├── table-management/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── TableCard.jsx
│   │   │       ├── TableLayout.jsx
│   │   │       ├── TableControlPanel.jsx
│   │   │       ├── TableMergeModal.jsx
│   │   │       └── QuickActionBar.jsx
│   │   │
│   │   ├── staff-management/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── StaffCard.jsx
│   │   │       ├── StaffTable.jsx
│   │   │       ├── AddStaffModal.jsx
│   │   │       ├── StaffDetailsModal.jsx
│   │   │       └── BulkActionsBar.jsx
│   │   │
│   │   ├── payment-processing/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── PaymentMethodSelector.jsx
│   │   │       ├── CardPaymentForm.jsx
│   │   │       ├── CashPaymentForm.jsx
│   │   │       ├── DigitalWalletForm.jsx
│   │   │       ├── CustomerInfoForm.jsx
│   │   │       ├── OrderSummary.jsx
│   │   │       └── PaymentSuccess.jsx
│   │   │
│   │   ├── order-history/
│   │   │   ├── index.jsx
│   │   │   └── components/
│   │   │       ├── OrderTable.jsx
│   │   │       ├── OrderDetailsModal.jsx
│   │   │       ├── OrderFilters.jsx
│   │   │       └── OrderSummaryCards.jsx
│   │   │
│   │   └── NotFound.jsx
│   │
│   ├── hooks/                 # Custom hooks
│   │   └── use-toast.js
│   │
│   ├── stores/               # State management
│   │   └── auth.store.js
│   │
│   ├── services/             # Services
│   │   └── googleAuths.js
│   │
│   ├── utils/                # Utilities
│   │   ├── cn.js            # Class name utility
│   │   └── validators.js    # Form validators
│   │
│   ├── styles/              # Global styles
│   │   ├── index.css
│   │   └── tailwind.css
│   │
│   ├── App.jsx              # Main app component
│   ├── Routes.jsx           # Route configuration
│   └── index.jsx            # Entry point
│
├── index.html               # HTML template
├── package.json            # Dependencies
├── vite.config.mjs         # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── jsconfig.json           # JavaScript configuration
└── README.md               # This file
```

## 🚀 Available Scripts

```bash
# Development
npm start              # Start dev server (localhost:5173)

# Production
npm run build         # Build for production
npm run serve         # Preview production build

# Code Quality
npm run lint          # Run ESLint
```

## 🎨 Color System

Dự án sử dụng hệ thống màu semantic với Tailwind CSS:

- **Primary**: Main brand color
- **Secondary**: Secondary actions
- **Success**: Success states (green)
- **Warning**: Warning states (amber)
- **Error/Destructive**: Error states (red)
- **Info**: Information states (blue)
- **Muted**: Subtle backgrounds and text

### Toast Variants
```jsx
// Default
toast({ title: "Title", description: "Message" })

// Success
toast({ title: "Success!", variant: "success" })

// Error
toast({ title: "Error!", variant: "destructive" })

// Warning
toast({ title: "Warning!", variant: "warning" })

// Info
toast({ title: "Info", variant: "info" })
```

## 🔗 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | MainPOSDashboard | Màn hình bán hàng chính |
| `/auth` | AuthPage | Đăng nhập / Đăng ký |
| `/menu-management` | MenuManagement | Quản lý thực đơn |
| `/table-management` | TableManagement | Quản lý bàn |
| `/staff-management` | StaffManagement | Quản lý nhân viên |
| `/order-history` | OrderHistory | Lịch sử đơn hàng |
| `/payment-processing` | PaymentProcessing | Xử lý thanh toán |

## 🔐 Authentication Flow

1. User truy cập `/auth`
2. Chọn Sign Up hoặc Sign In
3. Nhập email/phone number
4. Request OTP (Email/SMS/Telegram)
5. Verify OTP
6. Đăng nhập thành công → Redirect to dashboard
7. Token lưu tại localStorage + httpOnly cookies

### Google OAuth Flow
1. Click "Sign in with Google"
2. Redirect to Google OAuth
3. Google callback → Server set cookies (RT + SS)
4. Redirect to `/auth?provider=google`
5. Client read SS cookie → Save to localStorage
6. Clear SS cookie → Redirect to home

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👨‍� Author

**Dinh Dev**
- GitHub: [@dinhdev-nu](https://github.com/dinhdev-nu)
- Repository: [restaurant-manager-saas-ui](https://github.com/dinhdev-nu/restaurant-manager-saas-ui)

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Radix UI](https://www.radix-ui.com/) - Headless Components
- [Lucide](https://lucide.dev/) - Icon Library
- [Framer Motion](https://www.framer.com/motion/) - Animation Library

---

<div align="center">

**Built with ❤️ for Restaurant Management**

[⬆ Back to top](#-pos-manager---restaurant-saas)

</div>
