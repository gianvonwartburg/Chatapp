import React, { useState } from "react";

const ChatRoomModal = ({ onClose, onCreate, userId }) => {
  const [chatRoomName, setChatRoomName] = useState("");
  const [chatRoomPassword, setChatRoomPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async () => {
    if (!chatRoomName.trim()) {
      setErrorMessage("Chatroom Name darf nicht leer sein.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7100/api/chats/create?userId=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: chatRoomName,
            passwordHash: chatRoomPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Chatrooms.");
      }

      onCreate(); // Reload chatlist callback
      onClose(); //close Modal
    } catch (err) {
      setErrorMessage(err.message || "Etwas ist schiefgegangen.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create new ChatRoom</h2>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <input
          type="text"
          placeholder="Chatroom Name"
          value={chatRoomName}
          onChange={(e) => setChatRoomName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <input
          type="password"
          placeholder="Passwort (optional)"
          value={chatRoomPassword}
          onChange={(e) => setChatRoomPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        />
        {/* ErrorMessage */}
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
        )}
        {/* Footer */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-black rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            disabled={!chatRoomName.trim()}
            onClick={handleCreate}
            className={`px-4 py-2 rounded transition ${
              chatRoomName.trim()
                ? "bg-blue-500 text-black hover:bg-blue-600"
                : "bg-gray-400 text-black cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomModal;
