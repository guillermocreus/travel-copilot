import { ChatRoom } from './chat-room';

interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  CHAT_ROOM: DurableObjectNamespace;
}

export { ChatRoom };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/ws') {
      // Get the Durable Object stub for the chat room
      const id = env.CHAT_ROOM.idFromName('global-chat-room');
      const obj = env.CHAT_ROOM.get(id);
      
      // Forward the request to the Durable Object
      return obj.fetch(request);
    }
    
    return new Response('Not found', { status: 404 });
  }
}; 