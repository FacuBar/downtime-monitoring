import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    notify: {
      type: Boolean,
      default: true,
    },
    notifyTo: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export { websiteSchema };
