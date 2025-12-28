import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../services/socket";
import { createAESKey, aesEncrypt, aesDecrypt } from "../services/crypto";

export default function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const socketRef = useRef(null);
  const keyRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) socket.connect();

    (async () => {
      const aesKey = await createAESKey(roomId);
      keyRef.current = aesKey;

      socket.emit("join-room", roomId, (res) => {
        if (!res.success) alert(res.message);
      });
    })();

    socket.on("receive-message", async (payload) => {
      if (!keyRef.current) return;
      const text = await aesDecrypt(payload, keyRef.current);
      setMessages((prev) => [...prev, { text, fromMe: false }]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [roomId]);

  const sendMessage = async () => {
    if (!input || !keyRef.current) return;

    const encrypted = await aesEncrypt(input, keyRef.current);
    socketRef.current.emit("send-message", encrypted);

    setMessages((prev) => [...prev, { text: input, fromMe: true }]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">Room: {roomId}</header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded max-w-xs ${
              m.fromMe ? "bg-blue-500 text-white ml-auto" : "bg-gray-300"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex p-4 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border px-3 py-2"
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
}
