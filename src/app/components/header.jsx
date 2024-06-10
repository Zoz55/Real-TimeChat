import React from 'react'
import {logOut } from '../firebase';

const header = ({ user }) => {
  return (
    <div className='flex flex-row justify-between px-5 '>
      <h1 className="text-center text-white text-[25px]">Elites Chat</h1>
      {user ? <button onClick={logOut} className='logoutButton'>Logout</button> : null}
    </div>
  )
}

export default header