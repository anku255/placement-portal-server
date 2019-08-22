const mongoose = require('mongoose');

const { Schema } = mongoose;

const noticeSchema = new Schema({
  content_md: { type: String, required: true },
  content_html: { type: String, required: true },
  deadline: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

mongoose.model('notices', noticeSchema);
