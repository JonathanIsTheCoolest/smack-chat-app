import axios from "axios";
import io from 'socket.io-client';

const BASE_URL = "http://localhost:3005/v1";
const URL_ACCOUNT = `${BASE_URL}/account`;
const URL_LOGIN = `${URL_ACCOUNT}/login`;
const URL_REGISTER = `${URL_ACCOUNT}/register`;

const URL_USER = `${BASE_URL}/user`;
const URL_USER_ADD = `${URL_USER}/add`;
const URL_USER_BY_EMAIL = `${URL_USER}/byEmail/`;

const URL_ACCOUNT_BY_EMAIL = `${URL_ACCOUNT}/byEmail/`;

const URL_GET_CHANNELS = `${BASE_URL}/channel`;

const URL_MESSAGE = `${BASE_URL}/message`;
const URL_GET_MESSAGES = `${URL_MESSAGE}/byChannel/`;

const headers = { "Content-Type": "application/json" };

class User {
  constructor() {
    this.accountId = "";
    this.id = "";
    this.name = "";
    this.email = "";
    this.avatarName = "./smack_chat_assets/avatarDefault.png";
    this.avatarColor = "";
    this.isLoggedIn = false;
  }

  setUserEmail(email) {
    this.email = email;
  }
  setIsLoggedIn(loggedIn) {
    this.isLoggedIn = loggedIn;
  }

  setUserData(userData) {
    const { _id, name, email, avatarName, avatarColor } = userData;
    this.id = _id;
    this.name = name;
    this.email = email;
    this.avatarName = avatarName;
    this.avatarColor = avatarColor;
  }

  setAccountId(accountId) {
    this.accountId = accountId;
  }
}

export class AuthService extends User {
  constructor() {
    super();
    this.authToken = "";
    this.bearerHeader = {};
  }

  logoutUser() {
    this.id = "";
    this.name = "";
    this.email = "";
    this.avatarName = "";
    this.avatarColor = "";
    this.isLoggedIn = false;
    this.authToken = "";
    this.bearerHeader = {};
  }

  setAuthToken(token) {
    this.authToken = token;
  }
  setBearerHeader(token) {
    this.bearerHeader = {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    };
  }

  getBearerHeader = () => this.bearerHeader;

  async registerUser(email, password) {
    const body = { "email": email.toLowerCase(), "password": password}
    try {
      await axios.post(URL_REGISTER, body);
    } catch(error) {
      console.error(error);
      throw error;
    }
  }

  async createUser(name, email, avatarName, avatarColor) {
    const headers = this.getBearerHeader();
    const body = {
      "name": name,
      "email": email,
      "avatarName": avatarName,
      "avatarColor": avatarColor,
    }
    try {
      const response = await axios.post(URL_USER_ADD, body, { headers });
      this.setUserData(response.data);
    } catch(error) {
      console.error(error);
      throw error;
    }
  }

  async loginUser(email, password) {
    const body = { email: email.toLowerCase(), password: password };
    try {
      const response = await axios.post(URL_LOGIN, body, { headers });
      this.setAuthToken(response.data.token);
      this.setBearerHeader(response.data.token);
      this.setUserEmail(response.data.user);
      this.setIsLoggedIn(true);
      await this.findUserByEmail();
      await this.findAccountByEmail();
    } catch (error) {
      console.error(error);
		  throw error;
    }
  }

  async authenticateUser(email, password) {
    const body = { email: email.toLowerCase(), password: password };
    try {
      const response = await axios.post(URL_LOGIN, body, { headers });
      return response;
    } catch (error) {
      console.error(error);
		  throw error;
    }
  }

  async updateUser(userObject) {
    const headers = this.getBearerHeader();
    const body = userObject;
    try {
      const response = await axios.put(`${URL_USER}/${this.id}`, body, { headers });
      console.log(response);
    } catch (error) {
      console.error(error);
		  throw error;
    }
  }

  async updateAccount(email) {
    const headers = this.getBearerHeader();
    const body = email;
    try {
      const response = await axios.put(`${URL_ACCOUNT}/${this.accountId}`, body, { headers });
      console.log(response);
    } catch (error) {
      console.error(error);
		  throw error;
    }
  }

