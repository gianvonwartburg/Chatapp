import React, { useState } from "react";

const PasswordModal = ({ chatRoomName, onClose, onSubmit }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!password.trim()) {
      alert("Passwort darf nicht leer sein.");
      return;
    }
    onSubmit(password); // Passwort übergeben
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {`Passwort für ${chatRoomName} eingeben`}
        </h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
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
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
