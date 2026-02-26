"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, AlertTriangle, User } from "lucide-react";
import { useCaseStore } from "@/lib/case-store";
import type { Case, ChatMessage } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CaseChatProps {
  caseData: Case;
  slotId: string;
}

export function CaseChat({ caseData, slotId }: CaseChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { viewMode, sendChatMessage, cases } = useCaseStore();

  const currentCase = cases.find((c) => c.id === caseData.id) || caseData;
  const messages = (currentCase.chatMessages || []).filter(
    (m) => m.slotId === slotId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const sender = viewMode === "admin" ? "admin" : "sales";
    const senderName = viewMode === "admin" ? "事務局担当者" : "営業担当者";
    sendChatMessage(caseData.id, slotId, trimmed, sender, senderName);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const isOwnMessage = (msg: ChatMessage) => {
    if (viewMode === "admin") return msg.sender === "admin";
    return msg.sender === "sales";
  };

  const placeholder =
    viewMode === "admin"
      ? "営業にメッセージを送信..."
      : "事務局にメッセージを送信...";

  return (
    <div className="flex flex-col h-[480px] border rounded-lg bg-background">
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          チャット
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                事務局とのチャット
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                メッセージはまだありません
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwnMessage(msg)}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-3 flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] resize-none text-sm flex-1"
            rows={2}
          />
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="icon"
              className="bg-green-600 hover:bg-green-700 h-9 w-9"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">
            Cmd + Enter で送信
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessage;
  isOwn: boolean;
}) {
  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 max-w-[90%]">
          <div className="flex items-center gap-1 mb-0.5">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-[11px] font-medium text-red-600">
              {message.senderName}
            </span>
          </div>
          <p className="text-xs text-red-700">{message.content}</p>
          <p className="text-[10px] text-red-400 mt-0.5">
            {format(message.createdAt, "M/d HH:mm", { locale: ja })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-1.5 ${
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {!isOwn && (
          <p className="text-[11px] font-medium mb-0.5 opacity-70">
            {message.senderName}
          </p>
        )}
        <p className="text-xs whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-[10px] mt-0.5 ${
            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          {format(message.createdAt, "M/d HH:mm", { locale: ja })}
        </p>
      </div>
    </div>
  );
}
