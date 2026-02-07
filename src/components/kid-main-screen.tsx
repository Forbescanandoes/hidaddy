"use client";

type KidMainScreenProps = {
  onNavigateToChat: () => void;
  onSendFeeling: (feeling: string, emoji: string, imagePath: string) => void;
};

export function KidMainScreen({ onNavigateToChat, onSendFeeling }: KidMainScreenProps) {
  const handleFeelingClick = (feeling: string, emoji: string, imagePath: string) => {
    onSendFeeling(feeling, emoji, imagePath);
    onNavigateToChat();
  };

  return (
    <div 
      className="min-h-[calc(100vh-80px)] p-4 sm:p-6 flex flex-col items-center justify-center gap-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/backround.png)' }}
    >
      {/* Top Buttons - Photo and Voice */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl">
        {/* Photo Button */}
        <button
          onClick={onNavigateToChat}
          className="bg-yellow-500 rounded-3xl shadow-lg active:scale-95 transition-all hover:scale-105 p-4"
        >
          <img 
            src="/camera.png" 
            alt="Camera"
            className="w-full h-auto"
          />
        </button>

        {/* Voice Button */}
        <button
          onClick={onNavigateToChat}
          className="bg-red-500 rounded-3xl shadow-lg active:scale-95 transition-all hover:scale-105 p-4"
        >
          <img 
            src="/MIC-removebg-preview.png" 
            alt="Microphone"
            className="w-full h-auto"
          />
        </button>
      </div>

      {/* Feelings Bar */}
      <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-3xl p-4 sm:p-6 w-full max-w-2xl shadow-[0_8px_0px_0px_rgba(200,150,0,0.8)]">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Love */}
          <button
            onClick={() => handleFeelingClick("Love You", "❤️", "/loveyou-removebg-preview.png")}
            className="flex items-center justify-center active:scale-95 transition-transform"
          >
            <img 
              src="/loveyou-removebg-preview.png" 
              alt="Love You"
              className="w-full h-auto scale-150"
            />
          </button>

          {/* Miss You */}
          <button
            onClick={() => handleFeelingClick("Miss You", "😢", "/missyou.png")}
            className="flex items-center justify-center active:scale-95 transition-transform"
          >
            <img 
              src="/missyou.png" 
              alt="Miss You"
              className="w-full h-auto scale-150"
            />
          </button>

          {/* Proud */}
          <button
            onClick={() => handleFeelingClick("Proud", "⭐", "/proud-removebg-preview.png")}
            className="flex items-center justify-center active:scale-95 transition-transform"
          >
            <img 
              src="/proud-removebg-preview.png" 
              alt="Proud"
              className="w-full h-auto scale-150"
            />
          </button>

          {/* Silly */}
          <button
            onClick={() => handleFeelingClick("Silly", "😆", "/silly.png")}
            className="flex items-center justify-center active:scale-95 transition-transform"
          >
            <img 
              src="/silly.png" 
              alt="Silly"
              className="w-full h-auto scale-150"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
