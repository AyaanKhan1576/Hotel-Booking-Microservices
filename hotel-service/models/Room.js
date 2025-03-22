const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    
    roomno: { 
        type: String, 
        required: [true, "!Enetr Room Number!"]
    },
    
    type: { 
        type: String, 
        required: [true, "!Enetr Room Type!"],
        enum: ["Standard", "Deluxe", "Suite"] 
    },
   
    capacity: { 
        type: Number, 
        required: [true, "!Enetr Room Capacity!"],
        min: [1, "Capacity must be at least 1"] 
    },
   
    price: { 
        type: Number, 
        required: [true, "!Enetr Room Price!"],
        min: [0, "Valid Price"] 
    },
    
    amenities: [String],
   
    hotel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Hotel", 
        required: [true, "!Enetr Room Hotel!"] 
    }
});

module.exports = mongoose.model('Room', RoomSchema);
