const mongoose = require('mongoose');
import ClientSchema from "./schemas/client";

export default mongoose.model("Client", ClientSchema);