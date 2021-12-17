import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import { websiteSchema } from './website';

interface UserAttrs {
  name: string;
  email: string;
  password: string;
}

interface WebsiteAttrs {
  url: string;
  notifyTo: string;
  notify?: boolean;
}

interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  websites: mongoose.Types.DocumentArray<WebsiteAttrs & mongoose.Document>;

  addWebsite: (attrs: WebsiteAttrs) => void;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema<UserDoc, UserModel>(
  {
    name: {
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
    websites: [websiteSchema],
  },
  {
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await hash(this.get('password'), 10);
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userSchema.methods.addWebsite = async function (attrs: WebsiteAttrs) {
  this.websites.push(attrs);
  return;
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User, UserDoc };
