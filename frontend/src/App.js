import { useState } from "react";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

const App = () => {
  const [user, setUser] = useState(null); // { id, username }
  const [chatRoom, setChatRoom] = useState(null); // {name, chatRoomId}
  const [chatRoomPassword, setChatRoomPassword] = useState(null);

  const logout = () => {
    setUser(null);
    setChatRoom(null);
  };

  return !user ? (
    //If no user defined
    <Auth onAuthSuccess={setUser} />
  ) : chatRoom ? (
    //if ChatRoom defined
    <ChatRoom
      chatRoom={chatRoom}
      user={user}
      password={chatRoomPassword}
      onLeave={() => setChatRoom(null)}
    />
  ) : (
    //if chatRoom undefined
    <ChatList
      userId={user.id}
      setChatRoom={setChatRoom}
      onLogout={logout}
      setChatRoomPassword={setChatRoomPassword}
    />
  );
};

export default App;
