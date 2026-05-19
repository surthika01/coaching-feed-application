"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${BACKEND_URL}/feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, author, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create feed");
      }

      setSuccess(true);
      setTitle("");
      setContent("");
      setAuthor("");
      setCategory("General");
      
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err: any) {
      console.warn("Backend unreachable. Broadcasting to local storage fallback.");
      try {
        const localFeedsStr = localStorage.getItem("coaching_feeds") || "[]";
        const localFeeds = JSON.parse(localFeedsStr);
        const newFeed = {
          id: `local-${Math.random()}`,
          title: title.trim(),
          content: content.trim(),
          author: author.trim(),
          category: category.trim(),
          created_at: new Date().toISOString(),
          reactions: {},
          comment_count: 0
        };
        
        localFeeds.unshift(newFeed);
        localStorage.setItem("coaching_feeds", JSON.stringify(localFeeds));
        
        setSuccess(true);
        setTitle("");
        setContent("");
        setAuthor("");
        setCategory("General");
        
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (e) {
        setError(err.message || "Failed to create feed");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base text-foreground placeholder-muted-foreground transition-all duration-300 hover:border-muted-foreground";
  const labelClasses = "block text-xs sm:text-sm font-semibold text-muted-foreground mb-2 ml-1";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-2 xs:px-0"
    >
      <div className="mb-8 sm:mb-10 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-blue-500/10 mb-4 text-blue-400 glow-effect"
        >
          <Sparkles size={24} />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Broadcast Feed
        </h1>
        <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl mx-auto">
          Publish a new coaching feed to all active users instantly. The update will appear on their screens without a refresh.
        </p>
      </div>

      <div className="glass-panel rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative background gradients within the card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl flex items-center text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-medium"
            >
              <CheckCircle2 size={20} />
              Feed broadcasted successfully! Redirecting...
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className={labelClasses}>Author Name</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={inputClasses}
                placeholder="e.g. Coach Smith"
              />
            </div>
            <div>
              <label className={labelClasses}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="General" className="bg-background">General</option>
                <option value="Tactics" className="bg-background">Tactics</option>
                <option value="Motivation" className="bg-background">Motivation</option>
                <option value="Announcement" className="bg-background">Announcement</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Title</label>
            <input
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClasses}
              placeholder="e.g. Game Plan for this weekend"
            />
          </div>

          <div>
            <label className={labelClasses}>Content</label>
            <textarea
              required
              minLength={5}
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClasses} resize-none`}
              placeholder="Write your detailed coaching points here..."
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 text-white font-bold py-3.5 sm:py-4 rounded-xl hover:bg-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] text-sm sm:text-base border border-blue-400/20"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Broadcasting...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={20} />
                Sent!
              </>
            ) : (
              <>
                <Send size={20} />
                Publish Feed
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
