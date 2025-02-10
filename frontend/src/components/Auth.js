import { useState } from "react";

//Login and Registration
const Auth = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //Default Value log in
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    // Eingaben prüfen
    if (!username.trim() || !password.trim()) {
      setError("Benutzername und Passwort dürfen nicht leer sein.");
      return;
    }

    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`https://localhost:7100${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Fehler bei der Anmeldung/Registrierung"
        );
      }

      if (!data.userId || !data.username) {
        throw new Error("Fehler: Ungültige Benutzerinformationen.");
      }

      //Setze State in Parent Component mit UserId & Username
      onAuthSuccess({ id: data.userId, username: data.username });
    } catch (err) {
      //Definierter Error vom Try-block ausgeben
      setError(err.message || "Ein unbekannter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Registrieren"}
        </h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          disabled={!username || !password || loading}
          className={`w-full py-2 px-4 rounded transition ${
            loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? "Lädt..." : isLogin ? "Login" : "Registrieren"}
        </button>
        <p className="text-center mt-4">
          {isLogin ? "Noch kein Account?" : "Schon registriert?"}{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Registrieren" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
