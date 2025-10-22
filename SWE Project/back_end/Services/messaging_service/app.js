const express= require('express');
const app=express();
const messageRouter= require('./routes/messageRouter');

app.use(cors());
app.use(express.json());

app.use('/messages',messageRouter);
export default app;