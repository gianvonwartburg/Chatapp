import React, { useState, useEffect } from "react";
import ChatRoomModal from "./ChatRoomModal";
import PasswordModal from "./PasswordModal";
import axios from "axios";

const ChatList = ({ userId, setChatRoom, onLogout }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isChatRoomModalOpen, setIsChatRoomModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);

  // Fetch Chatrooms
  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7100/api/chats/${userId}`
      );
      console.log(response.data);
      setChatRooms(response.data);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  //Lade Chatrooms beim Initialisieren der Komponente
  useEffect(() => {
    fetchChatRooms();
  }, [userId]);

  const handleCreateChat = async () => {
    // Lade die Liste neu, nachdem ein Chat erstellt wurde
    await fetchChatRooms();
  };

  // const handleJoinChat = (chatRoom) => {
  //   if (chatRoom.hasPassword) {
  //     setSelectedChatRoom(chatRoom);
  //     setIsPasswordModalOpen(true);
  //   } else {
  //     onSetChatRoom(chatRoom);
  //   }
  // };

  //KAPUTT
  const handlePasswordSubmit = async (password) => {
    try {
      console.log(selectedChatRoom);
      // onSetChatRoom(selectedChatRoom);
    } catch (error) {
      alert("Ungültiges Passwort");
    } finally {
      setIsPasswordModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-500 text-white px-4 py-2">
        <h2 className="text-lg font-bold">ChatRooms</h2>
        <div>
          <button
            onClick={() => setIsChatRoomModalOpen(true)}
            className="mr-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Create Chat
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
                <button
                  onClick={() => {
                    console.log(chatRoom);
                    setChatRoom({
                      //Setze ChatRoom in App.js
                      chatRoomId: chatRoom.id,
                      name: chatRoom.name,
                      //Dont need hasPassword
                    });
                  }}
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
      {isChatRoomModalOpen && (
        <ChatRoomModal
          userId={userId}
          onClose={() => setIsChatRoomModalOpen(false)}
          onCreate={handleCreateChat}
        />
      )}
      {isPasswordModalOpen && (
        <PasswordModal
          chatRoomName={selectedChatRoom?.name}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
};

export default ChatList;
