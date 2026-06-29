Findr — Lost & Found Mobile App
A full-stack Lost & Found application building for my internship assignment Users post items they've lost or found, browse nearby reports, and (optionally) let an LLM auto-fill the listing from a photo or a single sentence and surface likely matches between Lost and Found posts.

Stack: React Native (Expo) + TypeScript on the frontend, Node.js + Express TypeScript + MongoDB on the backend. AI features powered by Groq running 'qwen/qwen3-32b' for text and 'meta-llama/llama-4-scout-17b-16e-instruct' for vision.

Table of contents
Features
Tech stack
Architecture
Folder structure
Getting started
Environment variables
API documentation
Known assumptions
Future improvements
Features
Authentication
Register, login, logout
JWT tokens, bcrypt password hashing
Protected routes via requireAuth middleware
Lost & Found listings
Create / edit / delete / view / browse
Each listing has: images, title, description, category, color, brand, location, date, reward, contact details, type (Lost/Found), status (Active/Matched/Returned/Closed)
Search
Keyword search across title, description, brand, color, tags, location
Filters: category, location, status, listing type
Optional semantic search that asks the LLM for synonyms and matches them against listings (so wallet also surfaces purse, leather wallet, money holder, etc.)
Profile
View and edit your profile (name, phone, bio)
See all the listings you've posted with quick stats
AI features (optional enhancement)
The app works perfectly without AI. The create flow always asks first:

Enable AI assistance? ( ) Yes ( ) No

If you choose Yes, you get two options:

Generate from image — pick a photo, the vision model returns a suggested title, description, category, brand, color and tags.
Generate from text — type one sentence ("I lost my black Nike backpack near the college library"), Qwen 3 32B returns the same structured fields.
Every field stays editable after generation. AI never locks you in.

There's also AI item matching: from a listing you own, tap Run AI match and the backend pulls recent items of the opposite type, asks the LLM to compare them against yours, and returns each candidate with a confidence score (0–100), matched attributes, and a short reason.

