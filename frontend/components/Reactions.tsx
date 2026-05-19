"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const EMOJIS = ["👍", "🔥", "💪", "🎯", "👏"];

interface ReactionsProps {
  feedId: string;
  initialReactions: { [emoji: string]: number };
}

export default function Reactions({ feedId, initialReactions }: ReactionsProps) {
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>(() => {
    try {
      const local = localStorage.getItem(`reactions:${feedId}`);
      if (local) return JSON.parse(local);
    } catch {}
    return initialReactions || {};
  });
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);

  const handleReact = async (emoji: string) => {
    setAnimatingEmoji(emoji);
    setTimeout(() => setAnimatingEmoji(null), 500);

    // Optimistic update + LocalStorage fallback save
    let nextReactions: { [emoji: string]: number } = {};
    setReactions(prev => {
      nextReactions = {
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1
      };
      try {
        localStorage.setItem(`reactions:${feedId}`, JSON.stringify(nextReactions));
      } catch {}
      return nextReactions;
    });

    try {
      const res = await fetch(`${BACKEND_URL}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feed_id: feedId, emoji }),
      });
      if (!res.ok) throw new Error("Backend error");
    } catch (err) {
      console.warn("Backend offline. Reaction persisted locally.");
    }
  };

  // Sync state if initialReactions changes (from real-time parent state updates)
  React.useEffect(() => {
    setReactions(prev => {
      // Prioritize local interaction counts or fall back to feed updates
      const local = localStorage.getItem(`reactions:${feedId}`);
      if (local) return JSON.parse(local);
      return initialReactions || {};
    });
  }, [initialReactions, feedId]);

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {EMOJIS.map(emoji => {
        const count = reactions[emoji] || 0;
        return (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReact(emoji)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
              count > 0 
                ? "bg-primary/10 border-primary/30 text-foreground" 
                : "bg-card border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
            }`}
          >
            <motion.span
              animate={animatingEmoji === emoji ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {emoji}
            </motion.span>
            {count > 0 && <span className="font-semibold">{count}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}
