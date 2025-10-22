const MessageService=require('../services/message.service')
export async function messageHistory(req,res){
   const {senderID,receiverID}=req.params;
   const messages = await MessageService.getMessages(senderID,receiverID);
   res.json(messages)
}