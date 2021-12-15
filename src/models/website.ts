import mongoose from 'mongoose';

interface WebsiteAttrs {
  url: string;
  owner: string;
  notify?: boolean;
}

interface WebsiteModel extends mongoose.Model<WebsiteDoc> {
  build(attrs: WebsiteAttrs): WebsiteDoc;
}

interface WebsiteDoc extends mongoose.Document {
  url: string;
  owner: string;
  notify: boolean;
  createadAt: Date;
}

const websiteSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notify: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

websiteSchema.statics.build = (attrs: WebsiteAttrs) => {
  return new Website(attrs);
};

const Website = mongoose.model<WebsiteDoc, WebsiteModel>(
  'Website',
  websiteSchema
);

export { Website };
