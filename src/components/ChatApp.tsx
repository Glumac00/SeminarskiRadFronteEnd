import React, { useState, useEffect } from "react";

type Message = {
  id: number;
  sender: string;
  content: string;
};

type User = {
  id: number;
  name: string;
};

type MessageProps = {
  messages: Message[];
};

type SendMessageProps = {
  sendMessage: (content: string) => void;
  currentUser: User;
};

const MessageList = ({ messages }: MessageProps) => {
  return (
    <div className="MessageBox__wrapper">
      <h2 className="MessageBox__title">Messages</h2>
      <ul className="MessageBox__list">
        {messages.map((message) => (
          <li className="MessageBox__list__item" key={message.id}>
            <strong>{message.sender}: </strong>
            {message.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

const SendMessage = ({ sendMessage, currentUser }: SendMessageProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() !== "") {
      sendMessage(content);
      setContent("");
    }
  };

  return (
    <div>
      <h2>Send Message as {currentUser.name}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users] = useState<User[]>([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
  ]);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:3001/messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setCurrentUser(users[0]);
      localStorage.setItem("currentUser", JSON.stringify(users[0]));
    }

    const drone = new Scaledrone("U4n5pfrc4G7B0Ud5");

    drone.on("open", () => {
      console.log("Beep boop scaledrone connected beep");
    });

    drone.on("message", (message: {
      member: { clientData: { username: any } };
      data: any;
    }) => {
      const newMessage: Message = {
        id: Date.now(),
        sender: message.member.clientData.username,
        content: message.data,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      drone.close();
    };
  }, []);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      sender: currentUser.name,
      content: content,
    };
    setMessages((prevMessages) => [...prevMessages,
    newMessage]);

    // Send message via Scaledrone
    const drone = new Scaledrone("U4n5pfrc4G7B0Ud5");
    if (drone) {
      drone.publish({
        room: "observable-room",
        message: content,
      });
    }
  };

  return (
    <div className="Container">
      <h1 className="Container__title">Messaging App</h1>
      <MessageList messages={messages} />
      <SendMessage sendMessage={handleSendMessage} currentUser={currentUser} />
    </div>
  );
};

export default ChatApp;