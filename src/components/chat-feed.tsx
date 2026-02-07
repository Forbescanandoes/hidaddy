"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Mic, Camera } from "lucide-react";

type Message = {
  id: string;
  content: string;
  sender: string;
  created_at: string;
  image_url?: string;
  audio_url?: string;
};

type ChatFeedProps = {
  sender: "kid" | "dad";
};

export function ChatFeed({ sender }: ChatFeedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCapturedPhoto({ file, preview: previewUrl });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendPhoto = async () => {
    if (!capturedPhoto || sending) return;

    setSending(true);

    try {
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${capturedPhoto.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-photos")
        .upload(fileName, capturedPhoto.file);

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        setSending(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("chat-photos")
        .getPublicUrl(fileName);

      // Send message with photo
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          content: "📷 Photo",
          sender: sender,
          image_url: publicUrl,
        });

      if (messageError) {
        console.error("Error sending photo message:", messageError);
      }

      // Clean up
      URL.revokeObjectURL(capturedPhoto.preview);
      setCapturedPhoto(null);
    } catch (error) {
      console.error("Error handling photo:", error);
    }

    setSending(false);
  };

  const handleCancelPhoto = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto.preview);
      setCapturedPhoto(null);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio({ blob: audioBlob, url: audioUrl });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSendAudio = async () => {
    if (!recordedAudio || sending) return;

    setSending(true);

    try {
      // Create file from blob
      const fileName = `${Date.now()}-audio.webm`;
      const file = new File([recordedAudio.blob], fileName, { type: 'audio/webm' });

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("chat-audio")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Error uploading audio:", uploadError);
        setSending(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("chat-audio")
        .getPublicUrl(fileName);

      // Send message with audio
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          content: "🎤 Voice message",
          sender: sender,
          audio_url: publicUrl,
        });

      if (messageError) {
        console.error("Error sending audio message:", messageError);
      }

      // Clean up
      URL.revokeObjectURL(recordedAudio.url);
      setRecordedAudio(null);
    } catch (error) {
      console.error("Error handling audio:", error);
    }

    setSending(false);
  };

  const handleCancelAudio = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio.url);
      setRecordedAudio(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-3 md:p-4 flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] border-2 border-white rounded-lg">
      {capturedPhoto && (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
          <img 
            src={capturedPhoto.preview} 
            alt="Preview" 
            className="max-w-full max-h-[60vh] object-contain rounded-lg mb-4"
          />
          <div className="flex gap-4">
            <button
              onClick={handleCancelPhoto}
              className="w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            >
              ✕
            </button>
            <button
              onClick={handleSendPhoto}
              disabled={sending}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 rounded-full text-white font-bold text-xl disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {recording && (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
          <div className="mb-8">
            <div className="w-32 h-32 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
              {sender === "kid" ? (
                <img src="/MIC-removebg-preview.png" alt="Recording" className="w-20 h-20" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </div>
          </div>
          <p className="text-white text-xl mb-8">Recording...</p>
          <button
            onClick={handleStopRecording}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-full text-white font-bold text-xl"
          >
            Stop
          </button>
        </div>
      )}

      {recordedAudio && (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
          <div className="mb-4 text-white text-xl">Preview your recording:</div>
          <audio 
            src={recordedAudio.url} 
            controls 
            className="mb-8 w-full max-w-md"
          />
          <div className="flex gap-4">
            <button
              onClick={handleCancelAudio}
              className="w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            >
              ✕
            </button>
            <button
              onClick={handleSendAudio}
              disabled={sending}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 rounded-full text-white font-bold text-xl disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 px-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 sm:p-4 rounded-lg ${
              message.sender === "kid"
                ? "bg-blue-100 dark:bg-blue-900"
                : "bg-green-100 dark:bg-green-900"
            }`}
          >
            <div className="font-semibold text-xs sm:text-sm mb-1">
              {message.sender === "kid" ? "nala" : message.sender}
            </div>
            {message.image_url ? (
              <div>
                <div className="text-sm sm:text-base break-words mb-2">{message.content}</div>
                <img 
                  src={message.image_url} 
                  alt="Shared photo" 
                  className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                />
              </div>
            ) : message.audio_url ? (
              <div>
                <div className="text-sm sm:text-base break-words mb-2">{message.content}</div>
                <audio 
                  src={message.audio_url} 
                  controls 
                  className="w-full max-w-sm"
                />
              </div>
            ) : (
              <div className="text-sm sm:text-base break-words">{message.content}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoCapture}
        className="hidden"
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        <button
          type="button"
          className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${
            sender === "kid" 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-black hover:bg-gray-800"
          }`}
          onClick={handleStartRecording}
          disabled={recording}
        >
          {sender === "kid" ? (
            <img src="/MIC-removebg-preview.png" alt="Mic" className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56" />
          ) : (
            <Mic className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
          )}
        </button>
        <button
          type="button"
          className={`aspect-square rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${
            sender === "kid"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-white hover:bg-gray-200 border-2 border-black"
          }`}
          onClick={handleTakePhoto}
        >
          {sender === "kid" ? (
            <img src="/camera.png" alt="Camera" className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56" />
          ) : (
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-black" />
          )}
        </button>
      </div>

    </div>
  );
}
