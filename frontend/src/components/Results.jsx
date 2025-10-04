import '../styles/Results.scss';

function Results({ leaderboard, username, onPlayAgain, onLeaveRoom }) {
  const winner = leaderboard[0];
  const userStats = leaderboard.find((p) => p.username === username);

  return (
    <div className="results-container">
      <div className="results-card">
        <h1 className="results-title">Game Over!</h1>

        <div className="winner-section">
          <h2>🏆 Winner</h2>
          <p className="winner-name">{winner.username}</p>
          <p className="winner-score">{winner.score} points</p>
        </div>

        <div className="leaderboard-section">
          <h3>Final Leaderboard</h3>
          <ul className="final-leaderboard">
            {leaderboard.map((player, index) => (
              <li
                key={player.username}
                className={`leaderboard-item ${player.username === username ? 'current-user' : ''}`}
              >
                <span className="position">{index + 1}.</span>
                <span className="player-info">
                  <span className="name">{player.username}</span>
                  <span className="stats">
                    {player.score} pts ({player.correctAnswers || 0} correct)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {userStats && (
          <div className="user-stats">
            <h3>Your Performance</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Rank</span>
                <span className="stat-value">
                  {leaderboard.findIndex((p) => p.username === username) + 1}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-value">{userStats.score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Correct</span>
                <span className="stat-value">{userStats.correctAnswers || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="results-actions">
          <button onClick={onPlayAgain} className="btn btn-primary">
            Play Again
          </button>
          <button onClick={onLeaveRoom} className="btn btn-secondary">
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
