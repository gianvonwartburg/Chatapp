import React, { useState } from "react";
import axios from "axios";

const JoinChatRoomModal = ({ userId, onClose, setChatRoom }) => {
  const [chatName, setChatName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!chatName.trim()) {
      alert("Chat name is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `https://localhost:7100/api/chats/join`,
        {
          userId,
          chatRoomName: chatName,
          // Optionales Passwort
          password: password || null,
        }
      );

      const { chatRoomId, chatRoomName } = response.data;
      console.log(response.data);
      // Erfolgreich verbunden, `setChatRoom` aufrufen
      setChatRoom({
        chatRoomId: chatRoomId,
        name: chatRoomName,
      });

      // Modal schließen
      onClose();
    } catch (error) {
      console.error("Error joining chat room:", error);
      if (error.response && error.response.data) {
        alert(error.response.data); // Zeigt spezifische Fehlermeldungen vom Backend an
      } else {
        alert("An error occurred while trying to join the chat.");
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
              disabled={loading}
              className={`ml-2 px-4 py-2 rounded-lg transition ${
                loading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
