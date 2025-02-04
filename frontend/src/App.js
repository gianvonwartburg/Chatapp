import React, { useState } from "react";
import "./App.css";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const App = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [joined, setJoined] = useState(false);

  // Verbindung herstellen und Chatroom beitreten
  const joinChatRoom = async () => {
    try {
      const conn = new HubConnectionBuilder()
        .withUrl("https://localhost:7100/chat")
        .configureLogging(LogLevel.Information)
        .build();

      // Empfange Nachrichten
      conn.on("ReceiveMessage", (username, message) => {
        setMessages((prev) => [...prev, { username, message }]);
      });

      // Lade vorhandene Nachrichten
      conn.on("LoadMessages", (loadedMessages) => {
        setMessages(loadedMessages);
      });

      await conn.start();
      await conn.invoke("JoinSpecificChat", { username, chatRoom });
      setConnection(conn);
      setJoined(true);
    } catch (e) {
      console.error("Fehler beim Verbinden:", e);
    }
  };

  // Nachricht senden
  const sendMessage = async () => {
    if (connection && newMessage) {
      await connection.invoke("SendMessage", username, chatRoom, newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Join Room Screen */}
      {!joined ? (
        <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Join Chat Room</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-blue-500"
          />
          <input
            type="text"
            placeholder="Chat Room"
            value={chatRoom}
            onChange={(e) => setChatRoom(e.target.value)}
            className="w-full p-2 mb-4 border rounded focus:outline-blue-500"
          />
          <button
            onClick={joinChatRoom}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Join
          </button>
        </div>
      ) : (
        // Chat Room Screen
        <div className="w-full max-w-2xl p-6 bg-white rounded shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Chat Room: {chatRoom}</h1>
          <div className="h-64 overflow-y-scroll border p-4 mb-4 bg-gray-50 rounded">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">Keine Nachrichten vorhanden.</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <span className="font-bold">{msg.username}:</span> {msg.message}
                </div>
              ))
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nachricht eingeben..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow p-2 border rounded focus:outline-blue-500"
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
            >
              Senden
            </button>
          </div>
        </div>
      )}
    </div>
  );


  // const [connection, setConnection] = useState(null);

  // const joinChatRoom = async (username, chatRoom) => {
  //   try{
  //     //Initiate Connection
  //     const conn = new HubConnectionBuilder().withUrl("https://localhost:7100/chat")
  //     .configureLogging(LogLevel.Information)
  //     .build()

  //     //setup handler
  //     conn.on("JoinSpecificChat", (username, msg) => {
  //       console.log("msg: ", msg)
  //     })
  //     await conn.start();
  //     await conn.invoke("JoinSpecificChat", {username, chatRoom})
  //     //Set connection to state
  //     setConnection(conn);      
  //   } catch(e){
  //     console.error("Fehler beim Verbinden:", e);
  //   }
  //  }


  // return (
  //   <div>
  //   <h1>Chat App</h1>
  //   <button onClick={() => joinChatRoom("Gian", "General")}>
  //     Chat beitreten
  //   </button>
  // </div>
  // );
};

export default App;