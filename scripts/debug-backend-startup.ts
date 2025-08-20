import { spawn } from 'node:child_process';
import { join } from 'node:path';

const port = 3001;
const backendDir = join(process.cwd(), 'packages', 'backend');
const bunExecutable = 'C:\\Users\\AlexJ\\.bun\\bin\\bun.exe'; // Explicit path to bun.exe

console.log('Attempting to start backend server for debugging...');
console.log('CWD:', backendDir);
console.log('Bun Executable:', bunExecutable);

const serverProcess = spawn(bunExecutable, ['run', 'start'], {
  cwd: backendDir,
  env: {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: 'test',
    // Include other necessary environment variables from startTestServer if applicable
    // DATA_DIR, CACHE_DIR, INDEX_DIR, LOG_DIR, PROJECT_ROOT
    // For now, let's keep it minimal to isolate the bun startup issue
  },
  stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
});

serverProcess.stdout.on('data', (data) => {
  console.log(`SERVER_STDOUT: ${data.toString()}`);
});

serverProcess.stderr.on('data', (_data) => {});

serverProcess.on('error', (_err) => {});

serverProcess.on('close', (code) => {
  console.log(`Server process closed with code ${code}`);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`Server process exited with code ${code} and signal ${signal}`);
});

// Keep the script running for a while to observe server output
setTimeout(() => {
  console.log('Debugging script finished. Killing server process...');
  serverProcess.kill();
}, 10000); // Run for 10 seconds
