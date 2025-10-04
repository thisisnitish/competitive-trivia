import { useState, useEffect } from 'react';
import Scoreboard from './Scoreboard';
import '../styles/GameScreen.scss';

function GameScreen({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  onSubmitAnswer,
  scores,
  players,
  username,
  showResults,
  correctAnswer,
  userAnswered
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswered(false);
    setTimeLeft(timeLimit);
  }, [question, timeLimit]);

  useEffect(() => {
    if (answered || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answered, showResults, question]);

  const handleSelectAnswer = (index) => {
    if (answered || showResults || timeLeft === 0) return;

    setSelectedAnswer(index);
    setAnswered(true);
    onSubmitAnswer(index);
  };

  const getAnswerClassName = (index) => {
    if (!showResults) {
      if (answered && selectedAnswer === index) {
        return 'selected';
      }
      return '';
    }

    // Show results
    if (index === correctAnswer) {
      return 'correct';
    }
    if (answered && selectedAnswer === index && selectedAnswer !== correctAnswer) {
      return 'incorrect';
    }
    return '';
  };

  const getTimerClassName = () => {
    if (timeLeft <= 5) return 'timer critical';
    if (timeLeft <= 10) return 'timer warning';
    return 'timer';
  };

  return (
    <div className="game-screen-container">
      <div className="game-main">
        <div className="game-header">
          <div className={getTimerClassName()}>
            {showResults ? 'Results' : `${timeLeft}s`}
          </div>
          <div className="question-counter">
            Question {questionNumber} / {totalQuestions}
          </div>
        </div>

        <div className="question-section">
          <h2 className="question-text">{question.question}</h2>
          <p className="category-badge">{question.category}</p>
        </div>

        <div className="options-section">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`option-btn ${getAnswerClassName(index)}`}
              disabled={answered || showResults || timeLeft === 0}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {answered && !showResults && (
          <div className="answer-feedback">
            <p>Answer submitted! Waiting for results...</p>
          </div>
        )}

        {showResults && (
          <div className="results-feedback">
            <p className="correct-answer-text">
              Correct Answer: {String.fromCharCode(65 + correctAnswer)} - {question.options[correctAnswer]}
            </p>
          </div>
        )}
      </div>

      <Scoreboard scores={scores} players={players} username={username} />
    </div>
  );
}

export default GameScreen;
