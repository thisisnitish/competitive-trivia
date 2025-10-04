import { useState } from 'react';
import '../styles/RoomSelector.scss';

function RoomSelector({ onCreateRoom, onJoinRoom }) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    onCreateRoom();
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    onJoinRoom(roomCode.toUpperCase());
  };

  return (
    <div className="room-selector-container">
      <div className="room-selector-card">
        <h2>Join or Create a Game</h2>

        <div className="create-room-section">
          <h3>Create New Room</h3>
          <p>Start a new game and invite your friends</p>
          <button onClick={handleCreateRoom} className="btn btn-primary">
            Create New Room
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="join-room-section">
          <h3>Join Existing Room</h3>
          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter Room Code"
                maxLength={6}
              />
              {error && <span className="error-message">{error}</span>}
            </div>
            <button type="submit" className="btn btn-secondary">
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoomSelector;
