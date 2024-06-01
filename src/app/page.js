// src/app/chat/page.js
'use client';

import { useEffect, useState } from 'react';
import { db, auth, signInWithGoogle, logOut } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log('newMessage state has changed, input field should re-render');
  }, [newMessage]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;
    console.log(newMessage)
    addDoc(collection(db, 'messages'), {
      text: newMessage,
      timestamp: new Date(),
      user: user.displayName,
    });
    setNewMessage('');
    console.log(newMessage)
  };

  return (
    <div>
      <h1>Real-Time Chat</h1>
      {user ? (
        <div>
          <button onClick={logOut}>Logout</button>
          <div>
            {messages.map((message) => (
              <div key={message.id}>
                <span>{message.user}: {message.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage}>
            <input
              className='message'
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}
