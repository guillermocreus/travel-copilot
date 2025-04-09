import { OpenAI } from 'openai';

interface User {
  id: string;
  name: string;
  apiKey: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  type: 'user' | 'llm';
}

interface WebSocketMessage {
  type: 'join' | 'message' | 'user-joined' | 'user-left';
  payload: any;
}

export class ChatRoom {
  private connections: Map<string, WebSocket> = new Map();
  private users: Map<string, User> = new Map();
  private env: any;

  constructor(state: DurableObjectState, env: any) {
    this.env = env;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/ws') {
      const { 0: client, 1: server } = new WebSocketPair();
      const userId = crypto.randomUUID();
      
      this.handleConnection(server, userId);
      
      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }
    
    return new Response('Not found', { status: 404 });
  }

  private handleConnection(webSocket: WebSocket, userId: string) {
    this.connections.set(userId, webSocket);
    
    webSocket.accept();
    
    webSocket.addEventListener('message', async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data as string);
        
        switch (message.type) {
          case 'join':
            this.handleJoin(userId, message.payload);
            break;
          case 'message':
            await this.handleMessage(userId, message.payload);
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
        webSocket.send(JSON.stringify({
          type: 'error',
          payload: 'Failed to process message'
        }));
      }
    });
    
    webSocket.addEventListener('close', () => {
      this.handleDisconnect(userId);
    });
  }

  private handleJoin(userId: string, user: User) {
    this.users.set(userId, user);
    this.broadcast({
      type: 'user-joined',
      payload: {
        id: user.id,
        name: user.name
      }
    });
  }

  private async handleMessage(userId: string, content: string) {
    const user = this.users.get(userId);
    if (!user) return;

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      content,
      timestamp: Date.now(),
      type: 'user'
    };

    // Store message in D1
    await this.env.DB.prepare(
      'INSERT INTO messages (id, user_id, user_name, content, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      message.id,
      message.userId,
      message.userName,
      message.content,
      message.timestamp,
      message.type
    ).run();

    this.broadcast({
      type: 'message',
      payload: message
    });

    // If message starts with /ask, process with LLM
    if (content.startsWith('/ask ')) {
      try {
        const openai = new OpenAI({
          apiKey: user.apiKey
        });

        const llmResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: content.substring(5)
            }
          ]
        });

        const llmMessage: Message = {
          id: crypto.randomUUID(),
          userId: 'llm',
          userName: 'AI Assistant',
          content: llmResponse.choices[0].message.content || 'No response',
          timestamp: Date.now(),
          type: 'llm'
        };

        // Store LLM response in D1
        await this.env.DB.prepare(
          'INSERT INTO messages (id, user_id, user_name, content, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          llmMessage.id,
          llmMessage.userId,
          llmMessage.userName,
          llmMessage.content,
          llmMessage.timestamp,
          llmMessage.type
        ).run();

        this.broadcast({
          type: 'message',
          payload: llmMessage
        });
      } catch (error) {
        console.error('LLM Error:', error);
        const ws = this.connections.get(userId);
        if (ws) {
          ws.send(JSON.stringify({
            type: 'error',
            payload: 'Failed to process LLM request'
          }));
        }
      }
    }
  }

  private handleDisconnect(userId: string) {
    const user = this.users.get(userId);
    if (user) {
      this.broadcast({
        type: 'user-left',
        payload: {
          id: user.id,
          name: user.name
        }
      });
      this.users.delete(userId);
    }
    this.connections.delete(userId);
  }

  private broadcast(message: WebSocketMessage) {
    const data = JSON.stringify(message);
    for (const connection of this.connections.values()) {
      connection.send(data);
    }
  }
} 