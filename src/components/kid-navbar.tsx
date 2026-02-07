"use client";

import { useState, useEffect } from "react";
import { Home, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

type KidNavbarProps = {
  isInChat: boolean;
  onNavigateToChat?: () => void;
  onNavigateBack?: () => void;
};

export function KidNavbar({ isInChat, onNavigateToChat, onNavigateBack }: KidNavbarProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMathLock, setShowMathLock] = useState(false);
  const [mathAnswer, setMathAnswer] = useState("");
  const [num1] = useState(Math.floor(Math.random() * 5) + 1);
  const [num2] = useState(Math.floor(Math.random() * 5) + 1);

  useEffect(() => {
    // Count unread messages from dad
    const countUnread = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id")
        .eq("sender", "dad");

      if (data) {
        setUnreadCount(data.length);
      }
    };

    countUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel("unread-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          countUnread();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSettingsClick = () => {
    setShowMathLock(true);
    setMathAnswer("");
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer) === num1 + num2) {
      alert("Settings coming soon!");
      setShowMathLock(false);
    } else {
      alert("Try again!");
      setMathAnswer("");
    }
  };

  return (
    <>
      <nav className="bg-[#4A90E2] shadow-[0_4px_0px_0px_rgba(59,130,246,0.5)] px-4 py-4 sm:px-6 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left - Settings/Back Button */}
          {isInChat ? (
            <button
              onClick={onNavigateBack}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-[#4A90E2]" />
            </button>
          ) : (
            <button
              onClick={handleSettingsClick}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Home className="w-6 h-6 sm:w-7 sm:h-7 text-[#4A90E2]" />
            </button>
          )}

          {/* Center - HiDaddy Text */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            HiDaddy
          </h1>

          {/* Right - Mail Icon with Badge (only on main screen) */}
          {!isInChat ? (
            <button
              onClick={onNavigateToChat}
              className="relative"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-[#4A90E2]" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </button>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14"></div>
          )}
        </div>
      </nav>

      {/* Math Lock Overlay */}
      {showMathLock && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-6 text-[#4A90E2]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Solve to Enter!
            </h2>
            <div className="text-6xl font-bold text-center mb-6 text-gray-800">
              {num1} + {num2} = ?
            </div>
            <form onSubmit={handleMathSubmit} className="space-y-4">
              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                className="w-full text-4xl text-center p-4 border-4 border-[#4A90E2] rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                placeholder="?"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 rounded-2xl transition-colors shadow-lg"
                >
                  ✓ Check
                </button>
                <button
                  type="button"
                  onClick={() => setShowMathLock(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-2xl transition-colors shadow-lg"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
