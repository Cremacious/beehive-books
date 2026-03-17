'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getChatMessagesAction,
  sendChatMessageAction,
  deleteChatMessageAction,
} from '@/lib/actions/hive-chat.actions';
import type { ChatMessageWithAuthor, HiveRole } from '@/lib/types/hive.types';

interface HiveChatProps {
  hiveId: string;
  initialMessages: ChatMessageWithAuthor[];
  currentUserId: string;
  myRole: HiveRole;
}

function formatTime(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

function Avatar({
  user,
  size = 28,
}: {
  user: ChatMessageWithAuthor['author'];
  size?: number;
}) {
  const name = user.username ?? 'User';
  return user.image ? (
    <Image
      src={user.image}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-[#FFC300]/15 flex items-center justify-center shrink-0 text-[#FFC300] font-bold"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function HiveChat({
  hiveId,
  initialMessages,
  currentUserId,
  myRole,
}: HiveChatProps) {
  const [messages, setMessages] =
    useState<ChatMessageWithAuthor[]>(initialMessages);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(async () => {
        const fresh = await getChatMessagesAction(hiveId);
        setMessages(fresh);
      });
    }, 6000);
    return () => clearInterval(id);
  }, [hiveId]);

  const handleSend = async () => {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    setContent('');
    await sendChatMessageAction(hiveId, text);
    const fresh = await getChatMessagesAction(hiveId);
    setMessages(fresh);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleDelete = async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await deleteChatMessageAction(hiveId, messageId);
  };

  const canDelete = (msg: ChatMessageWithAuthor) =>
    msg.authorId === currentUserId ||
    myRole === 'OWNER' ||
    myRole === 'MODERATOR';

  return (
    <div
      className="flex flex-col rounded-2xl border border-[#2a2a2a] overflow-hidden"
      style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}
    >
 
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1a1a1a]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#252525] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#FFC300]/40" />
            </div>
            <p className="text-sm text-white/80">
              No messages yet. Say hello! 🐝
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.authorId === currentUserId;
            const prevMsg = messages[idx - 1];
            const sameAuthor = prevMsg?.authorId === msg.authorId;
            const name = msg.author.username ?? 'User';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 group ${isOwn ? 'flex-row-reverse' : ''} ${sameAuthor ? 'mt-0.5' : 'mt-3'}`}
              >
                <div className="shrink-0 w-7">
                  {!sameAuthor && (
                    msg.author.username ? (
                      <Link href={`/u/${msg.author.username}`} className="hover:opacity-80 transition-opacity block">
                        <Avatar user={msg.author} size={28} />
                      </Link>
                    ) : (
                      <Avatar user={msg.author} size={28} />
                    )
                  )}
                </div>

                <div
                  className={`max-w-[72%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {!sameAuthor && !isOwn && (
                    msg.author.username ? (
                      <Link href={`/u/${msg.author.username}`} className="text-xs text-white/80 px-1 hover:text-white/80 transition-colors">
                        {name}
                      </Link>
                    ) : (
                      <span className="text-xs text-white/80 px-1">{name}</span>
                    )
                  )}
                  <div className="flex items-center gap-1.5 group/bubble">
                    {canDelete(msg) && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className={`opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 text-white/80 hover:text-red-400 shrink-0 ${isOwn ? 'order-first' : 'order-last'}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm text-white leading-relaxed wrap-break-word whitespace-pre-wrap ${
                        isOwn
                          ? 'bg-[#FFC300]/15 rounded-tr-sm'
                          : 'bg-[#252525] rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {(!messages[idx + 1] ||
                    messages[idx + 1]?.authorId !== msg.authorId) && (
                    <span
                      className={`text-[10px] text-white/80 px-1 ${isOwn ? 'text-right' : ''}`}
                    >
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3 bg-[#252525] border-t border-[#2a2a2a]">
        <input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Say something to the hive…"
          maxLength={2000}
          className="flex-1 min-w-0 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#FFC300]/40 transition-all"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || sending}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
