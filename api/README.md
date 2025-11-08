# Arcade Verse - Google Cloud Skills Boost Points Calculator

A modern web application to calculate and track your Google Cloud Arcade points from your Skills Boost profile.

## 🚀 Features

- **Real-time Points Calculation**: Fetches your actual badges from Google Cloud Skills Boost
- **MongoDB Integration**: Uses real badge point values from your database
- **Consistent Results**: No more random points - always returns your actual score
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Leaderboard**: Compare your progress with other users
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **MongoDB Atlas** for data storage
- **Mongoose** for database modeling
- **Axios** for HTTP requests
- **Netlify Functions** for serverless deployment

## 📁 Project Structure

```
arcade-verse/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   └── PointsCalculator.tsx # Main calculator component
│   ├── services/                # API services
│   ├── pages/                   # Page components
│   └── lib/                     # Utilities and contexts
├── server/                       # Express backend (for local development)
│   ├── src/
│   │   ├── index.js            # Main server file
│   │   └── utils/
│   │       └── pointsCalculator.js # Points calculation logic
│   └── package.json            # Backend dependencies
├── netlify/
│   └── functions/              # Serverless functions for production
│       ├── calculate-points.js
│       ├── get-user.js
│       └── leaderboard.js
├── package.json                # Frontend dependencies
├── netlify.toml               # Netlify configuration
└── README.md                  # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account

### Local Development

1. **Clone and install dependencies:**
```bash
npm install
cd server && npm install && cd ..
```

2. **Set up environment variables:**
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

3. **Start the development servers:**
```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend
npm run dev
```

4. **Open your browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Deployment

**Deploy to Netlify:**

1. Connect your GitHub repository to Netlify
2. Set build command: `npm ci && npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `MONGODB_URI`
5. Deploy!

The app will automatically use:
- Serverless functions in production
- Local Express server in development

## 🎯 How to Use

1. **Get your profile URL:**
   - Go to [Google Cloud Skills Boost](https://www.cloudskillsboost.google/)
   - Navigate to your public profile
   - Copy the URL (format: `https://www.cloudskillsboost.google/public_profiles/your-id`)

2. **Calculate your points:**
   - Enter your profile URL in the calculator
   - Click "Calculate"
   - View your total points and badge breakdown

3. **Track progress:**
   - Your profile is automatically saved
   - Check the leaderboard to see your ranking
   - Re-run calculations to update your score

## 🔍 API Endpoints

### Frontend API (Automatic routing)
- `POST /api/calculate-points` - Calculate points for a profile
- `GET /api/get-user/{profileUrl}` - Get stored user data
- `GET /api/leaderboard` - Get top 100 users

### Local Development API
- `POST http://localhost:5000/api/calculate-points`
- `GET http://localhost:5000/api/user/{profileUrl}`
- `GET http://localhost:5000/api/leaderboard`

## 🐛 Troubleshooting

### "Failed to connect to server"
- **Local**: Make sure backend server is running on port 5000
- **Production**: Check Netlify function logs for errors

### "Different points each time"
- ✅ **Fixed!** The app now uses real API calls instead of random generation

### Database connection issues
- Verify your MongoDB URI is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database user has read/write permissions

## 🔒 Environment Variables

### Required
- `MONGODB_URI`: Your MongoDB Atlas connection string

### Optional
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

## 📝 Badge Point System

The application uses a flexible point system stored in MongoDB:

- **Default Points**: 1 point per badge (for new/unknown badges)
- **Custom Points**: Set in your MongoDB `AvailableBadge` collection
- **Auto-Discovery**: New badges are automatically added with default points

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Cloud Skills Boost for the badge data
- shadcn/ui for the component library
- Netlify for hosting and serverless functions
- MongoDB Atlas for database services

---

**Built with ❤️ for the Google Cloud community**
