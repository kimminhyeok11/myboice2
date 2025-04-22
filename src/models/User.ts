import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  avatar: { type: String },
  password: { type: String }, // for local auth
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default models.User || model('User', UserSchema);