UX
Skeleton loaders, pull-to-refresh, pagination on the home feed
Toasts for success/error states
Image preview thumbnails before upload, full-screen image zoom on detail
Confirmation modal for destructive actions
Empty states throughout
Safe-area aware on iOS and Android
Tech stack
Layer	Tech
Mobile	React Native, Expo SDK 54, expo-router, TypeScript
Backend	Node.js, Express 4, TypeScript
Database	MongoDB + Mongoose
Auth	JWT (jsonwebtoken) + bcryptjs
Validation	Zod
AI	Groq Cloud (Qwen 3 32B + Llama 4 Scout vision)
Tooling	ts-node-dev, ESLint, Postman
Architecture
┌────────────────────┐         ┌─────────────────────┐         ┌──────────────┐
│  Expo / React      │  HTTPS  │  Express API        │         │  MongoDB     │
│  Native (TS)       │ ──────▶ │  /api/* routes      │ ──────▶ │  users,      │
│                    │         │  JWT-protected      │         │  listings,   │
│  AuthContext       │ ◀────── │  Zod validated      │         │  matches     │
│  ToastContext      │         │                     │         │              │
└────────────────────┘         │  ┌───────────────┐  │         └──────────────┘
                               │  │ Groq client   │  │
                               │  │ Qwen / Llama4 │  │
                               │  └───────────────┘  │
                               └─────────────────────┘
The Express layer is split into thin controllers, focused Mongoose models, small Zod validators, and a single groq.service.ts that wraps every LLM call behind plain functions (suggestFromImage, suggestFromText, assessMatch, expandQuery). The mobile app talks to it through a single typed api helper.

Folder structure
.
├── backend/
│   ├── src/
│   │   ├── config/          # env loader + mongo connection
│   │   ├── controllers/     # request handlers
│   │   ├── middlewares/     # auth, validation, error handling
│   │   ├── models/          # mongoose schemas (User, Listing, Match)
│   │   ├── routes/          # express routers
│   │   ├── services/        # groq.service.ts (LLM calls)
│   │   ├── utils/           # asyncHandler, token, ApiError
│   │   ├── validators/      # zod schemas
│   │   ├── scripts/seed.ts  # demo data seeder
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── app/                 # expo-router file-based routes
│   │   ├── _layout.tsx      # root, AuthProvider, route gate
│   │   ├── (auth)/          # login, register
│   │   ├── (tabs)/          # browse, search, create, profile
│   │   ├── listing/[id].tsx
│   │   ├── listing/edit/[id].tsx
│   │   └── profile/edit.tsx
│   ├── src/
│   │   ├── components/      # Button, Input, ListingCard, ChipRow, Toast, ...
│   │   ├── contexts/        # AuthContext, ToastContext
│   │   ├── services/        # api.ts, listing.service.ts
│   │   ├── utils/storage/   # secure / general storage helpers
│   │   ├── theme.ts
│   │   ├── types.ts
│   │   └── constants.ts
│   ├── app.json
│   └── package.json
│
└── README.md
Getting started
Prerequisites
Node.js 20+
MongoDB running locally on 27017 (or any URI)
A Groq API key — sign up at https://console.groq.com (free tier is enough)
Expo Go on a phone, or an iOS/Android simulator
1. Backend
cd backend
npm install
npm run seed                     # optional — creates demo@findr.app / demo1234
npm run dev                      # starts on http://localhost:8001
A working backend/.env is included in the ZIP so it boots immediately. Before deploying anywhere real, replace JWT_SECRET with a long random string. The exact same values are also documented in backend/.env.example.

The server prints [server] listening on http://0.0.0.0:8001 on success and exposes a health check at GET /api/health.

2. Frontend
cd frontend
# Set EXPO_PUBLIC_BACKEND_URL in .env to wherever your backend is reachable.
# For a simulator that's typically http://localhost:8001.
# For a real device, use your machine's LAN IP.
yarn install
yarn start
Press i for iOS, a for Android, or scan the QR with Expo Go.

3. Logging in
Email: demo@findr.app
Password: demo1234
(Or tap Sign up on the login screen to create your own account.)

Environment variables
backend/.env
Key	Notes
PORT	Default 8001
MONGODB_URI	e.g. mongodb://localhost:27017/lost_and_found
JWT_SECRET	Long random string
JWT_EXPIRES_IN	Default 7d
GROQ_API_KEY	Required only for AI features
GROQ_TEXT_MODEL	Default qwen/qwen3-32b
GROQ_VISION_MODEL	Default meta-llama/llama-4-scout-17b-16e-instruct
frontend/.env
Key	Notes
EXPO_PUBLIC_BACKEND_URL	Base URL of the backend
API documentation
All endpoints live under /api. Routes marked 🔒 require an Authorization: Bearer <token> header.

Auth
Method	Path	Body	Description
POST	/auth/register	{name, email, password, phone?}	Returns { token, user }
POST	/auth/login	{email, password}	Returns { token, user }
POST	/auth/logout 🔒	—	Returns { message } (stateless)
GET	/auth/me 🔒	—	Returns current user
Listings
Method	Path	Notes
GET	/listings	Query: q, category, location, status, type, semantic, page, limit
GET	/listings/:id	Single listing with populated user
GET	/listings/mine/list 🔒	All listings owned by the current user
POST	/listings 🔒	Create — see body below
PUT	/listings/:id 🔒	Update — partial body allowed
DELETE	/listings/:id 🔒	Owner only
Create body:

{
  "type": "lost",
  "title": "Black Nike Backpack",
  "description": "Lost near the college library",
  "category": "Bags",
  "color": "black",
  "brand": "Nike",
  "location": "Main Library",
  "date": "2026-02-10",
  "reward": "₹500",
  "contactName": "Ankita",
  "contactPhone": "+91 7908245659",
  "contactEmail": "",
  "images": ["data:image/jpeg;base64,..."],
  "tags": ["backpack", "nike"]
}
Profile
Method	Path	Notes
GET	/users/me 🔒	Current user profile
PUT	/users/me 🔒	Update name / phone / bio / avatar
AI
Method	Path	Body	Notes
POST	/ai/from-text 🔒	{text}	Qwen 3 32B → suggestion
POST	/ai/from-image 🔒	{image, mimeType?} (base64)	Llama 4 Scout vision → suggestion
Matches
Method	Path	Notes
GET	/matches/:id 🔒	Owner only; returns ranked candidates with score, reason, matched
Known assumptions
Images are stored as base64 strings inside the listing document. For production you'd swap this for S3 / Cloudinary and store only a URL.
Logout is purely client-side. The JWT stays valid until it expires; the client just drops the token. If needed real revocation, have to add a short-lived access token + a refresh token table.
Match scoring is done at request time (no background worker). For a larger dataset need precompute matches in a queue.
The AI service responds with JSON because of the force response_format and strip <think> tags Qwen sometimes emits. If the model ever returns unparseable text we surface a 502 rather than guessing.
Future improvements
Cloud image hosting (Cloudinary / S3 signed uploads)
Real-time chat between the lost-item poster and the found-item finder
Push notifications when a new match crosses a confidence threshold
Map view for nearby listings using geolocation
Admin moderation tools
Web build with shared components
