import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null); // Speichert { id, username }
  const [chatRoom, setChatRoom] = useState(null); // Speichert {name, chatRoomId}

  const logout = () => {
    setUser(null);
    setChatRoom(null);
  };

  return !user ? (
    //Falls user nicht defined
    <Auth onAuthSuccess={setUser} />
  ) : chatRoom ? (
    //Falls Chatroom definiert
    <ChatRoom
      chatRoomId={chatRoom.chatRoomId}
      user={user}
      password={undefined} //TODO aus chatlist rausziehen
      onLeave={() => setChatRoom(null)}
    />
  ) : (
    //Falls kein Chatroom definiert
    <ChatList userId={user.id} setChatRoom={setChatRoom} onLogout={logout} />
  );
};

export default App;
