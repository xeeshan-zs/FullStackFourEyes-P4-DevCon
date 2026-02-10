# FullStackFourEyes-P4-DevCon

## 👥 Team Information
**Team Name:** Full stack four eyes  
**Problem Statement:** Problem 4 - Smart City Parking & Traffic Management

### Team Members
| Name | Role |
|------|------|
| Zeeshan Sarfraz | Full Stack Developer |
| Ateeb Khalid | Full Stack Developer |

---

## 🚀 Project Overview
**Park It** is a smart parking and traffic management solution designed to optimize urban mobility. The application provides role-based access for Drivers, Traffic Officers, and Administrators to manage parking resources and traffic flow effectively.

### ✨ Implemented Features
- **Authentication & Authorization**: Secure login with role-based redirection (Driver, Officer, Admin) using Firebase Auth.
- **Interactive Dashboards**: Tailored views for each user role.
    - **Driver**: Find parking on interactive maps, book spots, and manage vehicles.
    - **Officer**: License plate scanning (OCR), issue tickets, and monitor traffic violations.
    - **Admin**: Comprehensive analytics, report generation (PDF/CSV), and system oversight.
- **Smart Maps**: Integrated **Leaflet** maps for real-time parking spot location and navigation.
- **Digital Wallet**: Simulated wallet for seamless parking payments.
- **Report System**: Automated generation of violation and revenue reports.
- **Modern UI/UX**: Responsive design utilizing Glassmorphism effects and Tailwind CSS.
- **AI/ML Integration**:
    - **Demand Prediction**: Linear Regression algorithm to forecast parking occupancy.
    - **License Plate Recognition**: Optical Character Recognition (OCR) using Tesseract.js.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS
- **Backend/Database**: Firebase (Authentication, Firestore, Storage)
- **Maps & Navigation**: Leaflet, React-Leaflet
- **Data Visualization**: Recharts
- **AI & Logic**: 
    - **OCR**: Tesseract.js
    - **Prediction**: Custom Linear Regression Algorithm
- **Reporting**: jsPDF, jsPDF-AutoTable
- **Icons**: Lucide React
- **Routing**: React Router DOM

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/FullStackFourEyes/FullStackFourEyes-P4-DevCon.git
   cd FullStackFourEyes-P4-DevCon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

---

## 🔑 Test Credentials (Judges)
| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@parkit.com` | `admin123` |
| **Driver** | `driver@parkit.com` | `driver123` |
| **Officer** | `officer@parkit.com` | `officer123` |

---

## ⚠️ Known Limitations
- **Mobile Optimization**: Optimized primarily for tablet/desktop; fully responsive mobile layout is in beta.
- **Payment Processing**: Uses a simulated wallet system for demonstration purposes.
