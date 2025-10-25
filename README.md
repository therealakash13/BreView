# 📚 BreView — Book Review Web App

BreView is a simple yet powerful web application where users can **search books**, **read details**, and **write reviews**.  
Built with **Node.js, Express, EJS**, and **PostgreSQL** — it demonstrates clean architecture, authentication, and CRUD functionality.

---

## 🚀 Features

- 🔍 **Search books** using Google Books API
- 📖 **View book details** (image, title, author, publish date, description, etc.)
- ✍️ **Add and edit reviews** with ratings
- 🔐 **User authentication** (Register/Login with hashed passwords & pepper security)
- 🧩 **Relational database** (Books linked with Users via foreign key)
- 🗃️ Persistent storage using **Supabase PostgreSQL**

---

## 🧠 Key Takeaways

- Learned **how to connect Node.js with Supabase PostgreSQL**
- Implemented **secure authentication** using `bcrypt` with **pepper** and **salt**
- Designed **relational database models** (Users ↔ Books)
- Practiced **RESTful routes and Express middlewares**
- Used **EJS templates** for rendering dynamic data
- Gained experience handling **API integration**, **sessions**, and **cookies**

---

## 🏗️ Tech Stack

| Category | Technology                                 |
| -------- | ------------------------------------------ |
| Backend  | Node.js, Express                           |
| Frontend | EJS, CSS                                   |
| Database | PostgreSQL (Supabase)                      |
| Auth     | bcrypt, express-session, connect-pg-simple |
| API      | Google Books API                           |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/therealakash13/BreView.git
cd breview
```

### 2. Install dependencies

`npm install`

### 3. Create a `.env` File

`PORT=3000
API_KEY=your_google_books_api_key
DB_USER=postgres
DB_HOST=db.your-supabase-host.supabase.co
DB_DATABASE=postgres
DB_PASSWORD=your_db_password
DB_PORT=5432
PEPPER=RandomPepperOnTheSalt
SESSION_SECRET=your_secret_key`

### 4. Run the Server

`npm start`

or

`nodemon server.js`

---

## 🧾 Database Schema

### **users**

| Column   | Type               | Description     |
| -------- | ------------------ | --------------- |
| id       | SERIAL PRIMARY KEY | Unique user ID  |
| username | VARCHAR(50)        | Unique username |
| password | TEXT               | Hashed password |

### **books**

| Column       | Type               | Description           |
| ------------ | ------------------ | --------------------- |
| id           | SERIAL PRIMARY KEY | Book entry ID         |
| book_id      | TEXT               | Google Books ID       |
| image        | TEXT               | image URL             |
| title        | TEXT               | Book title            |
| author_name  | VARCHAR(45)[]      | Array of author names |
| publish_date | TEXT               | Date of publication   |
| description  | TEXT               | Book description      |
| rating       | NUMERIC(2,1)       | User rating           |
| review       | TEXT               | Review text           |
| user_id      | INTEGER (FK)       | Linked user           |

---

## 📬 Contact

💡 **Author:** Akash  
📧 **Email**: therealakash13@gmail.com  
🌐 **Portfolio**: _coming soon_

---
