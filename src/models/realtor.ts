const mongoose = require('mongoose');
import RealtorSchema from "./schemas/realtor";

export default mongoose.model("Realtor", RealtorSchema);
