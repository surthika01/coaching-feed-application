"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { UserCircle2, Tag, Clock, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reactions from "./Reactions";
import CommentSection from "./CommentSection";
import { Socket } from "socket.io-client";

export interface Feed {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
  reactions?: { [emoji: string]: number };
  comment_count?: number;
}

interface FeedCardProps {
  feed: Feed;
  index?: number;
  socket?: Socket | null;
}

export default function FeedCard({ feed, index = 0, socket }: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "tactics": return "text-purple-400 bg-purple-500/10 border-purple-500/30";
      case "motivation": return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "announcement": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut",
        delay: Math.min(index * 0.1, 1)
      }}
      whileHover={{ scale: 1.01, translateY: -2 }}
      className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col h-full group transition-all duration-300 relative overflow-hidden"
    >
      {/* Subtle top gradient glow on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
          {feed.title}
        </h3>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shrink-0 ${getCategoryColor(feed.category)}`}>
          <Tag size={12} />
          {feed.category || "General"}
        </span>
      </div>
      
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap flex-1 font-light">
        {feed.content}
      </p>

      {/* Live Reactions Bar */}
      <div className="mb-5">
        <Reactions feedId={feed.id} initialReactions={feed.reactions || {}} />
      </div>
      
      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-4 border-t border-border mt-auto">
        <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
          <UserCircle2 size={16} className="text-primary" />
          <span className="font-medium text-foreground">{feed.author}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle Comments Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium bg-card px-3 py-1.5 rounded-lg border border-border"
          >
            <MessageSquare size={14} />
            <span>{feed.comment_count || 0}</span>
          </button>

          <div className="flex items-center gap-1.5 opacity-80">
            <Clock size={14} />
            <span>{formatDistanceToNow(new Date(feed.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Collapsible comment thread */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <CommentSection feedId={feed.id} socket={socket} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
