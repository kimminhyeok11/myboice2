import mongoose, { Schema, models, model } from 'mongoose';

delete mongoose.models.Message;

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  audioUrl: { type: String }, // 음성 메시지일 때만
  text: { type: String, maxlength: 100 }, // 텍스트 메시지일 때만
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' }, // 답장일 경우 원본 메시지
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
}, { timestamps: true });

export default models.Message || model('Message', MessageSchema);
