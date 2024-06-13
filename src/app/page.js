"use client";
import { useEffect, useState } from 'react';
import { db, auth, signInWithGoogle, logOut } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { sendPushNotificationToAll } from './sendNotification'; // Importing the function
import Header from './components/header';

export default function Home() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        sendUserDataToDatabase(user);
        requestNotificationPermission(); // Request notification permission on sign-in

      }
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

  const handleSendMessage =  (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;


    addDoc(collection(db, 'messages'), {
      text: newMessage,
      timestamp: serverTimestamp(),
      user: user.displayName,
      uid: user.uid,
    });

    setNewMessage('');
    // Send a broadcast notification to all users
    //  sendPushNotificationToAll(newMessage); // Using sendPushNotificationToAll function
  };

  const sendUserDataToDatabase = (userData) => {
    const { uid, displayName, email } = userData;
    const userRef = doc(db, 'users', uid);
    try {
      setDoc(userRef, {
        displayName,
        email,
      });

      // Subscribe the user to the "all_users" topic
      subscribeToTopic(uid, 'all_users');
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  };

  const subscribeToTopic =  (userId, topic) => {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    try {
      setDoc(subscriptionRef, {
        [topic]: true,
      }, { merge: true }); // Merge to update existing subscriptions
      console.log(`Subscribed user ${userId} to topic ${topic}`);
    } catch (error) {
      console.error('Error subscribing user:', error);
    }
  };


  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      }).catch((error) => {
        console.error('Error requesting notification permission:', error);
      });
    } else {
      console.log('This browser does not support notifications.');
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
                <span className={`${message.uid === user.uid ? 'hidden' : ''} text-white pr-2`}>{message.user}</span>
                <span className={`${message.uid === user.uid ? 'bg-[#17B67C] myMessage' : 'bg-[#1A1827] otherMessage'} text-white p-3 rounded-lg message`}>{message.text}</span>
                <span className={`${message.uid === user.uid ? 'pt-4' : ''} timestamp`}>{new Date(message.timestamp?.toDate()).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className='inputForm'>
            <input
              className='messageInput'
              type='text'
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Type a message'
            />
            <button type='submit' className='sendButton'>Send</button>
          </form>
        </div>
      ) : (
        <div className='flex justify-center items-center mt-auto mb-auto'>
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}
