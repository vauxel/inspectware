const mongoose = require('mongoose');
import InspectionSchema from "./schemas/inspection";

export default mongoose.model("Inspection", InspectionSchema);
