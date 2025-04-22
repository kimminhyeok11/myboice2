import mongoose, { Schema, models, model } from 'mongoose';

const ReportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Report || model('Report', ReportSchema);
