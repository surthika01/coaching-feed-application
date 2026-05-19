"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import io, { Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  feedId: string;
  socket?: Socket | null;
}

export default function CommentSection({ feedId, socket: propSocket }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch comments
  useEffect(() => {
    fetch(`${BACKEND_URL}/comment/${feedId}`)
      .then(res => {
        if (!res.ok) throw new Error("Offline");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setComments(data);
          try {
            localStorage.setItem(`comments:${feedId}`, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {
        // Fallback to localStorage comments
        try {
          const local = localStorage.getItem(`comments:${feedId}`);
          if (local) {
            setComments(JSON.parse(local));
          }
        } catch {}
      })
      .finally(() => setFetching(false));

    // Connect socket if available
    let socket: Socket | null = null;
    try {
      socket = propSocket || io(BACKEND_URL, { timeout: 2000 });
      socketRef.current = socket;

      const handleNewComment = (comment: any) => {
        if (comment.feed_id === feedId) {
          setComments(prev => {
            if (prev.some(c => c.id === comment.id)) return prev;
            const updated = [...prev, comment];
            try {
              localStorage.setItem(`comments:${feedId}`, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      };

      socket.on("new_comment", handleNewComment);
    } catch {
      // Silently catch socket connection errors in offline mode
    }

    return () => {
      if (socket) {
        socket.off("new_comment");
        if (!propSocket) {
          socket.disconnect();
        }
      }
    };
  }, [feedId, propSocket]);

  // Scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim() || loading) return;

    setLoading(true);
    const mockComment: Comment = {
      id: Math.random().toString(),
      author: author.trim(),
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${BACKEND_URL}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed_id: feedId, author, content }),
      });

      if (!res.ok) throw new Error("Offline");
      setContent("");
    } catch (err) {
      // LocalStorage save fallback
      setComments(prev => {
        const updated = [...prev, mockComment];
        try {
          localStorage.setItem(`comments:${feedId}`, JSON.stringify(updated));
          
          // Increment comment count in home feed list cache
          const localFeeds = localStorage.getItem("coaching_feeds");
          if (localFeeds) {
            const parsed = JSON.parse(localFeeds);
            const updatedFeeds = parsed.map((f: any) => {
              if (f.id === feedId) {
                return { ...f, comment_count: (f.comment_count || 0) + 1 };
              }
              return f;
            });
            localStorage.setItem("coaching_feeds", JSON.stringify(updatedFeeds));
          }
        } catch {}
        return updated;
      });
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 pt-4 border-t border-border flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <MessageSquare size={16} className="text-primary" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment List */}
      <div 
        ref={listRef} 
        className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar"
      >
        {fetching ? (
          <div className="text-xs text-muted-foreground text-center py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 italic">No comments yet. Write one!</div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-card/50 p-3 rounded-xl border border-border flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span className="text-foreground">{comment.author}</span>
                  <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-foreground/90 leading-relaxed font-light mt-0.5">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="sm:col-span-1 px-3 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-foreground placeholder-muted-foreground transition-all"
          />
          <div className="sm:col-span-2 relative flex items-center">
            <input
              type="text"
              required
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full pl-3 pr-10 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-foreground placeholder-muted-foreground transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 p-1.5 text-primary hover:text-primary-foreground hover:bg-primary/20 rounded-lg transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
