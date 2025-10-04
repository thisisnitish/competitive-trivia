const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const gameManager = new GameManager();
const QUESTION_INTERVAL = 3000; // 3 seconds between questions
const COUNTDOWN_TIME = 3000; // 3 seconds countdown before game starts
const activeTimers = new Map(); // Track active question timers

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create room
  socket.on('create-room', ({ username }) => {
    const { roomId, code } = gameManager.createRoom(socket.id, username);
    socket.join(roomId);

    const room = gameManager.getRoom(roomId);

    socket.emit('room-created', {
      roomId,
      code,
      room: sanitizeRoom(room)
    });

    console.log(`Room created: ${code} by ${username}`);
  });

  // Join room
  socket.on('join-room', ({ code, username }) => {
    const result = gameManager.findRoomByCode(code);

    if (!result) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const { roomId, room } = result;
    const joinResult = gameManager.addPlayerToRoom(roomId, socket.id, username);

    if (!joinResult.success) {
      socket.emit('error', { message: joinResult.error });
      return;
    }

    socket.join(roomId);

    // Notify all players in room
    io.to(roomId).emit('player-joined', {
      player: { id: socket.id, username },
      room: sanitizeRoom(joinResult.room)
    });

    socket.emit('room-joined', {
      roomId,
      room: sanitizeRoom(joinResult.room)
    });

    console.log(`${username} joined room: ${code}`);
  });

  // Start game
  socket.on('start-game', ({ roomId }) => {
    const room = gameManager.getRoom(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.creatorId !== socket.id) {
      socket.emit('error', { message: 'Only room creator can start game' });
      return;
    }

    const result = gameManager.startGame(roomId);

    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }

    // Emit countdown
    io.to(roomId).emit('game-starting', { countdown: 3 });

    console.log(`Game starting in room: ${room.code}`);

    // Start countdown and then first question
    setTimeout(() => {
      io.to(roomId).emit('game-started');
      startNextQuestion(roomId);
    }, COUNTDOWN_TIME);
  });

  // Submit answer
  socket.on('submit-answer', ({ roomId, questionId, answer, timestamp }) => {
    const result = gameManager.submitAnswer(roomId, socket.id, questionId, answer, timestamp);

    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }

    socket.emit('answer-submitted', { success: true });

    // Check if all players have answered
    const room = gameManager.getRoom(roomId);
    if (room && room.state === 'active') {
      const currentQuestion = room.questions[room.currentQuestionIndex];
      const answers = room.answers[questionId] || {};
      const answeredCount = Object.keys(answers).length;
      const totalPlayerCount = room.players.length;

      // If all players have answered, end question early
      if (answeredCount >= totalPlayerCount) {
        const timerKey = `${roomId}-${questionId}`;
        const timer = activeTimers.get(timerKey);

        if (timer) {
          clearTimeout(timer.timeout);
          endQuestion(roomId, questionId, timer.startTime, currentQuestion.timeLimit);
        }
      }
    }
  });

  // Leave room
  socket.on('leave-room', () => {
    handlePlayerLeave(socket.id);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    handlePlayerLeave(socket.id);
  });
});

function startNextQuestion(roomId) {
  const result = gameManager.nextQuestion(roomId);

  if (!result) return;

  if (result.completed) {
    // Game over
    const leaderboard = gameManager.getLeaderboard(roomId);
    io.to(roomId).emit('game-ended', {
      leaderboard,
      room: sanitizeRoom(result.room)
    });
    console.log(`Game completed in room: ${result.room.code}`);
    return;
  }

  const { question, questionNumber, totalQuestions } = result;
  const questionStartTime = Date.now();

  // Broadcast new question
  io.to(roomId).emit('question-new', {
    question,
    questionNumber,
    totalQuestions,
    startTime: questionStartTime
  });

  console.log(`Question ${questionNumber}/${totalQuestions} sent to room`);

  // Set timer for question timeout
  const timerKey = `${roomId}-${question.id}`;
  const timeout = setTimeout(() => {
    endQuestion(roomId, question.id, questionStartTime, question.timeLimit);
  }, question.timeLimit * 1000 + 500); // Add 500ms buffer

  // Store timer reference
  activeTimers.set(timerKey, {
    timeout,
    startTime: questionStartTime
  });
}

function endQuestion(roomId, questionId, questionStartTime, timeLimit) {
  const timerKey = `${roomId}-${questionId}`;
  activeTimers.delete(timerKey);

  const scoreResults = gameManager.calculateScores(
    roomId,
    questionId,
    questionStartTime,
    timeLimit
  );

  if (scoreResults) {
    io.to(roomId).emit('scores-updated', {
      correctAnswer: scoreResults.correctAnswer,
      results: scoreResults.results,
      scores: scoreResults.scores
    });

    // Move to next question after showing results
    setTimeout(() => {
      startNextQuestion(roomId);
    }, QUESTION_INTERVAL);
  }
}

function handlePlayerLeave(playerId) {
  const result = gameManager.removePlayerFromRoom(playerId);

  if (result && result.roomClosed) {
    console.log('Room closed - no players remaining');
    return;
  }

  if (result && result.room) {
    io.to(result.roomId).emit('player-left', {
      playerId,
      room: sanitizeRoom(result.room)
    });
    console.log('Player left room');
  }
}

// Remove sensitive data before sending room to clients
function sanitizeRoom(room) {
  const sanitized = { ...room };
  delete sanitized.correctAnswers;
  return sanitized;
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
