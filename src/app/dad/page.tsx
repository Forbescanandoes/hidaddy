import { ChatFeed } from "@/components/chat-feed";

export default function DadPage() {
  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Dad Page</h1>
      <ChatFeed sender="dad" />
    </div>
  );
}
