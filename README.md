# TrackLab

TrackLab is a project tracking platform designed for **Idea Lab**. It allows users to create, manage, and submit projects with **OAuth2 authentication**, project completion tracking, **PDF generation**, and email notifications.

## 🚀 Features
- **Google OAuth2 Authentication**
- **Project Creation & Management**
- **Admin Panel for Project Oversight**
- **File Upload Support**
- **PDF Generation Based on Project Status**
- **Automated Email Notifications**
- **Material UI & Framer Motion for Enhanced UI**
- **PostgreSQL with Prisma ORM**
- **Next.js (App Router) for a Modern Development Experience**

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/TrackLab.git
cd TrackLab
```
### 2️⃣ Create an .env File
Inside the project root, create a .env file and add your credentials:

```bash
# Database
DATABASE_URL=your_postgresql_database_url

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Email Configuration
EMAIL_FROM=your_email@example.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# AWS S3 (For Future Storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_s3_region
```
### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Start the Development Server
```bash
npm run dev
```
The app will be available at:
➡️ http://localhost:3000

## 🛠️ Tech Stack
* Next.js (App Router)
* PostgreSQL with Prisma ORM
* Google OAuth2 Authentication
* Multer for File Uploads
* Nodemailer for Email Notifications
* pdf-lib for PDF Generation
* AWS S3 (Planned for Storage)
* Material UI & Framer Motion for UI Enhancements

## 🤝 Contributing
Contributions are welcome! Feel free to open an **issue** or submit a **pull request**.