import React from "react";
import { MoleculeState, NamingResult, ChatMessage } from "../types";
import { Sparkles, X, Send, Bot, User, HelpCircle, Loader2 } from "lucide-react";

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moleculeState: MoleculeState;
  namingResult: NamingResult;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  moleculeState,
  namingResult
}) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "init",
      sender: "ai",
      text: `Hello! I am your AI Chemistry Tutor powered by Gemini. I can explain the IUPAC naming logic for **${namingResult.name}**, clarify locant priorities, or answer any organic chemistry questions! What would you like to know?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          moleculeContext: {
            iupacName: namingResult.name,
            formula: namingResult.formula,
            state: moleculeState,
            breakdown: namingResult.breakdown
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || "Failed to reach AI Tutor server.");
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `⚠️ Error: ${err.message || "Failed to generate explanation. Make sure GEMINI_API_KEY is configured in AI Studio Secrets."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    `Why was the name '${namingResult.name}' chosen for this structure?`,
    "Why does the alcohol group get locant priority over an alkene or substituent?",
    "Explain how substituent alphabetical order works when di- or tri- prefixes are used.",
    "What is the difference between IUPAC 1993 and IUPAC 2013 locant pin-placement rules?"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-lg bg-[#16191f] border-l border-white/10 h-full flex flex-col shadow-2xl text-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-[#121418] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-serif-display font-bold text-lg text-white">AI Chemistry Professor</h3>
              <p className="text-[11px] font-mono-code text-blue-300">
                Context: {namingResult.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-[#0f1115] border-b border-white/10 flex items-center gap-2 overflow-x-auto text-xs font-mono-code">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400 shrink-0">Quick Ask:</span>
          {sampleQuestions.slice(0, 2).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-[#1e232d] border border-white/10 hover:border-blue-500 text-slate-300 hover:text-white rounded-full shrink-0 transition text-[11px] cursor-pointer"
            >
              {q.length > 35 ? q.slice(0, 35) + "..." : q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap font-sans ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-[#121418] border border-white/10 text-slate-200 rounded-bl-none shadow-2xs"
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] font-mono-code mt-1 text-right ${
                    msg.sender === "user" ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center text-xs font-mono-code text-slate-400">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">AI Chemistry Professor is thinking...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#121418] border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            placeholder="Ask anything about chemistry nomenclature..."
            className="flex-1 px-3 py-2 bg-[#1e232d] border border-white/10 rounded-md font-sans text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
