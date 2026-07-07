# CareerFlow — Premium Job Application Tracker

CareerFlow is a full-stack, production-grade web application designed to help job seekers organize their recruitment pipeline. It features a modern, high-tech dashboard interface inspired by premium Dribbble designs, featuring clean glassmorphism panels, interactive status pills, real-time aggregate charts/statistics, status transition histories, Kanban board workflows, and smooth micro-animations.

---

## 🛠️ Tech Stack
- **Backend:** Node.js + Express (Helmet, Mongo Sanitizer, Rate Limiters)
- **Database:** MongoDB Atlas or local MongoDB (via Mongoose)
- **Frontend:** React (Vite + JavaScript)
- **Testing:** Jest + Supertest (15 integration test cases passing)
- **Authentication:** JWT-based sessions stored in local storage
- **Styling:** Custom Vanilla CSS design system (inspired by Tran Mau Tri Tam)
- **Containerization:** Docker & Docker Compose setup

---

## 🐳 Docker Deployment (Recommended)

You can spin up the entire application stack—**React Frontend, Express Backend, and a local MongoDB instance**—using a single command!

### Steps:
1. Ensure you are in the root directory: `c:\JOB_TRACKER`.
2. Execute the compose build command:
   ```bash
   docker-compose up --build
   ```
3. Open your web browser:
   - Access the **Frontend Application** at `http://localhost:3000`
   - Access the **Backend API Status** at `http://localhost:5000/api/status`
   - The local MongoDB container will run and persist data using Docker Volumes automatically.

---

## 🚀 Manual Local Setup & Installation

If you prefer to run the services outside Docker, follow these steps.

### IMPORTANT: Check Your Terminal Directories First
> [!IMPORTANT]
> The backend and frontend directories are **separate codebases** with independent `package.json` configurations and their own `node_modules` folders. 
> Always check your terminal prompt's current folder path before running `npm` commands:
> - Running backend commands requires your terminal to be in the `/backend` directory.
> - Running frontend commands requires your terminal to be in the `/frontend` directory.

---

### Step 1: Clone or Open the Project Folder
Open your terminal in the root directory: `c:\JOB_TRACKER`.

---

### Step 2: Configure Backend Environment
1. Open the `/backend` folder.
2. Duplicate the `.env.example` file and rename it to `.env`.
3. Configure the environment variables inside `.env`:
   - `PORT=5000`
   - `JWT_SECRET=your_custom_jwt_secret_key`
   - `MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority`

#### ⚠️ Critical MongoDB Atlas URI Warnings:
> [!CAUTION]
> **Avoid These Common `.env` Mistakes:**
> 1. **Do not leave the brackets `<` and `>`** in your connection string. They are placeholders. Replace `<username>` with your actual Database User name, `<password>` with your Database User password, and `<dbname>` with your database name (e.g., `job_tracker`).
>    - *Incorrect:* `mongodb+srv://dbUser:<my-password>@cluster.mongodb.net/<my-db>`
>    - *Correct:* `mongodb+srv://dbUser:myPassword123@cluster.mongodb.net/job_tracker?retryWrites=true&w=majority`
> 2. **Watch out for special characters in your password:** If your database password contains characters like `@`, `:`, `/`, `+`, or `#`, you **MUST** URL-encode them. If you do not, the connection string will fail to parse and your server will crash or run in fallback mode.
>    - `@` becomes `%40`
>    - `:` becomes `%3A`
>    - `/` becomes `%2F`
>    - `+` becomes `%2B`
>    - `#` becomes `%23`
> 3. **Ensure the prefix `MONGO_URI=` is exactly present** and that there are no spaces or trailing comments on the line.

---

### Step 3: Install & Start Backend
1. Open a terminal panel and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the integration test suite:
   ```bash
   npm run test
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Note: If MongoDB Atlas connection string is not provided, the backend automatically boots in **OFFLINE/MOCK** mode with simulated data on Port 5000. You can login/signup using any email account to preview all features.*

---

### Step 4: Install & Start Frontend
1. Open a **second terminal panel** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL in your web browser (typically `http://localhost:5173`).

---

## 🗃️ Database Seeding

To quickly populate a user's dashboard with realistic, sample job applications (Stripe, Google, Vercel, Netflix), you can run our seeding script:

### Steps:
1. Ensure your `MONGO_URI` is configured in `backend/.env`.
2. Register a new user using the signup page (e.g. `user@example.com`).
3. Run the seeder from the root folder:
   ```bash
   npm run seed-backend -- user@example.com
   ```
4. Refresh your dashboard to see the pre-populated pipeline!

---

## ☁️ Cloud Deployment on Vercel (100% Free Tier)

You can host both the frontend React client and the backend Express API for free on Vercel as two connected projects:

### Step 1: Deploy the Backend API
1. Create a free account on [Vercel](https://vercel.com).
2. Connect your GitHub repository: `https://github.com/addi008/Job_Tracker`.
3. In Vercel, click **Add New** ➔ **Project** and import the repository.
4. On the configuration page:
   - Click **Edit** next to the Root Directory, select **`backend`**, and click **Continue**.
5. Add these environment variables under the "Environment Variables" section:
   - `MONGO_URI` = `mongodb+srv://...` (your live MongoDB Atlas URL)
   - `JWT_SECRET` = `your_secure_random_key` (generate a long string)
6. Click **Deploy**. Vercel will read `backend/vercel.json` and deploy it as a Serverless API.
7. Copy the generated API URL (e.g., `https://job-tracker-backend.vercel.app`).

### Step 2: Deploy the Frontend Client
1. In the Vercel Dashboard, click **Add New** ➔ **Project** and import the same repository again.
2. On the configuration page:
   - Click **Edit** next to the Root Directory, select **`frontend`**, and click **Continue**.
3. Add this environment variable:
   - `VITE_API_URL` = `https://job-tracker-backend.vercel.app` (replace with your backend's actual Vercel URL).
4. Click **Deploy**. Vercel will deploy the static client using `frontend/vercel.json` routing configurations.

---

## 🗄️ Database Structure

The Mongoose models are:
- **User:**
  - `email` (Unique, index-optimized, lowercase)
  - `password` (Hashed using `bcryptjs`)
- **JobApplication:**
  - `user` (Reference to the User)
  - `company` (String, required)
  - `role` (String, required)
  - `status` (Enum: `Applied`, `Interview`, `Offer`, `Rejected`, default: `Applied`)
  - `appliedDate` (Date, defaults to now)
  - `jobLink` (String, optional url)
  - `notes` (String, optional details)
  - `salary` (Number, optional)
  - `currency` (String, default: `USD`)
  - `location` (Enum: `Remote`, `Hybrid`, `On-site`, default: `Remote`)
  - `jobType` (Enum: `Full-time`, `Part-time`, `Contract`, `Internship`, default: `Full-time`)
  - `history` (Array of status transition snapshots containing `{ status, updatedAt }`)
  - **Database Indexes:** Compound indexing on `{ user: 1, status: 1 }` and `{ user: 1, appliedDate: -1 }` for high-throughput query optimization.
