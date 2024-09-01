import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'premium'],
      default: 'user',
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'carts',
      required: false,
    },
    resetToken: {
      token: String,
      expire: Date,
    },
  },
  { collection: 'users' }
);

const UserModel = mongoose.model('users', userSchema);

export { UserModel, userSchema };
