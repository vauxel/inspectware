const mongoose = require('mongoose');
import AccountSchema from "./schemas/account";

export default mongoose.model("Account", AccountSchema);