// src/app/chat/page.js
'use client';
import { useEffect, useState } from 'react';
import { db, auth, signInWithGoogle, logOut, messaging } from './firebase'; // Import messaging from firebase
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Header from './components/header';

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

      // Notify user if new message from other user
      if (user) {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage.uid !== user.uid) {
          // Trigger push notification
          showNotification('New Message', latestMessage.text);
        }
      }
    });
    return () => unsubscribe();
  }, [user]); // Added user dependency

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      timestamp: new Date(),
      user: user.displayName,
      uid: user.uid,
    });
    setNewMessage('');
  };

  const showNotification = (title, body) => {
    // Check if the browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      // Trigger notification
      new Notification(title, { body });
    }
  };

  return (
    <div className='container min-h-screen'> 
      <Header user={user} />
      {user ? (
        <div>
          <div className='chatWindow max-h-[80vh] p-5'>
            {messages.map((message) => (
              <div key={message.id} className={`${message.uid === user.uid ? 'text-right' : ''} mb-2`}>
                <span className={`${message.uid === user.uid ? 'hidden' : ''} text-white pr-2`}>{message.user} </span>
                <span className={`${message.uid === user.uid ? 'bg-[#17B67C] myMessage' : 'bg-[#1A1827] otherMessage'} text-white p-3  rounded-lg message `}> {message.text}</span>
                <span className={`${message.uid === user.uid ? 'pt-4' : ''} timestamp`}>{new Date(message.timestamp?.toDate()).toLocaleTimeString()}</span>
            </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className='inputForm'>
            <input
              className='messageInput'
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button type="submit" className='sendButton'>Send</button>
          </form>
        </div>
      ) : (
        <div className='flex justify-center items-center mt-auto mb-auto'>
          <button onClick={signInWithGoogle} className=''>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}
