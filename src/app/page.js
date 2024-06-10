// src/app/chat/page.js
'use client';
import { pacifico } from './fonts'
import { useEffect, useState } from 'react';
import { db, auth, signInWithGoogle, logOut } from './firebase';
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
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;
    addDoc(collection(db, 'messages'), {
      text: newMessage,
      timestamp: new Date(),
      user: user.displayName,
      uid: user.uid,  // Save user ID to track messages
    });
    setNewMessage('');

  };

  return (
    <div className='container min-h-screen'> 

    <Header user={user} />
      {user ? (
        <div >
          <div className='chatWindow max-h-[80vh] px-5'>
            {messages.map((message) => (
              <div key={message.id} className={`${message.uid === user.uid ? 'text-right' : ''} mb-2`}>
              {/* <div key={message.id} className={`${message.uid === user.uid ? 'myMessage bg-[#17B67C]' : 'otherMessage bg-[#1A1827]'} block mb-2`}> */}
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
