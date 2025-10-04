const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class GameManager {
  constructor() {
    this.rooms = new Map();
    this.players = new Map();
    this.questions = [];
    this.loadQuestions();
  }

  loadQuestions() {
    try {
      const questionsPath = path.join(__dirname, '../data/questions.json');
      const data = fs.readFileSync(questionsPath, 'utf8');
      const parsed = JSON.parse(data);
      this.questions = parsed.questions;
      console.log(`Loaded ${this.questions.length} questions`);
    } catch (error) {
      console.error('Error loading questions:', error);
      this.questions = [];
    }
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom(creatorId, username) {
    const roomId = uuidv4();
    const code = this.generateRoomCode();

    const room = {
      id: roomId,
      code,
      creatorId,
      players: [],
      maxPlayers: 10,
      state: 'waiting', // waiting, starting, active, completed
      currentQuestionIndex: -1,
      questions: [],
      answers: {},
      scores: {},
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    this.addPlayerToRoom(roomId, creatorId, username);

    return { roomId, code };
  }

  addPlayerToRoom(roomId, playerId, username) {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    if (room.state !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    // Check if username is already taken in this room
    const usernameTaken = room.players.some(p => p.username === username);
    if (usernameTaken) {
      return { success: false, error: 'Username already taken in this room' };
    }

    const player = {
      id: playerId,
      username,
      score: 0,
      connected: true,
      correctAnswers: 0
    };

    room.players.push(player);
    room.scores[playerId] = 0;
    this.players.set(playerId, { roomId, username });

    return { success: true, room };
  }

  findRoomByCode(code) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.code === code) {
        return { roomId, room };
      }
    }
    return null;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  removePlayerFromRoom(playerId) {
    const playerData = this.players.get(playerId);
    if (!playerData) return null;

    const room = this.rooms.get(playerData.roomId);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    this.players.delete(playerId);

    // If creator left and game hasn't started, assign new creator or close room
    if (room.creatorId === playerId && room.state === 'waiting') {
      if (room.players.length > 0) {
        room.creatorId = room.players[0].id;
      } else {
        this.rooms.delete(playerData.roomId);
        return { roomClosed: true };
      }
    }

    return { room, roomId: playerData.roomId };
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    if (room.state !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    if (room.players.length < 2) {
      return { success: false, error: 'Need at least 2 players' };
    }

    // Select random questions
    const selectedQuestions = this.getRandomQuestions(10);
    room.questions = selectedQuestions.map(q => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      timeLimit: q.timeLimit,
      // Don't send correctAnswer to clients
    }));

    // Store correct answers separately
    room.correctAnswers = {};
    selectedQuestions.forEach(q => {
      room.correctAnswers[q.id] = q.correctAnswer;
    });

    room.state = 'starting';
    room.currentQuestionIndex = -1;

    return { success: true, room };
  }

  getRandomQuestions(count) {
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  nextQuestion(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentQuestionIndex++;

    if (room.currentQuestionIndex >= room.questions.length) {
      room.state = 'completed';
      return { completed: true, room };
    }

    room.state = 'active';
    const currentQuestion = room.questions[room.currentQuestionIndex];
    room.answers[currentQuestion.id] = {};

    return {
      completed: false,
      question: currentQuestion,
      questionNumber: room.currentQuestionIndex + 1,
      totalQuestions: room.questions.length,
      room
    };
  }

  submitAnswer(roomId, playerId, questionId, answerIndex, timestamp) {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    if (room.state !== 'active') {
      return { success: false, error: 'Game not active' };
    }

    const currentQuestion = room.questions[room.currentQuestionIndex];
    if (currentQuestion.id !== questionId) {
      return { success: false, error: 'Invalid question' };
    }

    // Check if already answered
    if (room.answers[questionId] && room.answers[questionId][playerId]) {
      return { success: false, error: 'Already answered' };
    }

    // Store answer
    if (!room.answers[questionId]) {
      room.answers[questionId] = {};
    }

    room.answers[questionId][playerId] = {
      answer: answerIndex,
      timestamp
    };

    return { success: true };
  }

  calculateScores(roomId, questionId, questionStartTime, timeLimit) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const correctAnswer = room.correctAnswers[questionId];
    const questionAnswers = room.answers[questionId] || {};

    const results = {};

    room.players.forEach(player => {
      const playerAnswer = questionAnswers[player.id];

      if (playerAnswer && playerAnswer.answer === correctAnswer) {
        // Calculate score with speed bonus
        const timeTaken = (playerAnswer.timestamp - questionStartTime) / 1000; // in seconds
        const timeRemaining = Math.max(0, timeLimit - timeTaken);
        const speedBonus = Math.floor((timeRemaining / timeLimit) * 50);
        const points = 100 + speedBonus;

        room.scores[player.id] = (room.scores[player.id] || 0) + points;

        // Update player's correct answer count
        const playerObj = room.players.find(p => p.id === player.id);
        if (playerObj) {
          playerObj.score = room.scores[player.id];
          playerObj.correctAnswers = (playerObj.correctAnswers || 0) + 1;
        }

        results[player.id] = {
          correct: true,
          points,
          totalScore: room.scores[player.id]
        };
      } else {
        results[player.id] = {
          correct: false,
          points: 0,
          totalScore: room.scores[player.id] || 0
        };
      }
    });

    return {
      correctAnswer,
      results,
      scores: room.scores
    };
  }

  getLeaderboard(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return room.players
      .map(p => ({
        username: p.username,
        score: room.scores[p.id] || 0,
        correctAnswers: p.correctAnswers || 0
      }))
      .sort((a, b) => b.score - a.score);
  }

  cleanupRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.forEach(player => {
        this.players.delete(player.id);
      });
      this.rooms.delete(roomId);
    }
  }
}

module.exports = GameManager;
