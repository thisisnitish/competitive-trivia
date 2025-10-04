import '../styles/Scoreboard.scss';

function Scoreboard({ scores, players, username }) {
  const leaderboard = players
    .map((player) => ({
      username: player.username,
      score: scores[player.id] || 0
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h3>Live Scoreboard</h3>
      <ul className="scoreboard-list">
        {leaderboard.map((player, index) => (
          <li
            key={player.username}
            className={`scoreboard-item ${player.username === username ? 'current-user' : ''}`}
          >
            <span className="rank">{index + 1}</span>
            <span className="player-name">{player.username}</span>
            <span className="score">{player.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Scoreboard;
