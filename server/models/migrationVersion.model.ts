import {Schema, model} from "mongoose";

const migrationVersionSchema = new Schema({
    version: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    lastRun: {
        type: Date,
        default: Date.now 
    },
});
const MigrationVersion = model("MigrationVersion", migrationVersionSchema);

export default MigrationVersion;