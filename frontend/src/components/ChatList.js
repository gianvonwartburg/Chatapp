import React, { useState, useEffect } from "react";
import ChatRoomModal from "./ChatRoomModal";
import PasswordModal from "./PasswordModal";
import axios from "axios";
import JoinChatRoomModal from "./JoinChatRoomModal";

const ChatList = ({ userId, setChatRoom, onLogout, setChatRoomPassword }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isCreateChatRoomModalOpen, setIsCreateChatRoomModalOpen] =
    useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedChatRoomName, setSelectedChatRoomName] = useState(null);

  const [isJoinChatRoomModalOpen, setIsJoinChatRoomModalOpen] = useState(false);

  // Fetch Chatrooms
  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7100/api/chats/${userId}`
      );
      setChatRooms(response.data);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  //Load Chatrooms on Component-init
  useEffect(() => {
    fetchChatRooms();
  }, [userId]);

  const handleCreateChat = async () => {
    // Reload ChatRoom-list
    await fetchChatRooms();
  };

  const handleJoinChatRoom = (chatRoom) => {
    if (!chatRoom) return;

    if (chatRoom.hasPassword) {
      //open PasswordModal
      setSelectedChatRoomName(chatRoom.name);
      setIsPasswordModalOpen(true);
    } else {
      setChatRoom({
        chatRoomId: chatRoom.id,
        name: chatRoom.name,
        //Dont need hasPassword
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-500 text-white px-4 py-2">
        <h2 className="text-lg font-bold">ChatRooms</h2>
        <div>
          <button
            onClick={() => setIsCreateChatRoomModalOpen(true)}
            className="mr-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Create Chat
          </button>
          <button
            onClick={() => setIsJoinChatRoomModalOpen(true)}
            className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Join Chat
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatRooms.length === 0 ? (
          <p className="text-center text-gray-500">No chat rooms available.</p>
        ) : (
          <ul className="space-y-2">
            {chatRooms.map((chatRoom) => (
              <li
                key={chatRoom.id}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
              >
                <span>{chatRoom.name}</span>
                {/* Set ChatRoom in App.js*/}
                <button
                  onClick={() => handleJoinChatRoom(chatRoom)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      {/* Join Chat Modal */}
      {isJoinChatRoomModalOpen && (
        <JoinChatRoomModal
          userId={userId}
          setChatRoomPassword={setChatRoomPassword}
          onClose={() => setIsJoinChatRoomModalOpen(false)}
          setChatRoom={setChatRoom}
        />
      )}
      {/* Create Chat Modal */}
      {isCreateChatRoomModalOpen && (
        <ChatRoomModal
          userId={userId}
          onClose={() => setIsCreateChatRoomModalOpen(false)}
          onCreate={handleCreateChat}
        />
      )}
      {/* Password Modal */}
      {isPasswordModalOpen && (
        // selectedchatRoom passen
        <PasswordModal
          userId={userId}
          setChatRoomPassword={setChatRoomPassword}
          setChatRoom={setChatRoom} //ChatRoom State of App.js
          selectedChatRoomName={selectedChatRoomName} //selected ChatRoom for API call
          setSelectedChatRoomName={setSelectedChatRoomName}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatList;
