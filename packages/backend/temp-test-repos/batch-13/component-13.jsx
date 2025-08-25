import React from 'react';

export default function Component13() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Component 13</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
