# Plex Meet — Modern Video Conferencing

A professional-grade, real-time video conferencing platform built with React, WebRTC, and Socket.io. Rebuilt for high performance, modularity, and a premium "Stitch" design experience.

## ✨ Features

- **Plex Grid**: Intelligent 3x3 video layout that adapts to participant count.
- **Micro-Animations**: Powered by Framer Motion for smooth transitions and panel toggles.
- **Ghost Protection**: Stable `peerId` persistence (localStorage) to prevent duplicate tiles on refresh.
- **Active Speaker Detection**: Real-time audio analysis to highlight who is talking.
- **Rich Interaction**: Instant chat, screen sharing, and media state synchronization.
- **Glassmorphism UI**: High-end dark theme inspired by modern conferencing tools.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies for both the client and the signaling server:

```bash
# Clone the repo
git clone https://github.com/Awnish-sahdeo/Plex-Meet.git
cd Plex-Meet

# Install Signaling Server dependencies
cd signaling-server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_SIGNALING_URL=http://localhost:4000
```

### 4. Running Locally
Open two terminal windows:

**Terminal 1 (Server):**
```bash
cd signaling-server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```
Visit `http://localhost:3000` to start a meeting.

---

## 📦 Deployment

### Signaling Server (Node.js)
The server can be deployed to any Node-compatible host (Render, Railway, or VPS):
1. Ensure the `PORT` environment variable is set.
2. The server uses Socket.io; ensure the host supports WebSockets.

### Frontend (Next.js)
Deploy the `client` folder to **Vercel**:
1. Connect your GitHub repository.
2. Set the `Root Directory` to `client`.
3. Set the `NEXT_PUBLIC_SIGNALING_URL` to your deployed server URL.
4. Vercel will automatically handle the build and deployment.

---

## 🛠 Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Node.js, Express, Socket.io
- **Real-Time**: WebRTC (SimplePeer)
- **Icons**: Lucide React
