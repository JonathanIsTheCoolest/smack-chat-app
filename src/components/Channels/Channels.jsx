import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import Modal from "../Modal/Modal";
import { toCamelCase } from "../../helpers/camelCase";
import './Channels.css';

const Channels = ({ unread }) => {
  const INIT = { name: '', description: '' };
  const [channels, setChannels] = useState([]);
  const [unreadChannels, setUnreadChannels] = useState([]);
  const [newChannel, setNewChannel] = useState(INIT);
  const [modal, setModal] = useState(false);
  const [chIsHovered, setChIsHovered] = useState(false);
  const [hoveredChannel, setHoveredChannel] = useState('');
  const [deleteChModal, setDeleteChModal] = useState(false);
  const { authService, chatService, socketService, appSetChannel, appSelectedChannel } = useContext(UserContext);

  useEffect(() => {
    setUnreadChannels(unread);
  }, [unread]);

  useEffect(() => {
    chatService.findAllChannels().then((res) => {
      setChannels(res);
      appSetChannel(res[0])
    })
  }, []);

  useEffect(() => {
    socketService.getChannel((channelList) => {
      setChannels(channelList);
      appSetChannel(channelList[channelList.length - 1]);
      console.log('channel added');
    })
  }, []);

  useEffect(() => {
    socketService.removeChannel((channelList) => {
      setChannels(channelList);
      appSetChannel(channelList[channelList.length - 1]);
      console.log('channel removed');
    })
  }, []);

  const selectChannel = (channel) => () => {
    appSetChannel(channel);
    const unread = chatService.setUnreadChannels(channel);
    setUnreadChannels(unread);
  }

  const onChange = ({ target: {name, value} }) => {
    setNewChannel({...newChannel, [name]: value});
  }

  const onMouseEnter = (channel) => () => {
    setChIsHovered(true);
    setHoveredChannel(channel);
  }

  const onMouseLeave = () => {
    setChIsHovered(false);
    setHoveredChannel('')
  }

  const onClickOpenDeleteChannelModal = () => {
    setDeleteChModal(true)
  }

  const createChannel = (e) => {
    e.preventDefault();
    const camelChannel = toCamelCase(newChannel.name)
    socketService.addChannel(camelChannel, newChannel.description);
    setNewChannel(INIT);
    setModal(false);
  }

  const deleteChannel = () => {
    setDeleteChModal(false);
    const { messages, deleteMessageDB } = chatService;
    const { id } = appSelectedChannel;
    const deleteMessages = () => messages.map((item) => (
      deleteMessageDB(item.id, authService.bearerHeader)
    ))
    socketService.deleteChannel(id, deleteMessages);
    deleteMessages();
  }

  return (
    <>
      <div className="channel-container">
        <div className="channel-header">
          <h3 className="channel-label">{authService.name}</h3>
        </div>
        <h3 className="channel-label">Channels <span onClick={() => setModal(true)}>Add +</span></h3>
        <div className="channel-list">
          {
            !!channels.length ?
            channels.map((channel) => (
              <div 
                key={channel.id} 
                onClick={selectChannel(channel)} 
                onMouseEnter={onMouseEnter(channel.id)}
                onMouseLeave={onMouseLeave}
                className={`channel-label ${unreadChannels.includes(channel.id) ? 'unread' : ''}`}
              >
                <div className={`inner ${(appSelectedChannel && (appSelectedChannel.id === channel.id) ? 'selected' : '')}`}>
                  #{channel.name}
                </div>
                {chIsHovered && (hoveredChannel === channel.id) ? <input type="submit" value="delete" className="ch-delete-btn" onClick={onClickOpenDeleteChannelModal}/> : null}
              </div>
            )) :
            <div>No Channels. Please add a channel</div>
          }
        </div>
      </div>
      <Modal title="Create Channel" isOpen={modal} close={setModal}>
          <form className="form channel-form" onSubmit={createChannel}>
            <input onChange={onChange} type="text" className="form-control" name="name" placeholder="enter channel name" />
            <input onChange={onChange} type="text" className="form-control" name="description" placeholder="enter channel description" />
            <input type="submit" className="submit-btn" value="Create Channel" />
          </form>
      </Modal>
      <Modal title="Delete Channel" isOpen={deleteChModal} close={setDeleteChModal}>
        <div>Deleting this Channel will also delete all of its messages. Are you sure want to continue?</div>
        <form className="form channel-form" onSubmit={(e) => e.preventDefault()}>
          <input onClick={deleteChannel} type="submit" className="delete-btn delete-modal-btns" value="Yes" />
          <input onClick={() => setDeleteChModal(false)} type="submit" className="go-back-btn delete-modal-btns" value="No" />
        </form>
      </Modal>
    </>
  )
}

export default Channels;