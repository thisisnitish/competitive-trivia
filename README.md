# Real-Time Multi-Player Trivia Game

A competitive trivia game where players join rooms, answer questions under time pressure, and compete on live leaderboards.

## Features

- **Simple Authentication**: Username only (no passwords)
- **Real-time Gameplay**: WebSocket-based multiplayer experience
- **Live Scoreboard**: See scores update in real-time
- **Speed Bonus**: Answer quickly to earn more points
- **Multiple Categories**: Questions from Science, History, Geography, Sports, Entertainment, Technology, Literature, Mathematics, Art, and Music

## Tech Stack

### Backend
- Node.js
- Express
- Socket.io
- Questions stored in JSON file

### Frontend
- React
- Vite
- Socket.io-client
- SCSS

## Project Structure

```
competitive-trivia/
├── backend/
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   └── gameManager.js     # Game logic
│   ├── data/
│   │   └── questions.json     # Question bank (50 questions)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── styles/            # SCSS files
│   │   ├── utils/             # Socket connection
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```
The server will run on `http://localhost:3000`

2. **Start the Frontend Development Server** (in a new terminal)
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

3. **Open the Application**
- Open `http://localhost:5173` in your browser
- Open multiple browser tabs/windows to test multiplayer functionality

## How to Play

1. **Enter Your Username**: Start by entering a unique username (3-20 alphanumeric characters)

2. **Create or Join a Room**:
   - **Create Room**: Generate a new room code to share with friends
   - **Join Room**: Enter an existing room code to join a game

3. **Waiting Lobby**: Wait for at least 2 players to join. The host can start the game.

4. **Answer Questions**:
   - Each question has 4 options
   - You have 10 seconds to answer
   - Faster answers earn more points!

5. **Scoring**:
   - Correct answer: 100 points
   - Speed bonus: up to 50 additional points based on how quickly you answer
   - Total possible per question: 150 points

6. **View Results**: After all questions, see the final leaderboard and your performance stats

## Game Configuration

Default settings (can be modified in the code):
- Questions per game: 10
- Time per question: 10 seconds
- Max players per room: 10
- Minimum players: 2

## File Locations

### Backend Files
- **Server**: `backend/src/server.js`
- **Game Logic**: `backend/src/gameManager.js`
- **Questions**: `backend/data/questions.json`

### Frontend Files
- **Main App**: `frontend/src/App.jsx`
- **Components**: `frontend/src/components/`
- **Styles**: `frontend/src/styles/`
- **Socket Utils**: `frontend/src/utils/socket.js`

## Adding More Questions

Edit `backend/data/questions.json` and add questions in this format:

```json
{
  "id": "unique-id",
  "category": "Category Name",
  "question": "Your question?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "timeLimit": 10
}
```

**Note**: `correctAnswer` is the index (0-3) of the correct option in the `options` array.
