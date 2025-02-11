import { useState } from "react";
import axios from "axios";

//Login and Registration
const Auth = ({ onAuthSuccess }) => {
  const [givenUsername, setGivenUsername] = useState("");
  const [password, setPassword] = useState("");
  //Default Value log in
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    // Check Values
    if (!givenUsername.trim() || !password.trim()) {
      setErrorMessage("Benutzername und Passwort dürfen nicht leer sein.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await axios.post(`https://localhost:7100${endpoint}`, {
        Username: givenUsername,
        Password: password,
      });

      const { userId } = response?.data;

      onAuthSuccess({ id: userId, username: givenUsername });
    } catch (error) {
      console.error("Error:", error);

      // Show Error from Backend
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage("Login/Registration error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h1>
        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}
        <input
          type="text"
          placeholder="Username"
          value={givenUsername}
          onChange={(e) => setGivenUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-blue-500"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-blue-500"
        />
        <button
          onClick={handleAuth}
          disabled={!givenUsername.trim() || !password.trim() || loading}
          className={`w-full py-2 px-4 rounded transition ${
            loading || !givenUsername.trim() || !password.trim()
              ? "bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
        <p className="text-center mt-4">
          {isLogin ? "No Account?" : "Already registered?"}{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
