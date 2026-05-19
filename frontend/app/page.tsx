"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import FeedCard, { Feed } from "@/components/FeedCard";
import Toast from "@/components/Toast";
import { Activity, Zap } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Home() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    // 1. Fetch initial feed dataset
    fetch(`${BACKEND_URL}/feed`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then((data) => {
        if (data.feeds) {
          setFeeds(data.feeds);
          try {
            localStorage.setItem("coaching_feeds", JSON.stringify(data.feeds));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("Backend unreachable. Activating dynamic local demo mode.", err);
        setUsingMock(true);
        
        // Seed mock feeds to LocalStorage
        try {
          const local = localStorage.getItem("coaching_feeds");
          if (local) {
            setFeeds(JSON.parse(local));
          } else {
            const seedFeeds: Feed[] = [
              {
                id: "seed-1",
                title: "🔥 Defensive Transitions Meeting",
                content: "Please review the defensive zonal transition clip before Tuesday's session. We'll be working exclusively on zone coverage shifts and pressing triggers.",
                author: "Coach Miller",
                category: "Tactics",
                created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                reactions: { "👍": 8, "🎯": 3 },
                comment_count: 2
              },
              {
                id: "seed-2",
                title: "💪 Mindset: Champions Stay Disciplined",
                content: "Character is what you do when nobody is watching. Extra training repetitions, clean hydration, and a minimum of 8 hours of sleep. Let's dominate this weekend's cup!",
                author: "Coach Sarah",
                category: "Motivation",
                created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
                reactions: { "🔥": 14, "👏": 8 },
                comment_count: 0
              },
              {
                id: "seed-3",
                title: "📢 Training Jersey Distribution",
                content: "New primary and secondary training jerseys will be distributed outside the main equipment room starting tomorrow at 8:00 AM. Know your size configuration beforehand.",
                author: "Staff Admin",
                category: "Announcement",
                created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
                reactions: { "👍": 5 },
                comment_count: 1
              }
            ];
            setFeeds(seedFeeds);
            localStorage.setItem("coaching_feeds", JSON.stringify(seedFeeds));
          }
        } catch {}
      })
      .finally(() => setLoading(false));

    // 2. Setup real-time Socket.IO connection
    let newSocket: Socket | null = null;
    try {
      newSocket = io(BACKEND_URL, { timeout: 2000 });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setConnected(true);
        setUsingMock(false);
        newSocket?.emit("join_feeds");
      });

      newSocket.on("disconnect", () => {
        setConnected(false);
      });

      newSocket.on("client_count", (count: number) => {
        setClientCount(count);
      });

      // Handle new feeds
      newSocket.on("new_feed", ({ feed }) => {
        setFeeds((prevFeeds) => {
          if (prevFeeds.some((f) => f.id === feed.id)) return prevFeeds;
          
          setToast({
            title: `📢 New Broadcast: ${feed.author}`,
            message: feed.title
          });

          return [feed, ...prevFeeds];
        });
      });

      // Handle real-time reactions
      newSocket.on("reaction_update", (reaction) => {
        setFeeds((prevFeeds) => 
          prevFeeds.map((f) => {
            if (f.id === reaction.feed_id) {
              return {
                ...f,
                reactions: {
                  ...(f.reactions || {}),
                  [reaction.emoji]: reaction.count
                }
              };
            }
            return f;
          })
        );
      });

      // Handle real-time comments
      newSocket.on("new_comment", (comment) => {
        setFeeds((prevFeeds) =>
          prevFeeds.map((f) => {
            if (f.id === comment.feed_id) {
              return {
                ...f,
                comment_count: (f.comment_count || 0) + 1
              };
            }
            return f;
          })
        );
      });
    } catch {
      // Catch offline sockets gracefully
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Simulate live coaching updates in Mock/Demo mode
  useEffect(() => {
    if (!usingMock) return;

    // Simulate online visitors count in demo mode
    setClientCount(Math.floor(Math.random() * 5) + 4);

    const mockCoaches = ["Coach Miller", "Coach Sarah", "System Admin"];
    const mockMessages = [
      "Hydration protocol check! Drink at least 3L of water today.",
      "The zone coverage video has been re-uploaded inside the resources folder.",
      "Squad check-in scheduled for Friday morning at 0900 sharp.",
      "Exceptional work during yesterday's agility runs. Keep that intensity!",
      "Make sure to report any physical discomfort or muscle fatigue to the medical team."
    ];

    const interval = setInterval(() => {
      const randomCoach = mockCoaches[Math.floor(Math.random() * mockCoaches.length)];
      const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      
      const newMockFeed: Feed = {
        id: `mock-${Math.random()}`,
        title: randomMsg,
        content: "This is a real-time broadcast simulated dynamically in offline demo mode to showcase Socket.IO notification systems.",
        author: randomCoach,
        category: "Announcement",
        created_at: new Date().toISOString(),
        reactions: {},
        comment_count: 0
      };

      // Add to state and alert via Toast
      setFeeds(prev => {
        const updated = [newMockFeed, ...prev];
        try {
          localStorage.setItem("coaching_feeds", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      setToast({
        title: `📢 Realtime Demo: ${randomCoach}`,
        message: randomMsg
      });
    }, 45000); // Trigger a cool live event every 45s

    return () => clearInterval(interval);
  }, [usingMock]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6 xs:space-y-8 relative"
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <Toast
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2 sm:mb-4"
          >
            Live Coaching Feed
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed"
          >
            Realtime insights, tactics, and announcements directly from your coaching staff.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 sm:gap-4 glass-panel px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl w-full md:w-auto mt-4 md:mt-0"
        >
          <div className="relative flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center">
            {(connected || usingMock) && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                usingMock ? "bg-amber-400" : "bg-emerald-400"
              }`}></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                connected 
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                  : usingMock 
                    ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" 
                    : "bg-red-500"
              }`}
            ></span>
          </div>
          <span className="text-sm sm:text-base font-semibold text-foreground">
            {connected 
              ? "Live Connection" 
              : usingMock 
                ? "Demo Mode (Mock Database)" 
                : "Offline"
            }
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground ml-auto md:ml-2 border-l border-border pl-3 sm:pl-4">
            <Activity size={14} className={connected || usingMock ? "text-emerald-500" : ""} />
            <span>{clientCount} online</span>
          </div>
        </motion.div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-4 rounded-xl flex items-center text-sm sm:text-base"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 sm:py-32">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500/20 rounded-full"></div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      ) : feeds.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 sm:py-32 glass-panel rounded-2xl"
        >
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-500/10 mb-4 text-primary">
            <Zap size={24} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">No feeds yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Be the first to broadcast a message!</p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {feeds.map((feed, index) => (
              <FeedCard key={feed.id} feed={feed} index={index} socket={socket} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
