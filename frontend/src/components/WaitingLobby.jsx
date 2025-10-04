import '../styles/WaitingLobby.scss';

function WaitingLobby({ room, username, onStartGame, onLeaveRoom }) {
  const isCreator = room.players[0]?.username === username;

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h2>Waiting Lobby</h2>

        <div className="room-code-section">
          <p>Room Code</p>
          <div className="room-code">{room.code}</div>
          <p className="code-hint">Share this code with your friends!</p>
        </div>

        <div className="players-section">
          <h3>
            Players ({room.players.length}/{room.maxPlayers})
          </h3>
          <ul className="players-list">
            {room.players.map((player, index) => (
              <li key={player.id} className="player-item">
                <span className="player-name">
                  {player.username}
                  {index === 0 && <span className="creator-badge">Host</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lobby-actions">
          {isCreator ? (
            <button
              onClick={onStartGame}
              className="btn btn-primary"
              disabled={room.players.length < 2}
            >
              {room.players.length < 2 ? 'Waiting for Players...' : 'Start Game'}
            </button>
          ) : (
            <div className="waiting-message">
              <p>Waiting for host to start the game...</p>
            </div>
          )}

          <button onClick={onLeaveRoom} className="btn btn-secondary">
            Leave Room
          </button>
        </div>

        {room.players.length < 2 && (
          <p className="info-message">At least 2 players are required to start the game</p>
        )}
      </div>
    </div>
  );
}

export default WaitingLobby;
