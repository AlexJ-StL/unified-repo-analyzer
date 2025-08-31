import type React from 'react';

interface Props {
  title: string;
}

const App: React.FC<Props> = ({ title }) => {
  return (
    <div className="App">
      <h1>{title}</h1>
      <p>Welcome to the test React application</p>
    </div>
  );
};

export default App;
