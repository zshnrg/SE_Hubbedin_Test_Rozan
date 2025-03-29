import { db } from "../services/db.service.js";

const UserSchema = new db.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  timezone: {
    type: String,
    default: "UTC",
  },
});

const User = db.model("Users", UserSchema);

export default User;