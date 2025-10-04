import { useState } from 'react';
import '../styles/Auth.scss';

function Auth({ onSubmit }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const validateUsername = (value) => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return 'Username must be alphanumeric only';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSubmit(username);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value) {
      setError(validateUsername(value));
    } else {
      setError('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Trivia Showdown</h1>
        <p className="subtitle">Compete in real-time trivia battles!</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Enter Your Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleChange}
              placeholder="Username"
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={!username || error}>
            Continue
          </button>
        </form>

        <div className="game-info">
          <h3>How to Play:</h3>
          <ul>
            <li>Create or join a game room</li>
            <li>Answer questions quickly to earn bonus points</li>
            <li>Compete with friends on the live leaderboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Auth;
