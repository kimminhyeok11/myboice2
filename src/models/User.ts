import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  isBanned: { type: Boolean, default: false },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export default models.User || model('User', UserSchema);