  async findUserByEmail() {
    const headers = this.getBearerHeader();
    try {
      const response = await axios.get(URL_USER_BY_EMAIL + this.email, {
        headers,
      });
      this.setUserData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async findAccountByEmail() {
    const headers = this.getBearerHeader();
    try {
      const response = await axios.get(URL_ACCOUNT_BY_EMAIL + this.email, {
        headers,
      });
      this.setAccountId(response.data._id);
    } catch (error) {
      console.error(error);
    }
  }

  async deleteUser() {
    const headers = this.getBearerHeader();
    try {
      const response = await axios.delete(`${URL_USER}/${this.id}`, { headers });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  async deleteAccount() {
    const headers = this.getBearerHeader();
    try {
      const response = await axios.delete(`${URL_ACCOUNT}/${this.email}`, { headers });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
}

export class ChatService {
  constructor(authHeader) {
    this.getAuthHeader = authHeader;
    this.channels = [];
    this.selectedChannel = {};
    this.unreadChannels = [];
    this.messages = [];
  }

  addChannel = (channel) => {
      if (!this.channels.length ||(this.channels[this.channels.length - 1].id !== channel.id)) {
        this.channels.push(channel)
      }
  };
  deleteChannel = (channelId) => {
    this.channels.map((item, index) => (
      item.id === channelId ? this.channels.splice(index, 1) : null
    ))
  }
  addMessage = (chat) => {
      if (!this.messages.length || (this.messages[this.messages.length - 1].id !== chat.id)) {
        this.messages.push(chat)
      }
  };
  deleteMessage = (messageId) => {
    this.messages.map((item, index) => (
      item.id === messageId ? this.messages.splice(index, 1) : null
    ))
  }
  setSelectedChannel = (channel) => this.selectedChannel = channel;
  getSelectedChannel = () => this.selectedChannel;
  getAllChannels = () => this.channels;

  addToUnread = (urc) => this.unreadChannels.push(urc);

  setUnreadChannels = (channel) => {
    if (this.unreadChannels.includes(channel.id)) {
      this.unreadChannels = this.unreadChannels.filter(ch => ch !== channel.id);
    }
    return this.unreadChannels;
  }

  async findAllChannels() {
    const headers = this.getAuthHeader();
    try {
      let response = await axios.get(URL_GET_CHANNELS, { headers })
      response = response.data.map((channel) => ({
        name: channel.name,
        description: channel.description,
        id: channel._id,
      }));
      this.channels = [...response];
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAllMessagesForChannel(channelId) {
    const headers = this.getAuthHeader();
    try {
      let response = await axios.get(URL_GET_MESSAGES + channelId, { headers });
      response = response.data.map((msg) => ({
        messageBody: msg.messageBody,
        channelId: msg.channelId,
        id: msg._id,
        userName: msg.userName,
        userAvatar: msg.userAvatar,
        userAvatarColor: msg.userAvatarColor,
        timeStamp: msg.timeStamp,
      }));
      this.messages = response;
      return response;
    } catch(error) {
      console.error(error);
      this.messages = [];
      throw error;
    }
  }

  async findAllMessagesForUser(userId) {
    const headers = this.getAuthHeader();
    try {
      let response = await axios.get(`${URL_MESSAGE}/byUser/` + userId, { headers });
      response = response.data.map((msg) => ({
        id: msg._id,
        messageBody: msg.messageBody,
        userId: msg.userId,
        channelId: msg.channelId,
      }));
      this.messages = response;
      
      console.log(response);
      return response;
    } catch(error) {
      console.error(error);
      this.messages = [];
      throw error;
    }
  }

  async deleteMessageDB(messageId, auth) {
    const headers = auth;
    try{
      const response = await axios.delete(`${URL_MESSAGE}/${messageId}`, { headers });
      console.log(response);
    } catch(error) {
      console.error(error);
      throw error;
    }
  }
}

export class SocketService {
  socket = io('http://localhost:3005/');
  constructor(chatService) {
    this.chatService = chatService;
  }

  establishConnection() {
    console.log('client connect')
    this.socket.connect()
  }

  closeConnection() {
    console.log('client disconnect')
    this.socket.disconnect()
  }

  addChannel(name, description) {
    this.socket.emit('newChannel', name, description);
  }

  deleteChannel(channelId, cb) {
    this.socket.emit('deleteChannel', channelId, cb);
  }

  getChannel(cb) {
    this.socket.on('channelCreated', (name, description, id) => {
      const channel = {name, description, id};
      this.chatService.addChannel(channel);
      const channelList = this.chatService.getAllChannels();
      cb(channelList);
    })
  }

  removeChannel(cb) {
    this.socket.on('channelDeleted', channelId => {
      this.chatService.deleteChannel(channelId)
      const channelList = this.chatService.getAllChannels();
      cb(channelList);
    })
  }

  addMessage(messageBody, channelId, user) {
    const { userName, userId, userAvatar, userAvatarColor } = user;
    if (!!messageBody && !!channelId && !!user) {
      this.socket.emit('newMessage', messageBody, userId, channelId, userName, userAvatar, userAvatarColor);
    }
  }

  updateMessage(message, newMessage) {
    this.socket.emit('updateMessage', message, newMessage);
  }

  replaceMessage(cb) {
    this.socket.on('messageUpdated', () => {
      this.chatService.findAllMessagesForChannel(this.chatService.selectedChannel.id).then((response) => {
        cb(response);
      })
    })
  }

  async replaceAllUserMessages(userId, newMessage) {
    console.log(this.messages);
    await this.chatService.findAllMessagesForUser(userId).then((response) => {
      console.log(response);
      for (const message of response) {
        const newObject = ({...message, ...newMessage});
        this.updateMessage(message, newObject);
      }
    })
  }

  deleteMessage(messageId) {
    this.socket.emit('deleteMessage', messageId);
  }

  removeMessage(cb) {
    this.socket.on('messageDeleted', messageId => {
      this.chatService.deleteMessage(messageId)
      const messageList = this.chatService.messages;
      cb(messageList);
    })
  }

  getChatMessage(cb) {
    this.socket.on('messageCreated', (messageBody, userId, channelId, userName, userAvatar, userAvatarColor, id, timeStamp) => {
      const channel = this.chatService.getSelectedChannel();
      const chat = { messageBody, userId, channelId, userName, userAvatar, userAvatarColor, id, timeStamp };

      if (channelId !== channel.id && !this.chatService.unreadChannels.includes(channelId)) {
        this.chatService.addToUnread(channelId);
      }

      if (!this.chatService.messages.length ||(this.chatService.messages[this.chatService.messages.length - 1].id !== chat.id)) {
        this.chatService.messages = [...this.chatService.messages, chat];
      }
      cb(chat, this.chatService.messages);
    })
  }

  startTyping(userName, channelId) {
    this.socket.emit('startType', userName, channelId);
  }

  stopTyping(userName, channelId) {
    this.socket.emit('startType', userName);
  }

  getUserTyping(cb) {
    this.socket.on('userTypingUpdate', (typingUsers) => {
      cb(typingUsers)
    })
  }
}