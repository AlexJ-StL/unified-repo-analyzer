import React from 'react';

export default function Component5() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Component 5</h1>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
