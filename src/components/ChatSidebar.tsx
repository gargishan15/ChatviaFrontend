import React, { useState } from 'react';
import { chats, user } from '@/context/AppContext';
import { UserCircle, X, MessageCircle, Plus, Search, CornerUpLeft, CornerDownLeft, CornerDownRight, LogOut } from 'lucide-react';
import Link from 'next/link';

interface ChatSidebarProps {
    siderbarOpen: boolean;
    setSiderbarOpen: React.Dispatch<React.SetStateAction<boolean>>;

    showAllUser: boolean;
    setShowAllUser: React.Dispatch<React.SetStateAction<boolean>>;

    selectedUser: string | null;
    setSelectedUser: React.Dispatch<React.SetStateAction<string | null>>;

    chats: chats[] | null;
    users: user[] | null;

    loggedInUser: user | null;

    handleLogout: () => void;
    createChat: (user: user) => void
    onlineUsers: string[];
}

const ChatSidebar = ({
    siderbarOpen,
    setShowAllUser,
    setSiderbarOpen,
    showAllUser,
    users,
    loggedInUser,
    chats,
    selectedUser,
    setSelectedUser,
    handleLogout,
    createChat,
    onlineUsers,
}: ChatSidebarProps) => {

    const [searchQuery, setSearchQuery] = useState("");

    return (
        <aside
            className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform ${siderbarOpen ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 transition-transform duration-300 flex flex-col overflow-hidden`}
        >


            <div className="p-6 border-b border-gray-700">
                <div className="sm:hidden flex justify-end mb-0">
                    <button
                        onClick={() => setSiderbarOpen(false)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{showAllUser ? "New Chat" : "Messages"}</h2>
                    </div>

                    <button
                        className={`p-2.5 rounded-lg transition-colors ${showAllUser
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                        onClick={() => setShowAllUser(prev => !prev)}
                    >
                        {showAllUser ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>


            <div className="flex-1 overflow-hidden px-4 py-2">


                {showAllUser ? (

                    <div className="space-y-4 h-full">


                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2 pb-4">

                            {users
                                ?.filter(
                                    (u) =>
                                        u._id !== loggedInUser?._id &&
                                        u.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((u) => (
                                    <button
                                        key={u._id}
                                        className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-colors"
                                        onClick={() => createChat(u)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <UserCircle className="w-6 h-6 text-gray-300" />
                                                {
                                                    onlineUsers.includes(u._id.toString()) && (
                                                        <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-900' />
                                                    )
                                                }

                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-white">{u.name}</span>
                                                <div className='text-xs text-gray-400 mt-0.5'>
                                                    {onlineUsers.includes(u._id.toString()) ? "Online" : "Offline"}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>
                ) : chats && chats.length > 0 ? (

                    <div className="space-y-2 pb-4">

                        {chats?.map((chatItem) => {
                            const latestMessage = chatItem.chat.latestMessage;
                            const isSelected = selectedUser === chatItem.chat._id;
                            const isSentByMe = latestMessage?.sender === loggedInUser?._id;
                            const unseenCount = chatItem.chat.unseenCount || 0;

                            return (
                                <button
                                    key={chatItem.chat._id}
                                    onClick={() => {
                                        setSelectedUser(chatItem.chat._id);
                                        setSiderbarOpen(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-lg border ${isSelected
                                        ? "border-blue-500 bg-blue-600"
                                        : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                                        } transition-colors flex items-center gap-3`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                                <UserCircle className="w-6 h-6 text-gray-300" />

                                            </div>
                                            {
                                                onlineUsers.includes(chatItem.user._id.toString()) && (
                                                    <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-900' />
                                                )
                                            }

                                            {unseenCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {unseenCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className='flex items-center justify-between mb-1'>
                                                <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'
                                                    }`} >
                                                    {chatItem.user.name}
                                                </span>

                                                
                                            </div>

                                            {latestMessage && (
                                                <div className='flex items-center gap-2'>
                                                    {isSentByMe ? <CornerUpLeft size={14} className='text-blue-400 text-shrink-0 ' /> : <CornerDownRight size={14} className='text-green-400 text-shrink-0' />}
                                                </div>
                                            )}
                                            <span className='text-sm text-grey-400 truncate flex-1 '>{latestMessage.text}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (

                    <div className='flex flex-col items-center justify-center h-full text-center '>
                        <div className='p-4 bg-gray-800 rounded-full mb-4'>
                            <MessageCircle className='w-8 h-8 text-gray-400' />
                        </div>
                        <p className='text-gray-400 font-medium '>No Conversation yet</p>
                        <p className="text-sm text-gray-500 mt-1 ">Start a new chat to begin messaging </p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-700 space-y-2">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <div className="p-1.5 bg-gray-700 rounded-lg">
                        <UserCircle className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className="font-medium text-gray-300">Profile</span>
                </Link>
                <button onClick={handleLogout} className='w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-red-500 hover:text-white'>
                    <div className="p-1.5 bg-red-600 rounded-lg">
                        <LogOut className="w-4 h-4 text-gray-300" />
                    </div>
                    <span className='font-medium' >Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default ChatSidebar;
