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
