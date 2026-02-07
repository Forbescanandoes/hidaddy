"use client";

import { useState } from "react";
import { ChatFeed } from "@/components/chat-feed";
import { KidNavbar } from "@/components/kid-navbar";
import { KidMainScreen } from "@/components/kid-main-screen";
import { supabase } from "@/lib/supabase";

export default function KidPage() {
  const [currentView, setCurrentView] = useState<"main" | "chat">("main");

  const handleSendFeeling = async (feeling: string, emoji: string, imagePath: string) => {
    // Auto-send the feeling message with the sticker image
    await supabase
      .from("messages")
      .insert({
        content: `${emoji} ${feeling}`,
        sender: "kid",
        image_url: imagePath,
      });
  };

  return (
    <div className="min-h-screen">
      <KidNavbar 
        isInChat={currentView === "chat"}
        onNavigateToChat={() => setCurrentView("chat")}
        onNavigateBack={() => setCurrentView("main")}
      />
      {currentView === "main" ? (
        <KidMainScreen 
          onNavigateToChat={() => setCurrentView("chat")}
          onSendFeeling={handleSendFeeling}
        />
      ) : (
        <div className="p-2 sm:p-4 md:p-8">
          <ChatFeed sender="kid" />
        </div>
      )}
    </div>
  );
}
