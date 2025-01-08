import { WebSocketServer } from 'ws';
import { User } from './User';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', function connection(ws) {
    let user: User | undefined;
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const user = new User(ws);
  });

  ws.on("close", () => {
    user?.destroy();
  })
});