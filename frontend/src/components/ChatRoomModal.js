import React, { useState } from "react";

const ChatRoomModal = ({ onClose, onCreate, userId }) => {
  const [chatRoomName, setChatRoomName] = useState("");
  const [chatRoomPassword, setChatRoomPassword] = useState("");
  const [error, setError] = useState("");

  // const handleCreate = async () => {
  //   console.log("test");
  //   if (!chatRoomName.trim()) {
  //     setError("Chatroom Name darf nicht leer sein.");
  //     return;
  //   }

  //   try {
  //     // API-Call zum Erstellen des Chatrooms
  //     console.log(userId);
  //     const response = await fetch(
  //       `https://localhost:7100/api/chats/create?userId=${userId}`, // Hier wird userId übergeben
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           name: chatRoomName,
  //           passwordHash: chatRoomPassword,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Fehler beim Erstellen des Chatrooms.");
  //     }

  //     const data = await response.json();
  //     onCreate({ id: data.chatRoomId, name: chatRoomName });
  //     onClose();
  //   } catch (err) {
  //     setError(err.message || "Etwas ist schiefgegangen.");
  //   }
  // };

  const handleCreate = async () => {
    if (!chatRoomName.trim()) {
      setError("Chatroom Name darf nicht leer sein.");
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

      onCreate(); // Callback ausführen, um die Chatroom-Liste zu aktualisieren
      onClose(); // Modal schließen
    } catch (err) {
      setError(err.message || "Etwas ist schiefgegangen.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Neuen Chatroom erstellen</h2>

        {error && <p className="text-red-500">{error}</p>}

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

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Abbrechen
          </button>
          <button
            disabled={!chatRoomName.trim()} // Button deaktivieren, wenn der Name leer ist
            onClick={handleCreate}
            className={`px-4 py-2 rounded transition ${
              chatRoomName.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Erstellen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomModal;
