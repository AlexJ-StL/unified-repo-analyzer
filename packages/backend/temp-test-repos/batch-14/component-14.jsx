
import React from 'react';

export default function Component14() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <h1>Component 14</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
