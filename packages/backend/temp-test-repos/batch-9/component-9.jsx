
import React from 'react';

export default function Component9() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Component 9</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
