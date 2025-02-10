import React, { useState } from "react";
import axios from "axios";

const PasswordModal = ({
  userId,
  setChatRoomPassword,
  setChatRoom,
  onClose,
  selectedChatRoomName,
  setSelectedChatRoomName,
}) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setErrorMessage("Password is required.");
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
          chatRoomName: selectedChatRoomName,
          // Optional Password
          password: password,
        }
      );

      const { chatRoomId, chatRoomName } = response.data;

      //Clear selectedChatRoomName after API call is done
      setSelectedChatRoomName(null);

      // Set ChatRoom-State in App.js to navigate to ChatRoom.js
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
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Enter password for ChatRoom</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
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
            disabled={!password.trim() || loading}
            onClick={handleSubmit}
            className={` py-2 px-4 rounded transition ${
              loading || !password.trim()
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-black"
            }`}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
