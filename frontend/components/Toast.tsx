"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

interface ToastProps {
  message: string;
  title: string;
  onClose: () => void;
}

export default function Toast({ message, title, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-5 right-5 z-[9999] glass-panel p-4 rounded-2xl max-w-sm w-full flex items-start gap-3 shadow-2xl border border-primary/20 backdrop-blur-xl"
    >
      <div className="p-2 rounded-xl bg-blue-500/10 text-primary shrink-0 glow-effect">
        <Bell size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground truncate">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/5"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
