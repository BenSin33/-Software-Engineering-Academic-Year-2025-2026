const {Router} = require('express');
const messageRouter= Router();
const messageController= require('../controllers/message.controller')
messageRouter.get('/:senderID/:receiverID',messageController.messageHistory)