# 📱 Phone Repair Desk

A modern, full-stack management desk for electronic device repair shops. Track repair tickets, organize inventory, manage customer details, and streamline technician workflows in a unified dashboard.

---

## 🛠 Tech Stack

### Frontend

- ⚡ **React** (TypeScript)
- 🎨 **Tailwind CSS**
- 🌐 **Axios / React Query**
- 📦 **Vite**

### Backend & Database

- 🚀 **Node.js** & **Express 5** (TypeScript / TSX)
- 🐘 **PostgreSQL**
- 🗄️ **Sequelize ORM**
- 🛡️ **Passport.js & JWT** (with `bcrypt` password hashing)
- 🔍 **Zod** schema validation

---

## 📂 Project Structure

```plaintext
phone-repair-desk/
├── backend/            # Express REST API, Sequelize models, & auth logic
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/           # React single-page dashboard application
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md

✨ Features
🎫 Ticket Lifecycle: Create, assign, update, and resolve repair service requests.

👥 Customer Management: Maintain customer contact info, device histories, and status logs.

📦 Parts & Inventory Tracking: Keep tabs on component stock levels and repair costs.

🔐 Authentication & Security: Secure JWT & Passport-based authentication with bcrypt hashing and Zod input validation.

🚀 Getting Started
Prerequisites
Node.js (v18+ recommended)

PostgreSQL running locally or hosted (e.g., Supabase / Neon)

Git

Installation & Local Setup
Clone the repository

Bash
git clone git@personal:amandeep-singh-sandhu/phone-repair-desk.git
cd phone-repair-desk
Backend Setup

Bash
cd backend
npm install
Create a .env file in the backend/ directory:

Code snippet
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/repairdesk
JWT_SECRET=your_jwt_secret_key
Start the backend in development mode:

Bash
npm run dev
Frontend Setup

Bash
cd ../frontend
npm install
Create a .env file in the frontend/ directory:

Code snippet
VITE_API_URL=http://localhost:5000/api
Start the client:

Bash
npm run dev

📄 License
This project is licensed under the ISC License.
