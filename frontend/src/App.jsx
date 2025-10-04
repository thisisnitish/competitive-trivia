import { useState, useEffect } from 'react';
import { getSocket } from './utils/socket';
import Auth from './components/Auth';
import RoomSelector from './components/RoomSelector';
import WaitingLobby from './components/WaitingLobby';
import Countdown from './components/Countdown';
import GameScreen from './components/GameScreen';
import Results from './components/Results';
import './styles/App.scss';

function App() {
  const [username, setUsername] = useState('');
  const [gameState, setGameState] = useState('auth'); // auth, room-select, lobby, countdown, playing, results
  const [room, setRoom] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [scores, setScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');
  const [userAnswered, setUserAnswered] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // Room created
    socket.on('room-created', ({ roomId, code, room }) => {
      setRoom(room);
      setGameState('lobby');
    });

    // Room joined
    socket.on('room-joined', ({ roomId, room }) => {
      setRoom(room);
      setGameState('lobby');
    });

    // Player joined
    socket.on('player-joined', ({ player, room }) => {
      setRoom(room);
    });

    // Player left
    socket.on('player-left', ({ playerId, room }) => {
      setRoom(room);
    });

    // Game starting countdown
    socket.on('game-starting', ({ countdown }) => {
      setGameState('countdown');
    });

    // Game started
    socket.on('game-started', () => {
      // Countdown component will handle transition to playing
    });

    // New question
    socket.on('question-new', ({ question, questionNumber, totalQuestions, startTime }) => {
      setCurrentQuestion(question);
      setQuestionNumber(questionNumber);
      setTotalQuestions(totalQuestions);
      setQuestionStartTime(startTime);
      setShowResults(false);
      setCorrectAnswer(null);
      setUserAnswered(false);
      setGameState('playing');
    });

    // Answer submitted confirmation
    socket.on('answer-submitted', () => {
      setUserAnswered(true);
    });

    // Scores updated
    socket.on('scores-updated', ({ correctAnswer, results, scores }) => {
      setCorrectAnswer(correctAnswer);
      setScores(scores);
      setShowResults(true);
    });

    // Game ended
    socket.on('game-ended', ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setGameState('results');
    });

    // Error
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-starting');
      socket.off('game-started');
      socket.off('question-new');
      socket.off('answer-submitted');
      socket.off('scores-updated');
      socket.off('game-ended');
      socket.off('error');
    };
  }, []);

  const handleUsernameSubmit = (name) => {
    setUsername(name);
    setGameState('room-select');
  };

  const handleCreateRoom = () => {
    const socket = getSocket();
    socket.emit('create-room', { username });
  };

  const handleJoinRoom = (code) => {
    const socket = getSocket();
    socket.emit('join-room', { code, username });
  };

  const handleStartGame = () => {
    const socket = getSocket();
    socket.emit('start-game', { roomId: room.id });
  };

  const handleLeaveRoom = () => {
    const socket = getSocket();
    socket.emit('leave-room');
    setRoom(null);
    setGameState('room-select');
  };

  const handleSubmitAnswer = (answerIndex) => {
    const socket = getSocket();
    socket.emit('submit-answer', {
      roomId: room.id,
      questionId: currentQuestion.id,
      answer: answerIndex,
      timestamp: Date.now()
    });
  };

  const handlePlayAgain = () => {
    setGameState('room-select');
    setRoom(null);
    setCurrentQuestion(null);
    setScores({});
    setLeaderboard([]);
  };

  const handleCountdownComplete = () => {
    setGameState('playing');
  };

  return (
    <div className="app">
      {error && (
        <div className="error-toast">
          {error}
        </div>
      )}

      {gameState === 'auth' && (
        <Auth onSubmit={handleUsernameSubmit} />
      )}

      {gameState === 'room-select' && (
        <RoomSelector
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {gameState === 'lobby' && room && (
        <WaitingLobby
          room={room}
          username={username}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {gameState === 'countdown' && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {gameState === 'playing' && currentQuestion && room && (
        <GameScreen
          question={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          timeLimit={currentQuestion.timeLimit}
          onSubmitAnswer={handleSubmitAnswer}
          scores={scores}
          players={room.players}
          username={username}
          showResults={showResults}
          correctAnswer={correctAnswer}
          userAnswered={userAnswered}
        />
      )}

      {gameState === 'results' && (
        <Results
          leaderboard={leaderboard}
          username={username}
          onPlayAgain={handlePlayAgain}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;
