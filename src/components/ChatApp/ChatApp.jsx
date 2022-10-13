import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from '../../App';
import Channels from "../Channels/Channels";
import Chats from "../Chats/Chats";
import Modal from "../Modal/Modal";
import UserAvatar from "../UserAvatar/UserAvatar";
import UserCreate from "../UserCreate/UserCreate";
import './ChatApp.css';

const INIT_DELETE_STATE = {
  email: '',
  password: '',
}

const ChatApp = () => {
  const { authService, socketService, chatService } = useContext(UserContext);
  const { name, email } = authService;
  const [modal, setModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadChannels, setUnreadChannels] = useState([]);
  const [isEditUser, setIsEditUser] = useState(false);
  const [isUserDelete, setIsUserDelete] = useState(false);
  const [yesDelete, setYesDelete] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(INIT_DELETE_STATE);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.establishConnection();
    return () => socketService.closeConnection();
  }, []);

  useEffect(() => {
    socketService.getChatMessage((newMessage, messages) => {
      if (newMessage.channelId === chatService.selectedChannel.id) {
        setChatMessages(messages);
      }
      if (chatService.unreadChannels.length) {
        setUnreadChannels(chatService.unreadChannels);
      }
    })
  }, []);

  const setDeleteState = ({ target: { name, value } }) => {
    setDeleteInfo({...deleteInfo, [name]: value});
  }

  const logoutUser = () => {
    authService.logoutUser()
    setModal(false);
    setIsEditUser(false);
    setIsUserDelete(false);
    setYesDelete(false);
    navigate('/');
  }

  const submitDelete = (e) => {
    e.preventDefault();
    const { password, email: deleteEmail } = deleteInfo;
    console.log(password, deleteEmail);
    if (!!email && !!password && email === deleteEmail) {
      authService.authenticateUser(email, password).then(() => {
        authService.deleteUser().then(() => {
          authService.deleteAccount().then(() => {
            // CLEAR STATE AND USER INFO
            logoutUser();
          }).catch((error) => {
            console.error('authenticating user', error.response.data);
          })
        }).catch((error) => {
          console.error('deleting user', error.response.data);
        })
      }).catch((error) => {
        console.error('deleting account', error.response.data);
      })
    }
  }
  return (
    <div className="chat-app">
      <nav>
        <h1>Smack Chat</h1>
        <div className="user-avatar" onClick={() => setModal(true)}>
          <UserAvatar size="sm" className="nav-avatar"/>
          <div>{name}</div>
        </div>
      </nav>
      <div className="smack-app">
        <Channels unread={unreadChannels}/>
        <Chats chats={chatMessages}/>
      </div>

      {
        !isUserDelete ?
        <Modal title={!isEditUser ? 'Profile' : 'Edit Profile'} isOpen={modal} close={()=> setModal(false)} setIsEditUser={setIsEditUser}>
          <button className="edit-btn" onClick={() => setIsEditUser(isEditUser ? false : true)}>{isEditUser ? 'Back To Profile' : 'Edit'}</button>
          {
            !isEditUser ?
            <>
              <div className="profile">
                <UserAvatar />
                <h4>Username: {name}</h4>
                <h4>Email: {email}</h4>
              </div>
              <button onClick={logoutUser} className="submit-btn logout-btn">Logout</button>
            </> :
            <>
              <div className="profile">
                <div>
                  <UserAvatar />
                  <h4>Current Username: {name}</h4>
                  <h4>Current Email: {email}</h4>
                </div>
                <hr />
                <UserCreate setParentModal={setModal} setIsEditUser={setIsEditUser}/>
              </div>
            </>
          }
          { isEditUser ? <div onClick={() => setIsUserDelete(true)} className="delete-account-txt">delete account</div> : null}
        </Modal> :
        <Modal title="Delete Account" isOpen={modal} close={() => {setIsUserDelete(false); setYesDelete(false);}}>
          {
            !yesDelete ?
            <>
              <div className="delete-text">Are you sure that you want to delete your account?</div>
              <button className="submit-btn" onClick={() => setYesDelete(true)}>YES</button>
            </> :
            <>
              <div className="delete-text">Please enter your email and password</div>
              <form onSubmit={submitDelete}>
                <input className="form-control delete-inputs" placeholder="enter email" type="text" onChange={setDeleteState} name="email" value={deleteInfo.email}/>
                <input className="form-control delete-inputs" placeholder="enter password" type="text" onChange={setDeleteState} name="password" value={deleteInfo.password}/>
                <input className="submit-btn logout-btn" type="submit" value="DELETE ACCOUNT"/>
              </form>
            </>
          }
        </Modal>
      }
    </div>
  )
}

export default ChatApp;