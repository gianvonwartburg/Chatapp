import React, { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const ChatRoom = ({ chatRoomId, user, password, onLeave }) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]); //{sender: user1, receivedMessage: message, timestamp}
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const connectToChat = async () => {
    console.log("Verbindung wird aufgebaut...");
    try {
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`https://localhost:7100/hubs/chat`)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      //Empfange Nachrichten
      hubConnection.on(
        "ReceiveMessage",
        (sender, receivedMessage, timestamp) => {
          console.log("Nachricht empfangen:", {
            sender,
            receivedMessage,
            timestamp,
          });
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender, receivedMessage: receivedMessage, timestamp },
          ]);
        }
      );

      //Alte Nachrichten laden
      hubConnection.on("LoadMessages", (loadedMessages) => {
        console.log("Nachrichten geladen:", loadedMessages);
        setMessages(loadedMessages);
      });

      await hubConnection.start();
      console.log("Verbindung erfolgreich hergestellt.");
      await hubConnection.invoke(
        "JoinChatRoom",
        user.id,
        chatRoomId,
        password || null
      );
      setConnection(hubConnection);
      setLoading(false);
    } catch (error) {
      console.error("Fehler beim Verbinden zu SignalR:", error);
    }
  };

  //Verbindung nur einmal aufbauen, wenn Komponente gerendet wird --> useEffect
  useEffect(() => {
    //Falls connection besteht, return
    if (connection) return;
    connectToChat();

    return () => {
      // Verbindung schließen, wenn die Komponente entladen wird
      if (connection) {
        connection.stop();
        console.log("Verbindung geschlossen.");
      }
    };
  }, []);

  // Nachricht senden
  const sendMessage = async () => {
    if (!message.trim() || !connection) return;

    try {
      await connection.invoke("SendMessage", user.id, chatRoomId, message);
      setMessage("");
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
    }
  };

  // Chat verlassen
  const handleLeave = () => {
    if (connection) {
      connection.stop();
    }
    onLeave();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-500 text-white px-4 py-2">
        <h2 className="text-lg font-bold">{`ChatRoom ${chatRoomId}`}</h2>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition"
        >
          Leave
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              //Position on end if its from same user
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === user.username ? "items-end" : "items-start"
                }`}
              >
                <p className="text-sm font-bold text-gray-700">{msg.sender}</p>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.sender === user.username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.receivedMessage}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center bg-white p-4 border-t">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={sendMessage}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
