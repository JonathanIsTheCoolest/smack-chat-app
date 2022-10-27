import React, { useState, useEffect, useContext }  from 'react';
import { UserContext } from '../../App';
import UserAvatar from '../UserAvatar/UserAvatar';
import { formatDate } from '../../helpers/dateFormat';
import './Chats.css';


const Chats = ({ chats }) => {
  const { authService, chatService, appSelectedChannel, socketService } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState({});
  const [isMessageEdit, setisMessageEdit] = useState(false);
  const [tempMessage, setTempMessage] = useState('');

  useEffect(() => {
    setMessages(chats);
  }, [chats]);

  useEffect(() => {
    if (appSelectedChannel && !!appSelectedChannel.id) {
      chatService.findAllMessagesForChannel(appSelectedChannel.id)
      .then((res) => setMessages(res));
    }
  }, [appSelectedChannel]);

  useEffect(() => {
    socketService.getUserTyping((users) => {
      let names = '';
      let usersTyping = 0;
      for (const [typingUser, chId] of Object.entries(users)) {
        if (typingUser !== authService.name && appSelectedChannel.id === chId) {
          names = (names === '' ? typingUser : `${names}, ${typingUser}`);
          usersTyping += 1;
        }
      }
      if (usersTyping > 0) {
        const verb = (usersTyping > 1) ? 'are' : 'is';
        setTypingMessage(`${names} ${verb} typing a message...`);
      } else {
        setTypingMessage('');
      }
    })
  }, [appSelectedChannel])

  useEffect(() => {
    socketService.removeMessage((messageList) => {
      setMessages(messageList);
      setHoveredMessage({});
      console.log('message removed');
    });
  }, [])

  useEffect(() => {
    socketService.replaceMessage((messageList) => {
      setMessages(messageList);
      setHoveredMessage({});
      console.log('message updated');
    });
  }, [])

  const onTyping = ({target: { value }}) => {
    if (!value.length) {
      setIsTyping(false);
      socketService.stopTyping(authService.name);
    } else if (!isTyping) {
      socketService.startTyping(authService.name, appSelectedChannel.id);
    } else {
      setIsTyping(true);
    }
    setMessageBody(value)
  }

  const sendMessage = (e) => {
    e.preventDefault();
    const { name, id, avatarName, avatarColor } = authService;
    const user = {
      userName: name,
      userId: id,
      userAvatar: avatarName,
      userAvatarColor: avatarColor
    }
    socketService.addMessage(messageBody, appSelectedChannel.id, user);
    socketService.stopTyping(authService.name);
    setMessageBody('');
  }

  const deleteMessage = () => {
    socketService.deleteMessage(hoveredMessage.id);
  }

  const editMessage = () => {
    if (hoveredMessage.messageBody !== tempMessage) {
      const messageObject = { messageBody: tempMessage }
      socketService.updateMessage(hoveredMessage, messageObject);
    }
  }

  const onMouseEnter = (message) => () => {
    setIsHovered(true);
    setHoveredMessage(message);
  }

  const onMouseLeave = () => {
    setIsHovered(false);
    setisMessageEdit(false);
    setTempMessage('');
    setHoveredMessage({});
  }

  return (
    <div className="chat">
      <div className="chat-header">
        {
          appSelectedChannel ?
          <>
            <h3>#{appSelectedChannel.name} - </h3>
            <h4>{appSelectedChannel.description}</h4>
          </> :
          null
        }
      </div>
      <div className="chat-list">
      {!!messages.length ? messages.map((msg) => (
          <div onMouseEnter={onMouseEnter(msg)} onMouseLeave={onMouseLeave} key={msg.id} className="chat-message">
            <UserAvatar 
              avatar={{ 
                avatarName: msg.userAvatar, 
                avatarColor: msg.userAvatarColor 
              }} 
              size="md" 
            />
            <div className="chat-user">
              <div className="message-container">
                <strong>{msg.userName}</strong>
                <small>{formatDate(msg.timeStamp)}</small>
                {
                  isHovered && (msg.id === hoveredMessage.id) && (authService.name === msg.userName) ?
                  <div className="message-button-container">
                    {
                      !isMessageEdit ?
                      <>
                        <button onClick={deleteMessage} className="message-edit-btns">DELETE</button>
                        <button onClick={() => {setisMessageEdit(true); setTempMessage(msg.messageBody);}} className="message-edit-btns">EDIT</button>
                      </> :
                      <>
                        <button onClick={() => setisMessageEdit(false)} className="message-edit-btns">NEVERMIND</button>
                        <button onClick={editMessage} className="message-edit-btns">UPDATE MESSAGE</button>
                      </>
                    }
                  </div> :
                  null
                }
              </div>
              {
                isMessageEdit && (msg.id === hoveredMessage.id) ?
                <textarea
                  className="edit-message-textarea" 
                  onChange={({ target: { value } }) => setTempMessage(value)} 
                  value={tempMessage} 
                  placeholder="edit your message boy"
                /> :
                <div className="message-body">{msg.messageBody}</div>
              }
            </div>
          </div>
      )) : <div>No Messages</div>}

      </div>
      <form onSubmit={sendMessage} className="chat-bar">
        <div className="typing">{typingMessage}</div>
        <div className="chat-wrapper">
          <textarea 
            onChange={onTyping}
            value={messageBody}
            placeholder="type a message..."
          />
          <input type="submit" className="submit-btn" value="Send"/>
        </div>
      </form>
    </div>
  )
}

export default Chats;