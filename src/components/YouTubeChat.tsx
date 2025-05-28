// /components/YouTubeChat.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  snippet: any;
  authorDetails: any;
}

export default function YouTubeChat({ liveChatId }: { liveChatId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [text, setText] = useState('');
  const pollingRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    async function poll() {
      const res = await axios.get('/api/chat/messages', {
        params: { liveChatId, pageToken: nextPageToken },
      });
      const data = res.data;
      setMessages(prev => [...prev, ...data.items]);
      setNextPageToken(data.nextPageToken);
      pollingRef.current = setTimeout(poll, data.pollingIntervalMillis || 5000);
    }
    poll();
    return () => clearTimeout(pollingRef.current!);
  }, [liveChatId, nextPageToken]);

  async function post() {
    if (!text.trim()) return;
    await axios.post('/api/chat/post', { liveChatId, message: text });
    setText('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-2 bg-gray-50 border rounded mb-2">
        {messages.map(m => (
          <div key={m.id} className="mb-1">
            <strong>{m.authorDetails.displayName}:</strong>&nbsp;
            {m.snippet.displayMessage}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 p-2 border rounded-l"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button
          className="px-4 bg-blue-600 text-white rounded-r"
          onClick={post}
        >
          Send
        </button>
      </div>
    </div>
  );
}
