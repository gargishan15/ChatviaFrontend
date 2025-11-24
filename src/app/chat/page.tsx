'use client';
import React, { useEffect, useState } from 'react'
import { chat_service, useAppData, user, user as UserType } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import ChatSidebar from '@/components/ChatSidebar';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/components/ChatHeader';
import ChatMessages from '@/components/ChatMessages';
import MessageInput from '@/components/MessageInput';
import { SocketData } from '@/context/SocketContext';
import { on } from 'events';
import { clear } from 'console';

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: { url: string; publicId: string; };
  messageType: 'text' | 'image';
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatApp = () => {
  const { loading, isAuth, logoutUser, chats, setChats, user: loggedInUser, users, fetchChats } = useAppData();

  const { onlineUsers, socket } = SocketData();




  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [siderbarOpen, setSiderbarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [showAllUser, setShowAllUser] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

  const router = useRouter();


  useEffect(() => {
    if (!loading && !isAuth) {
      router.push('/login');
    }
  }, [loading, router, isAuth]);



  async function fetchChat() {
    if (!selectedUser) return;
    const token = Cookies.get('token');

    try {
      const { data } = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(data.messages);
      setUser(data.user.user || data.user);
      fetchChats();

    } catch (error: any) {
      console.log("FETCHCHAT ERROR:", error.response?.data || error);
    }
  }

  const moveChatToTop = (chatId: string, newMessage: any, updatedUnseenCount = true) => {
    setChats((prev) => {
      if (!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(
        (c) => c.chat._id === chatId
      );

      if (chatIndex !== -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1)

        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: {
              text: newMessage.text,
              sender: newMessage.sender,
            },
            updatedAt: new Date().toString(),

            unseenCount: updatedUnseenCount && newMessage.sender !== loggedInUser?._id
              ? (moveChat.chat.unseenCount || 0) + 1
              : moveChat.chat.unseenCount || 0,
          },
        };
        updatedChats.unshift(updatedChat);
      }

      return updatedChats;
    });
  };

  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0
            }
          }
        }
        return chat;
      });
    });
  };


  async function createChat(u: user) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(`${chat_service}/api/v1/chat/new`, {
        userId: loggedInUser?._id,
        otherUserId: u._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedUser(data.chatId);
      setShowAllUser(false);
      fetchChats();

    } catch (error) {
      toast.error("Failed to start the chat");
    }
  }



  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();

    if (!message.trim() && !imageFile) return;

    if (!selectedUser) return;

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id
    });


    const token = Cookies.get("token");
    const formData = new FormData();

    formData.append("chatId", selectedUser);
    if (message.trim()) formData.append("text", message);
    if (imageFile) formData.append("image", imageFile);

    try {
      const { data } = await axios.post(`${chat_service}/api/v1/message`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setMessages((prev) => {
        const current = prev || [];
        const exists = current.some(msg => msg._id === data.message._id);
        if (!exists) return [...current, data.message];
        return current;
      });

      setMessage("");

      const displayText = imageFile? "📷image" : message;

      moveChatToTop(
        selectedUser!,{
          text: displayText,
          sender: data.sender,
        },
        false
      );

    } catch (error: any) {
      toast.error(error.response?.data?.message);
    }
  };


  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;
    // socket typing logic here (future)

    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id
      })
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut)
    }

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id
      })
    }, 2000)
    setTypingTimeOut(timeout)
  };


  useEffect(() => {
    socket?.on("newMessage", (message) => {
      console.log("Recieved new message:", message);

      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || [];
          const messageExists = currentMessages.some(
            (msg) => msg._id === message._id
          )

          if (!messageExists) {
            return [...currentMessages, message]
          }

          return currentMessages;
        });
        moveChatToTop(message.chatId, message, false);
      } else{
        moveChatToTop(message.chatId, message, true)
      }
    });

    socket?.on("messagesSeen", (data) => {
      console.log("📘 Messages seen by :", data);

      if (data.chatId === selectedUser) {
        setMessages((prev) => {
          if (!prev) return prev;

          return prev.map((msg) =>
            data.messageIds.includes(msg._id)
              ? { ...msg, seen: true, seenAt: new Date().toString() }
              : msg
          );
        });
      }
    });

    socket?.on("userTyping", (data) => {
      console.log("recieved user typing", data);
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setTyping(true);
      }
    });

    socket?.on("userStoppedTyping", (data) => {
      console.log("recieved user stopped typing", data);
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setTyping(false);
      }
    });

    return () => {

      socket?.off("newMessage");
      socket?.off("messagesSeen");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping")
    }
  }, [socket, selectedUser, setChats, loggedInUser?._id])


  useEffect(() => {
    if (selectedUser) fetchChat();
    setTyping(false);

    selectedUser && resetUnseenCount(selectedUser);


    socket?.emit("joinChat", selectedUser);

    return () => {
      socket?.emit("leaveChat", selectedUser);
      setMessages(null);
    }
  }, [selectedUser, socket]);


  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut)
      }
    }
  }, [typingTimeOut])


  if (loading) return <Loading />;

  return (
    <div className='h-screen flex overflow-hidden bg-gray-900 text-white'>
      <ChatSidebar
        siderbarOpen={siderbarOpen}
        setSiderbarOpen={setSiderbarOpen}
        showAllUser={showAllUser}
        setShowAllUser={setShowAllUser}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={logoutUser}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />

      <div className='flex-1 flex flex-col overflow-hidden p-4 bg-white/5 border border-white/10'>
        <ChatHeader user={user} isTyping={typing} setSiderbarOpen={setSiderbarOpen} onlineUsers={onlineUsers} />

        <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />

        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={handleTyping}
          handleMessageSend={handleMessageSend}
        />
      </div>
    </div>
  );
};

export default ChatApp;
