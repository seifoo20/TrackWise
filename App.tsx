
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { MessageSender, type ChatMessage } from './types';
import { INITIAL_BOT_MESSAGE, API_KEY_ERROR_MESSAGE, USER_REQUESTS_DOCTOR_DISCUSSION_PHRASE } from './constants';
import { createChatSession, sendMessageToGeminiStream, generateChatSummary } from './services/geminiService';
import ChatMessageItem from './components/ChatMessageItem';
import ChatInput from './components/ChatInput';
import SummaryModal from './components/SummaryModal';
import LandingPage, { UserInfo } from './components/LandingPage'; // Import LandingPage and UserInfo
import { AlertTriangle, CheckCircle, NotebookPen, LoaderCircle, ArrowLeftCircle } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [summaryForDoctor, setSummaryForDoctor] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, duration: number = 3500) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const handleFlagMessageForDoctor = (messageText: string) => {
    console.log("Message noted for discussion:", messageText);
    showToast("Message noted! Remember to discuss important points with your doctor or therapist during your next consultation.");
  };

  const initializeChat = useCallback(async (collectedUserInfo: UserInfo | null) => {
    setIsInitializing(true);
    setError(null);
    setMessages([]); 

    let currentInitialBotMessage = INITIAL_BOT_MESSAGE;
    if (collectedUserInfo?.name) {
        currentInitialBotMessage = `Hi ${collectedUserInfo.name}! I'm TrackWise, your friendly companion for your health journey. If you're managing a chronic condition or the stress that comes with it, I'm here to listen and share info. How can I help today? (Quick reminder: I'm for general support, not medical advice – always best to chat with your doctor or GP for that!)`;
    }

    try {
      // Ensure API key check is robust, this is a simplified check
      let apiKeyIsAvailable = false;
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
          apiKeyIsAvailable = true;
      }
      
      if (!apiKeyIsAvailable) {
          console.error("API_KEY is not defined or accessible. Chatbot may not function.");
          setError(API_KEY_ERROR_MESSAGE);
          setIsInitializing(false);
           setMessages([
            {
              id: crypto.randomUUID(),
              text: "I'm having trouble starting up due to a configuration issue. Please ensure the API key is set up correctly if you are a developer.",
              sender: MessageSender.BOT,
              timestamp: new Date(),
            }
          ]);
          return;
      }

      const session = await createChatSession(collectedUserInfo);
      setChatSession(session);
      setMessages([
        {
          id: crypto.randomUUID(),
          text: currentInitialBotMessage,
          sender: MessageSender.BOT,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Initialization error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during initialization.";
      setError(errorMessage);
       setMessages([
        {
          id: crypto.randomUUID(),
          text: "I'm having a little trouble connecting right now. Please check your setup or try again in a moment.",
          sender: MessageSender.BOT,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLandingSubmit = (data: UserInfo | null) => {
    setUserInfo(data);
    setShowLandingPage(false);
    initializeChat(data);
  };

  const handleReturnToLanding = () => {
    setShowLandingPage(true);
    setChatSession(null);
    setMessages([]);
    setUserInfo(null);
    setError(null);
    setIsLoading(false);
    setIsSummarizing(false);
    setSummaryForDoctor(null);
    setShowSummaryModal(false);
    // setIsInitializing(true); // Keep true, as LandingPage will be shown. Chat init will handle its own isInitializing.
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      setToastMessage(null);
    }
  };

  useEffect(() => {
    // Clean up toast timeout on component unmount
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!chatSession || isLoading || isInitializing) return; 

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: MessageSender.USER,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    if (text === USER_REQUESTS_DOCTOR_DISCUSSION_PHRASE) {
      showToast("Marker added to chat. Please remember to discuss this with your doctor.", 4000);
    }

    const botMessageId = crypto.randomUUID();
    const placeholderBotMessage: ChatMessage = {
        id: botMessageId,
        text: '',
        sender: MessageSender.BOT,
        timestamp: new Date(),
        isStreaming: true,
    };
    setMessages((prevMessages) => [...prevMessages, placeholderBotMessage]);

    try {
      let fullBotResponse = "";
      for await (const chunk of sendMessageToGeminiStream(chatSession, text)) {
        fullBotResponse += chunk;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: fullBotResponse, timestamp: new Date() } : msg
          )
        );
      }
      setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: fullBotResponse, isStreaming: false, timestamp: new Date() } : msg
          )
        );

    } catch (err) {
      console.error("Error during message streaming:", err);
      const errorMessageText = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessageText);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botMessageId ? { ...msg, text: "Oh dear, I seem to have hit a snag. Could you try sending that again?", isStreaming: false, timestamp: new Date() } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestSummaryForDoctor = async () => {
    if (isSummarizing || messages.length <= 1) { 
      if(messages.length <= 1) {
        showToast("Chat is too short to summarize.", 2000);
      }
      return;
    }
    setIsSummarizing(true);
    setError(null);
    try {
      const summary = await generateChatSummary(messages);
      setSummaryForDoctor(summary);
      setShowSummaryModal(true);
    } catch (err) {
      console.error("Error generating summary:", err);
      const errorMsg = err instanceof Error ? err.message : "Could not generate summary.";
      showToast(`Error: ${errorMsg}`, 5000);
      setError(`Failed to generate summary: ${errorMsg}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (showLandingPage) {
    // When returning to landing page, ensure isInitializing is true so the loading screen shows 
    // if user resubmits, rather than showing old chat error messages etc.
    // However, LandingPage itself doesn't need an isInitializing prop.
    // The main app's isInitializing state will cover the period after landing page submission.
    return <LandingPage onSubmit={handleLandingSubmit} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-sky-50 via-rose-50 to-amber-50">
      <header className="p-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between shadow-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
           <button
            onClick={handleReturnToLanding}
            className="p-2 text-white hover:bg-sky-800/60 rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400"
            title="Change User Info / Restart Chat"
            aria-label="Return to user information page and restart chat"
          >
            <ArrowLeftCircle size={24} />
          </button>
          <h1 className="text-2xl font-bold">TrackWise</h1>
        </div>
        <button
            onClick={handleRequestSummaryForDoctor}
            disabled={isSummarizing || isLoading || messages.length <= 1 || isInitializing}
            className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-sky-700"
            title={messages.length <=1 ? "Chat is too short to summarize" : "Summarize chat for your reference"}
            aria-label="Summarize chat for your reference"
        >
            {isSummarizing ? (
                <LoaderCircle size={18} className="animate-spin" />
            ) : (
                <NotebookPen size={18} />
            )}
            Summarize Chat
        </button>
      </header>

      {isInitializing && (
         <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <svg className="animate-spin h-12 w-12 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-5 text-xl text-slate-700">TrackWise is getting ready...</p>
            {(userInfo?.name && <p className="text-lg text-slate-600">Just for you, {userInfo.name}!</p>)}
            <p className="text-md text-slate-500">Just a moment, please!</p>
          </div>
      )}

      {!isInitializing && error && !showSummaryModal && ( 
        <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded-xl shadow-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle size={22} className="mr-2 text-red-600" />
            <p className="font-semibold text-lg">Oops, an error occurred:</p>
          </div>
          <p className="text-md">{error}</p>
        </div>
      )}
      
      {!isInitializing && (
        <>
          <div
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white/40 backdrop-blur-lg"
          >
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} onFlagMessage={handleFlagMessageForDoctor}/>
            ))}
          </div>
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isSummarizing || isInitializing} />
        </>
      )}

      {showSummaryModal && summaryForDoctor && (
        <SummaryModal
          summaryText={summaryForDoctor}
          onClose={() => setShowSummaryModal(false)}
        />
      )}

      {toastMessage && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white py-3 px-6 rounded-lg shadow-2xl text-sm flex items-center z-50 transition-all duration-300 ease-out"
          role="status"
          aria-live="polite"
        >
          <CheckCircle size={20} className="mr-2.5 text-green-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;