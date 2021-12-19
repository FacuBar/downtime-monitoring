import mongoose, { Types } from 'mongoose';

interface ReportAttrs {
  website: string;
  result: {
    httpStatus: number;
  };
}

interface ReportDoc extends mongoose.Document {
  issued: Date;
  website: Types.ObjectId;
  result: {
    httpStatus: number;
  };
}

interface ReportModel extends mongoose.Model<ReportDoc> {
  build(attrs: ReportAttrs): ReportDoc;
}

const reportSchema = new mongoose.Schema<ReportDoc, ReportModel>({
  issued: {
    type: Date,
    default: () => new Date(),
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    index: true,
  },
  result: {
    httpStatus: {
      required: true,
      type: Number,
    },
    response: {
      type: String,
    },
  },
});

reportSchema.statics.build = (attrs: ReportAttrs) => {
  return new Report(attrs);
};

const Report = mongoose.model<ReportDoc, ReportModel>('Report', reportSchema);

export { Report };
