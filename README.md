<!-- Start Updates -->
Updates

smack-chat-app
  src
    services.js
      17-18 -Updated Constants
      User
        24 -Added accountId to User constructor
        49-51 -setAccountId()
      AuthService
        120 -findAccountByEmail()
        127-160 -authenticateUser(), updateUser(), updateAccount()
        174-204 -findAccountByEmail(), deleteUser(), deleteAccount()
      ChatService
        221-225 -deleteChannel()
        231-235 -deleteMessage()
        288-297 -deleteMessageDB()
      SocketService
        320-322 -deleteChannel()
        333-339 -removeChannel()
        348-373 -updateMessage(), replaceMessage(), deleteMessage(), removeMessage()
    components
      UserCreate
        -updated a lot. UserCreate component now funcitons both to create the user and also to update the users information.
      Modal
        6-13 -closeModal()
      ChatApp
        -added additional useState()'s for keeping track of Modal States and User credetials to Authorize user Deletion
        57-77 submitDelete
        implemented new logic in return() to handle Modal rendering.
      Channels
        13-15 -new useState()'s for getting hovered channel and Modal state
        37-43 -new useEffect() to listen for removed channel
        51-67 -onMouseEnter(), onMouseLeave(), onClickOpenDeleteChannelModal
        77-86 -deleteChannel()
        -added additional logic in return() to handle hover and Modals
      Chats
        14-17 -new useState()'s for getting hovered message, message appearence, and updating messageBody
        49-63 -new useEffects()'s that listen for removed and replaced messages
        91-111 -deleteMessage(), editMessage(), onMouseEnter(), onMouseLeave()
        -added additional logic in return() to handle hover edit and delete messages

IMPORTANT! PLEASE ADD THE FOLLOWING TO THE mac-chat-api
mac-chat-api
  src
    controller
    
      account.js
        -Update Account Email
          // '/v1/account/:id' -Update
          api.put('/:id', authenticate, (req, res) => {
            Account.findById(req.params.id, (err, account) => {
              if (err) {
                res.status(500).json({ message: err });
              }
              account.username = req.body.username;
              account.save(err => {
                if (err) {
                  res.status(500).json({ message: err });
                }
                res.status(200).json({ message: 'Account info updated' });
              });
            });
          })
        -Delete Account via Email
          // '/v1/account/:email' -Delete
          api.delete('/:email', authenticate, (req, res) => {
            Account.remove({
              username: req.params.email
            }, (err, user) => {
              if (err) {
                res.status(500).json({ message: err });
              }
              res.status(200).json({ message: 'Account Successfully Removed'});
            });
          })

      channels.js
        -Delete Channel
          // '/vq/channel/:id' -Delete
          api.delete('/:id', authenticate, (req, res) => {
            Channel.remove({
              _id: req.params.id
            }, (err, channel) => {
              if (err) {
                res.status(500).json({ message: err });
              }
              res.status(200).json({ message: 'Channel Successfully Removed'});
            });
          });

      message.js
        -Delete Message
          // '/vq/message/:id' -Delete
          api.delete('/:id', authenticate, (req, res) => {
            Message.remove({
              _id: req.params.id
            }, (err, message) => {
              if (err) {
                res.status(500).json({ message: err });
              }
              res.status(200).json({ message: 'Message Successfully Removed'});
            });
          });

      user.js
        -Update User
          // '/v1/user/:id' - Update
          api.put('/:id', authenticate, (req, res) => {
            User.findById(req.params.id, (err, user) => {
              if (err) {
                res.status(500).json({ message: err });
              }
              user.name = req.body.name;
              user.email = req.body.email;
              user.avatarName = req.body.avatarName;
              user.avatarColor = req.body.avatarColor;
              user.save(err => {
                if (err) {
                  res.status(500).json({ message: err });
                }
                res.status(200).json({ message: 'User info updated' });
              });
            });
          });
        -Delete User
          // '/vq/user/:id' -Delete
          api.delete('/:id', authenticate, (req, res) => {
            User.remove({
              _id: req.params.id
            }, (err, user) => {
              if (err) {
                res.status(500).json({ message: err });
              }
              res.status(200).json({ message: 'User Successfully Removed'});
            });
          });

    index.js
      -Socket Delete Channel
        //Listens for deleted channel
        client.on('deleteChannel', function(channelId, cb) {
          Channel.remove({
            _id: channelId
          }, (err, channel) => {
            if (err) {
              console.log('delete channel failed');
            }
            console.log('delete channel was successful');
            cb();
            io.emit('channelDeleted', channelId);
          });
        })
      -Socket Update Message
        // Update message
        client.on('updateMessage', function(message, newMessage) {
          console.log(newMessage);
          Message.findById(message.id, (err, msg) => {
            if (err) {
              console.log('error finding message')
            }
            msg.messageBody = newMessage;
            msg.userId = message.userId;
            msg.channelId = message.channelId;
            msg.userName = message.userName;
            msg.userAvatar = message.userAvatar;
            msg.userAvatarColor = message.userAvatarColor;
        
            msg.save(err => {
              if (err) {
                console.log('error updating message')
              }
              console.log('mesage successfully updated')
              io.emit('messageUpdated', msg.messageBody, msg.userId, msg.channelId, msg.userName, msg.userAvatar, msg.userAvatarColor, msg.id, msg.timeStamp)
            });
          });
        })
      -Socket Delete Message
        //Listens for deleted messages
        client.on('deleteMessage', function(messageId) {
          Message.remove({
            _id: messageId
          }, (err, message) => {
            if (err) {
              console.log('delete message failed');
            }
            console.log('delete message was successful');
            io.emit('messageDeleted', messageId);
          });
        });
<!-- End Updates -->
