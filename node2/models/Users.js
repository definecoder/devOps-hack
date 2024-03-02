const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    posts: [
      {
        content: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UsersSchema);
