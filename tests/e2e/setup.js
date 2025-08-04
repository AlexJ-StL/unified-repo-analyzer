/**
 * End-to-end test setup and utilities
 */
import { spawn } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import axios from 'axios';
import { tmpdir } from 'os';
const sleep = promisify(setTimeout);
/**
 * Start the backend server for testing
 */
export async function startTestServer(port = 3001) {
    const serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: join(__dirname, '../../packages/backend'),
        env: { ...process.env, PORT: port.toString() },
        stdio: 'pipe',
    });
    const baseUrl = `http://localhost:${port}`;
    // Wait for server to be ready
    let retries = 30;
    while (retries > 0) {
        try {
            await axios.get(`${baseUrl}/api/health`);
            break;
        }
        catch (error) {
            retries--;
            if (retries === 0) {
                serverProcess.kill();
                throw new Error('Server failed to start within timeout');
            }
            await sleep(1000);
        }
    }
    return {
        process: serverProcess,
        port,
        baseUrl,
        stop: async () => {
            serverProcess.kill();
            // Wait for process to exit
            await new Promise((resolve) => {
                serverProcess.on('exit', resolve);
            });
        },
    };
}
/**
 * Create a test repository with specified files
 */
export async function createTestRepository(name, files) {
    const testDir = join(tmpdir(), 'unified-repo-analyzer-test', name);
    // Create directory structure
    await mkdir(testDir, { recursive: true });
    // Create files
    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = join(testDir, filePath);
        const dir = join(fullPath, '..');
        await mkdir(dir, { recursive: true });
        await writeFile(fullPath, content);
    }
    return {
        path: testDir,
        name,
        files,
        cleanup: async () => {
            await rm(testDir, { recursive: true, force: true });
        },
    };
}
/**
 * Wait for analysis to complete
 */
export async function waitForAnalysis(baseUrl, analysisId, timeout = 30000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            const response = await axios.get(`${baseUrl}/api/analysis/${analysisId}`);
            if (response.data.status === 'completed') {
                return response.data;
            }
            if (response.data.status === 'failed') {
                throw new Error(`Analysis failed: ${response.data.error}`);
            }
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response?.status !== 404) {
                throw error;
            }
        }
        await sleep(1000);
    }
    throw new Error('Analysis timeout');
}
/**
 * Sample test repositories for different scenarios
 */
export const TEST_REPOSITORIES = {
    simpleJavaScript: {
        'package.json': JSON.stringify({
            name: 'test-js-project',
            version: '1.0.0',
            dependencies: {
                express: '^4.18.0',
                lodash: '^4.17.21',
            },
        }),
        'index.js': `
const express = require('express');
const _ = require('lodash');

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
`,
        'README.md': '# Test JavaScript Project\n\nA simple Express.js application for testing.',
    },
    reactTypeScript: {
        'package.json': JSON.stringify({
            name: 'test-react-app',
            version: '1.0.0',
            dependencies: {
                react: '^18.0.0',
                'react-dom': '^18.0.0',
                '@types/react': '^18.0.0',
            },
        }),
        'tsconfig.json': JSON.stringify({
            compilerOptions: {
                target: 'es5',
                lib: ['dom', 'dom.iterable', 'es6'],
                allowJs: true,
                skipLibCheck: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: true,
                forceConsistentCasingInFileNames: true,
                moduleResolution: 'node',
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: 'react-jsx',
            },
        }),
        'src/App.tsx': `
import React from 'react';

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
`,
        'src/index.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App title="Test App" />);
`,
        'README.md': '# Test React TypeScript Project\n\nA React application with TypeScript for testing.',
    },
    pythonProject: {
        'requirements.txt': 'flask==2.3.0\nrequests==2.31.0',
        'app.py': `
from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({'message': 'Hello from Python!'})

@app.route('/data')
def get_data():
    # Simulate API call
    response = requests.get('https://api.example.com/data')
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
`,
        'utils.py': `
def format_response(data):
    """Format API response data"""
    return {
        'status': 'success',
        'data': data,
        'timestamp': '2024-01-01T00:00:00Z'
    }

class DataProcessor:
    def __init__(self, config):
        self.config = config
    
    def process(self, data):
        return format_response(data)
`,
        'README.md': '# Test Python Project\n\nA Flask application for testing Python analysis.',
    },
};
/**
 * Performance test utilities
 */
export class PerformanceMonitor {
    metrics = {};
    startTimer(name) {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            if (!this.metrics[name]) {
                this.metrics[name] = [];
            }
            this.metrics[name].push(duration);
            return duration;
        };
    }
    getStats(name) {
        const times = this.metrics[name] || [];
        if (times.length === 0)
            return null;
        const sorted = times.sort((a, b) => a - b);
        return {
            count: times.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
        };
    }
    getAllStats() {
        return Object.keys(this.metrics).reduce((acc, name) => {
            acc[name] = this.getStats(name);
            return acc;
        }, {});
    }
}
//# sourceMappingURL=setup.js.map