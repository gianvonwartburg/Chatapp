import React, { useState } from "react";
import axios from "axios";

const JoinChatRoomModal = ({
  userId,
  onClose,
  setChatRoom,
  setChatRoomPassword,
}) => {
  const [chatName, setChatName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chatName.trim()) {
      setErrorMessage("Chat name is required.");
      return;
    }

    setLoading(true);
    //Reset Error Message before sending request
    setErrorMessage("");

    try {
      const response = await axios.post(
        `https://localhost:7100/api/chats/join`,
        {
          userId,
          chatRoomName: chatName,
          // Optional Password
          password: password || null,
        }
      );

      const { chatRoomId, chatRoomName } = response.data;

      // Set ChatRoom-State in App.js um zu navigieren
      setChatRoom({
        chatRoomId: chatRoomId,
        name: chatRoomName,
      });
      //Set Password-State in App.js
      setChatRoomPassword(password);

      // Close Modal
      onClose();
    } catch (error) {
      console.error("Error joining chat room:", error);

      // Show Error from Backend
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage("An error occurred while trying to join the chat.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Join Chat Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Chat Name
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter chat name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password (optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          {/* ErrorMessage */}
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
          )}
          {/* Footer */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !chatName.trim()}
              className={`ml-2 px-4 py-2 rounded-lg transition ${
                loading || !chatName.trim()
                  ? "bg-gray-400 text-black cursor-not-allowed"
                  : "bg-blue-500 text-black hover:bg-blue-600"
              }`}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinChatRoomModal;
