import React from 'react';

export default function Component11() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Component 11</h1>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
