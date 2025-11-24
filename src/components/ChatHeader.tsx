import React from "react";
import { Menu, UserCircle } from "lucide-react";
import { user } from "@/context/AppContext";

interface ChatHeaderProps {
  user: user | null;
  setSiderbarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({
  user,
  setSiderbarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  const isOnlineUser = user && onlineUsers.includes(user._id);

  return (
    <div className="relative mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 pt-6">

    
    <div className="sm:hidden absolute top-3 right-3">
        <button
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={() => setSiderbarOpen(true)}
        >
            <Menu className="w-5 h-5 text-gray-200" />
        </button>
    </div>

    <div className="flex items-center gap-4">
        {user ? (
            <>
                <div className="relative">
                  
                    <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserCircle className="w-4 h-4 sm:w-8 sm:h-8 text-gray-300" />
                    </div>

                    {isOnlineUser && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 border-2 border-gray-800">
                            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate mb-1">
                        {user.name}
                    </h2>
                    
                    
                    {isTyping ? (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                            <span className="text-blue-500 font-medium">typing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    isOnlineUser ? "bg-green-500" : "bg-gray-500"
                                }`}
                            ></div>
                            <span
                                className={`font-medium ${
                                    isOnlineUser ? "text-green-500" : "text-gray-400"
                                }`}
                            >
                                {isOnlineUser ? "Online" : "Offline"}
                            </span>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-gray-700 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                </div>

                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-400">
                        Select a Conversation
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Choose a chat from the sidebar to start messaging

                    </p>
                </div>
            </div>
        )}
    </div>
</div>

  );
};

export default ChatHeader;
