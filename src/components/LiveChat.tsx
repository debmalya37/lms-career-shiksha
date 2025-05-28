// components/LiveChat.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
// import type { DefaultStreamChatGenerics } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from 'stream-chat-react';

// make sure you've imported the v2 CSS in your root layout!
// import 'stream-chat-react/dist/css/v2/index.css';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export default function LiveChat({ channelId }: { channelId: string }) {
  const [chatClient, setChatClient] =
    useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let client: StreamChat;

    async function init() {
      console.log('[LiveChat] init() start', { channelId });

      // 1) fetch our chat token
      const res = await fetch('/api/chat/token');
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Token endpoint error: ${res.status} ${err}`);
      }
      const { userId, chatToken } = await res.json();
      console.log('[LiveChat] fetched token', { userId, chatToken: chatToken.slice(0,8) + '…' });

      // 2) instantiate and connect
      client = StreamChat.getInstance(apiKey);
      console.log('[LiveChat] connecting user to Stream');
      await client.connectUser({ id: userId }, chatToken);
      console.log('[LiveChat] connectUser OK');

      // 3) create/watch the channel
      const ch = client.channel('livestream', channelId, { name: `Live Class ${channelId}` } as any);
      console.log('[LiveChat] watching channel');
      await ch.watch();
      console.log('[LiveChat] channel.watch OK');

      // 4) set state
      setChatClient(client);
      setChannel(ch);
    }

    init().catch((err) => {
      console.error('[LiveChat] init error:', err);
      setLoadingError(err.message);
      if (client) client.disconnectUser();
    });

    return () => {
      if (client) {
        console.log('[LiveChat] disconnecting user');
        client.disconnectUser();
      }
    };
  }, [channelId]);

  if (loadingError) {
    return <div className="p-4 text-red-500">Chat failed to load: {loadingError}</div>;
  }
  if (!chatClient || !channel) {
    return <div className="p-4">Loading chat…</div>;
  }

  return (
    <Chat client={chatClient} theme="livestream light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </Chat>
  );
}
