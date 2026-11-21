# 🛠️ FixMate LK — On-Demand Home Service Marketplace

**FixMate LK** is a full-stack on-demand home service and technician discovery platform built for Sri Lanka. It connects homeowners across all 25 districts with verified local professionals (plumbers, electricians, AC technicians, appliance repairers, carpenters, and painters) through transparent pricing, real-time job tracking, and AI-powered issue diagnosis.

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Dedicated portals and workflows for **Customers**, **Technicians**, and **Platform Admins**.
- **Enterprise-Grade Security:** Stateless **JWT authentication** and **BCrypt password hashing** powered by Spring Security.
- **4-Digit OTP Job Verification Handshake:** Ensures physical on-site verification before a technician begins work.
- **Multimodal Google Gemini AI Diagnosis Assistant:** Conversational Gemini-inspired assistant that analyzes user descriptions and uploaded photos of broken items to classify the service category, assess urgency, estimate costs in **LKR**, and match users with relevant technicians.
- **End-to-End Booking & Quotation Lifecycle:** Dynamic repair quotes, promo code engine (`FIRST500`, `FIX10`), real-time notifications, in-app job chat, ratings/reviews, and dispute resolution.

---

## 🏗️ Tech Stack & Architecture

**Three-Tier Decoupled Architecture** (`Controller` → `Service` → `Repository` → `Entity`):

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS, Axios, Lucide React |
| **Backend** | Java, Spring Boot 3, Spring Security (JWT + BCrypt), Spring Data JPA / Hibernate |
| **Database** | MySQL (`fixmate_lk_db`) |
| **AI Integration** | Google Gemini API (`gemini-2.5-flash` with multimodal image support) |

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Java JDK 17+**
- **Node.js 18+**
- **MySQL 8.0+** (or XAMPP MySQL on port `3306`)

### 1. Database Setup
Start MySQL and create an empty database named `fixmate_lk_db` (JPA auto-generates the schema and seeds initial accounts on startup):
```sql
CREATE DATABASE fixmate_lk_db;
