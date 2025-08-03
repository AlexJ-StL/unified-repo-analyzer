/**
 * WebSocket integration tests
 */
import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import { initializeWebSocketHandlers, sendAnalysisProgress, sendAnalysisComplete, } from '../websocket';
describe('WebSocket Tests', () => {
    let io;
    let serverSocket;
    let clientSocket;
    let httpServer;
    beforeAll((done) => {
        // Create HTTP server
        httpServer = createServer();
        // Create Socket.IO server
        io = new Server(httpServer);
        // Initialize WebSocket handlers
        initializeWebSocketHandlers(io);
        // Start server
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = Client(`http://localhost:${port}`, {
                extraHeaders: {
                    'x-client-id': 'test-client',
                },
            });
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        });
    });
    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });
    test('should connect and join client-specific room', (done) => {
        // Check if client is in the room
        const rooms = io.sockets.adapter.rooms;
        expect(rooms.has('test-client')).toBeTruthy();
        done();
    });
    test('should register for analysis updates', (done) => {
        // Register for analysis updates
        clientSocket.emit('register-analysis', 'test-analysis');
        // Wait for room to be joined
        setTimeout(() => {
            const rooms = io.sockets.adapter.rooms;
            expect(rooms.has('analysis:test-analysis')).toBeTruthy();
            done();
        }, 100);
    });
    test('should receive analysis progress updates', (done) => {
        // Register for analysis updates
        clientSocket.emit('register-analysis', 'test-analysis');
        // Listen for progress updates
        clientSocket.on('analysis-progress', (progress) => {
            expect(progress).toEqual({
                total: 10,
                processed: 5,
                status: 'processing',
            });
            done();
        });
        // Wait for room to be joined
        setTimeout(() => {
            // Send progress update
            sendAnalysisProgress(io, 'test-analysis', {
                total: 10,
                processed: 5,
                status: 'processing',
            });
        }, 100);
    });
    test('should receive analysis completion notification', (done) => {
        // Register for analysis updates
        clientSocket.emit('register-analysis', 'test-analysis');
        // Listen for completion notification
        clientSocket.on('analysis-complete', (result) => {
            expect(result).toEqual({
                id: 'test-analysis',
                status: 'completed',
            });
            done();
        });
        // Wait for room to be joined
        setTimeout(() => {
            // Send completion notification
            sendAnalysisComplete(io, 'test-analysis', {
                id: 'test-analysis',
                status: 'completed',
            });
        }, 100);
    });
});
//# sourceMappingURL=websocket.test.js.map