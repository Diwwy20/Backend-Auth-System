# 🛡️ Backend-Auth-System

This service is built with **NestJS** and handles user authentication and profile management, including:

- User Registration (Sign Up)  
- User Login (Sign In)  
- Fetch User Profile  
- Update User Profile  
- Change Password  

---

## 🚀 Features

- Secure user registration and login with JWT authentication  
- Profile management with update functionality  
- Password change endpoint  
- Integration with Redis for caching/session management  
- Cloudinary integration for user profile images (optional)  

---

## 🛠 Tech Stack

- **Backend Framework**: NestJS (Node.js + TypeScript)  
- **Database**: PostgreSQL (Neon)  
- **Cache**: Redis  
- **Cloud Storage**: Cloudinary (for user images)  
- **Authentication**: JWT (JSON Web Tokens)  

---

## ⚙️ Environment Variables (.env)

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development

DB_URL=postgresql://neondb_owner:npg_gjILc14eomOU@ep-shiny-glade-a1uybeg0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

PORT=4000

Cloud_Name=dyrvqcuag
Cloud_Api_Key=491416462465423
Cloud_Api_Secret=GkZE8i9adRghJtA_FkdXLm9Xx7o

Redis_Host=redis-15014.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com
Redis_Port=15014
Redis_Password=129HxrADtiTIfDmx06RlzwXwXQ8n3a8z

JWT_SEC=<Generate a secret key by running: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste the output here>

---
## 📦 How to Run

1. **Clone the repository**

```bash
git clone https://github.com/Diwwy20/Backend-Auth-System
cd backend-auth-system

2. **Install dependencies**
npm install

3. **Create and configure the .env file**
   - Copy the example above into a .env file in the project root
   - Make sure all environment variables are set correctly

4. **Run the development server**
npm run start:dev
