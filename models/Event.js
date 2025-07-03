import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  eventLocation: {
    address: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    placeId: {
      type: String,
      required: false,
    },
    coordinates: {
      lat: {
        type: Number,
        required: false,
      },
      lng: {
        type: Number,
        required: false,
      },
    },
  },
  ticketPrice: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  eventDescription: {
    type: String,
    required: true,
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  eventVideo: {
    type: String,
    required: true,
  },
  videoThumbnail: {
    type: String,
    required: true,
  },
  ageRestrictions: {
    type: [String],
    enum: ["no-restriction", "<18", "18-29", "30-39", "40<"],
    required: true,
  },
  genderRestrictions: {
    type: String,
    enum: ["male", "female", "all", "other"],
    default: "all",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendees: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
      paymentReference: String,
      amount: Number,
      ticketNumber: String,
      paystackData: {
        transactionId: String,
        reference: String,
        channel: String,
        paidAt: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);