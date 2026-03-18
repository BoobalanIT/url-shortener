# ✂️ Sniply — URL Shortener

A full-stack URL shortener built with **Node.js**, **Express**, **MongoDB**, and **Angular**. Create custom short links, track clicks, set expiry dates, and manage all your links from a clean dashboard.

---

## 🌐 Live Demo

> Coming soon after deployment on Render + Vercel

---

## 📸 Features

- 🔐 User authentication (Register & Login with JWT)
- ✂️ Create custom short URLs
- 📊 Track click counts per link
- ⏳ Set expiry dates on links
- ✏️ Edit existing short links
- 🗑️ Delete links
- 📋 Copy short link to clipboard
- 🔒 Protected dashboard (only logged-in users can manage links)
- 🌍 Anyone can use a short link — no login required to redirect

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework for building REST APIs |
| **MongoDB** | NoSQL database to store URLs and users |
| **Mongoose** | MongoDB object modeling (ODM) |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **dotenv** | Environment variable management |
| **cors** | Cross-origin resource sharing |
| **helmet** | HTTP security headers |
| **nanoid** | Generating unique short codes |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Angular** | Frontend framework |
| **TypeScript** | Typed JavaScript |
| **Angular Router** | Client-side navigation |
| **HttpClient** | API calls to the backend |
| **Angular Guards** | Protect routes from unauthenticated access |
| **Angular Interceptors** | Auto-attach JWT token to every request |
| **CSS Variables** | Theming and consistent design |

---

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Register & Login logic
│   │   │   └── url.controller.js   # URL CRUD & redirect logic
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js  # JWT verification
│   │   ├── models/
│   │   │   ├── User.js             # User schema
│   │   │   └── Url.js              # URL schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Auth endpoints
│   │   │   └── url.routes.js       # URL endpoints
│   │   └── utils/
│   │       └── response.js         # Standard API response format
│   ├── .env.example                # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                   # Entry point
│
└── frontend/
    └── src/
        └── app/
            ├── guards/
            │   └── auth.guard.ts           # Protect dashboard route
            ├── interceptors/
            │   └── auth.interceptor.ts     # Auto-attach JWT token
            ├── pages/
            │   ├── login/                  # Login page
            │   ├── register/               # Register page
            │   └── dashboard/              # Main dashboard
            ├── services/
            │   ├── auth.service.ts         # Auth API calls
            │   └── url.service.ts          # URL API calls
            └── app.routes.ts               # App routing
```

---

## 🔄 How It Works

### Authentication Flow
```
1. User registers with name, email, password
2. Password is hashed with bcryptjs before saving
3. On login, server verifies password and returns a JWT token
4. Token is stored in localStorage
5. Angular interceptor attaches token to every API request
6. Auth guard checks token before allowing dashboard access
```

### URL Shortening Flow
```
1. Logged-in user enters a long URL + custom short code
2. Backend checks if short code is unique
3. URL is saved to MongoDB with user ID and click count
4. Short URL is returned: yourdomain.com/shortcode
5. Anyone visits the short URL → backend looks it up → redirects
6. Click count increments on every redirect
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Angular CLI (`npm install -g @angular/cli`)

### 1. Clone the repository

```bash
git clone https://github.com/BoobalanIT/url-shortener.git
cd url-shortener
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file (use `.env.example` as template):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/url-shortener
JWT_SECRET=your_generated_secret_key_here
BASE_URL=http://localhost:5000
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account |
| `POST` | `/api/auth/login` | ❌ | Login and get token |

### URLs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/urls/shorten` | ✅ | Create short URL |
| `GET` | `/api/urls/my-urls` | ✅ | Get all my URLs |
| `GET` | `/api/urls/:code/stats` | ✅ | Get click stats |
| `PATCH` | `/api/urls/:code` | ✅ | Update URL |
| `DELETE` | `/api/urls/:code` | ✅ | Delete URL |
| `GET` | `/:code` | ❌ | Redirect to original URL |

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/url-shortener` |
| `JWT_SECRET` | Secret key for signing tokens | `a3f8c2d1e4b5...` |
| `BASE_URL` | Base URL of your backend | `http://localhost:5000` |

---

## 🗄️ Database Schema

### User
```js
{
  name:      String,   // required
  email:     String,   // required, unique
  password:  String,   // hashed with bcryptjs
  createdAt: Date,
  updatedAt: Date
}
```

### URL
```js
{
  shortCode:   String,    // unique custom code
  originalUrl: String,    // the long URL
  createdBy:   ObjectId,  // reference to User
  clicks:      Number,    // click counter
  expiresAt:   Date,      // optional expiry
  createdAt:   Date,
  updatedAt:   Date
}
```

---

## 🚢 Deployment

### Backend → Render
1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set environment variables in Render dashboard
5. Deploy!

### Frontend → Vercel
1. Push frontend to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `BASE_URL` to your Render backend URL
4. Deploy!

### Database → MongoDB Atlas
1. Create free cluster on [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Set as `MONGO_URI` in Render environment variables

---

## 👤 Author

**Boobalan**
- GitHub: [@BoobalanIT](https://github.com/BoobalanIT)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
