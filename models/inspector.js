const mongoose = require('mongoose');
import InspectorSchema from "./schemas/inspector";

export default mongoose.model("Inspector", InspectorSchema);