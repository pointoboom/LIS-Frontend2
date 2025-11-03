# Admin Dashboard - คู่มือการใช้งาน

## ภาพรวมของระบบ

ระบบ Admin Dashboard นี้ถูกพัฒนาขึ้นตาม wireframe ที่กำหนด โดยใช้เทคโนโลยีที่ทันสมัย:

- **Frontend Framework**: React 19 + Wouter (Routing)
- **UI Library**: Ant Design 5.28.0
- **Styling**: Tailwind CSS 4
- **TypeScript**: สำหรับความปลอดภัยของโค้ด

## โครงสร้างหน้าเว็บ

### 1. หน้า Login (`/login`)
หน้าเข้าสู่ระบบที่มีการออกแบบที่สวยงามด้วย gradient background และ form validation

**คุณสมบัติ:**
- ฟอร์มเข้าสู่ระบบพร้อม username และ password
- การ validate ข้อมูลอัตโนมัติ
- Loading state เมื่อกำลัง login
- Responsive design สำหรับทุกขนาดหน้าจอ

**วิธีใช้งาน:**
1. กรอก username และ password
2. คลิกปุ่ม "Sign in"
3. ระบบจะนำคุณไปยังหน้า Dashboard โดยอัตโนมัติ

### 2. หน้า Dashboard (`/dashboard`)
หน้าหลักของระบบที่แสดงข้อมูล scan results และ quick actions

**คุณสมบัติ:**
- แสดงสถานะ Scan Results (< 30 mins)
- Quick action cards สำหรับเข้าถึง Reports และ Category
- แสดงรายการ Latest results ในรูปแบบ grid
- Sidebar navigation สำหรับเปลี่ดนหน้า

**วิธีใช้งาน:**
1. ดูสถานะ Scan Results ด้านบน
2. คลิกที่ card "Reports" หรือ "Category" เพื่อเข้าถึงหน้านั้นๆ
3. คลิกปุ่ม "Latest" เพื่อดูรายละเอียดของแต่ละ result

### 3. หน้า Reports (`/dashboard/reports`)
หน้าสำหรับดูและ export รายงาน

**คุณสมบัติ:**
- ปุ่ม export เป็น PNG หรือ PDF
- แสดงข้อมูล PID (Patient Identification Data)
- แสดงข้อมูล OBR (Observation Request Information)
- แสดงผลลัพธ์ OBX RESULTS พร้อมตัวอย่างข้อมูล

**วิธีใช้งาน:**
1. เลือกรูปแบบการ export (PNG หรือ PDF)
2. ดูข้อมูล PID, OBR และ OBX RESULTS
3. คลิกปุ่ม export เพื่อดาวน์โหลดรายงาน

### 4. หน้า Category (`/dashboard/category`)
หน้าสำหรับจัดการหมวดหมู่และรายการ

**คุณสมบัติ:**
- แสดงหมวดหมู่ด้านซ้าย (OBR, Blood, XXXX)
- แสดงรายการ items ด้านขวา (PID / OBX)
- Layout แบบ 2 คอลัมน์ที่ responsive

**วิธีใช้งาน:**
1. เลือกหมวดหมู่จากด้านซ้าย
2. ดูรายการ items ที่เกี่ยวข้องด้านขวา
3. คลิกที่ item เพื่อดูรายละเอียด

### 5. Sidebar Navigation
Sidebar ที่สวยงามพร้อม gradient header

**เมนูที่มี:**
- Dashboard (หน้าหลัก)
- Blood (หน้าเพิ่มเติม - placeholder)
- XXXX (หน้าเพิ่มเติม - placeholder)

## การออกแบบ UI/UX

### สีหลักของระบบ
- **Primary Color**: Indigo (#6366f1)
- **Secondary Color**: Purple (#a855f7)
- **Background**: Gray-50 (#f9fafb)

### คุณสมบัติพิเศษ
- **Responsive Design**: ทำงานได้ดีบนทุกขนาดหน้าจอ
- **Gradient Effects**: ใช้ gradient สีสวยงามใน header และ login page
- **Hover Effects**: ปุ่มและ card มี hover effect ที่ smooth
- **Shadow Effects**: ใช้ shadow เพื่อสร้างความลึกให้กับ UI elements
- **Toast Notifications**: แสดงการแจ้งเตือนเมื่อทำการ export

## การพัฒนาต่อ

### โครงสร้างโฟลเดอร์
```
client/src/
├── pages/              # หน้าเว็บทั้งหมด
│   ├── Login.tsx       # หน้า Login
│   ├── Dashboard.tsx   # หน้า Dashboard หลัก
│   ├── Reports.tsx     # หน้า Reports
│   ├── Category.tsx    # หน้า Category
│   ├── Blood.tsx       # หน้า Blood (placeholder)
│   ├── Other.tsx       # หน้า Other (placeholder)
│   └── NotFound.tsx    # หน้า 404
├── components/         # Components ที่ใช้ซ้ำ
│   ├── Sidebar.tsx     # Sidebar navigation
│   └── DashboardLayout.tsx  # Layout wrapper
├── App.tsx            # Router configuration
├── main.tsx           # Entry point
├── antd-styles.css    # Ant Design custom styles
└── index.css          # Global styles
```

### การเพิ่มฟีเจอร์ใหม่
1. สร้างไฟล์ component ใหม่ใน `client/src/pages/`
2. เพิ่ม route ใน `App.tsx`
3. เพิ่มเมนูใน `Sidebar.tsx` (ถ้าต้องการ)
4. ใช้ `DashboardLayout` wrapper สำหรับหน้าที่ต้องการ sidebar

### การปรับแต่งสี
แก้ไขไฟล์ `client/src/App.tsx` ในส่วน `ConfigProvider`:
```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#6366f1',  // เปลี่ยนสีหลัก
      borderRadius: 8,           // เปลี่ยน border radius
    },
  }}
>
```

## การรัน Development Server

```bash
cd admin-dashboard
pnpm install  # ติดตั้ง dependencies (ถ้ายังไม่ได้ติดตั้ง)
pnpm dev      # รัน development server
```

เว็บจะเปิดที่ `http://localhost:3000`

## การ Build สำหรับ Production

```bash
pnpm build    # Build โปรเจกต์
pnpm preview  # Preview production build
```

## หมายเหตุ

- ระบบใช้ localStorage สำหรับเก็บสถานะการ login (`isAuthenticated`)
- ปุ่ม export ใน Reports page จะแสดง toast notification (ยังไม่ได้เชื่อมต่อกับ backend จริง)
- หน้า Blood และ XXXX เป็น placeholder ที่สามารถพัฒนาต่อได้
- ระบบรองรับ TypeScript เต็มรูปแบบ

## การแก้ไขปัญหา

### ถ้า Ant Design styles ไม่แสดงผล
ตรวจสอบว่า `antd-styles.css` ถูก import ใน `main.tsx` แล้ว

### ถ้า routing ไม่ทำงาน
ตรวจสอบว่าได้ import component และเพิ่ม route ใน `App.tsx` แล้ว

### ถ้า TypeScript แสดง error
รัน `pnpm install` ใหม่เพื่อติดตั้ง type definitions

## สรุป

ระบบ Admin Dashboard นี้พร้อมใช้งานและสามารถพัฒนาต่อได้ตามต้องการ โดยมีโครงสร้างที่ชัดเจนและใช้เทคโนโลยีที่ทันสมัย การออกแบบ UI ให้ความสำคัญกับ user experience และ responsive design เพื่อให้ใช้งานได้ดีบนทุกอุปกรณ์
