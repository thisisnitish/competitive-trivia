import { useState, useEffect } from 'react';
import '../styles/Countdown.scss';

function Countdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="countdown-container">
      <div className="countdown-display">
        {count > 0 ? (
          <>
            <h2>Game Starting In...</h2>
            <div className="countdown-number">{count}</div>
          </>
        ) : (
          <h2 className="go-text">GO!</h2>
        )}
      </div>
    </div>
  );
}

export default Countdown;
