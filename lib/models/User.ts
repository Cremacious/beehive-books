import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  books: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

const User = models?.User || model('User', UserSchema);
export default User;
