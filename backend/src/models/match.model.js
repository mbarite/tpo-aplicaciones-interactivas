const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    time: {
      type: String,
      required: true,
      match: /^\d{2}:\d{2}$/
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["scheduled", "played"],
      default: "scheduled"
    },
    homeScore: {
      type: Number,
      min: 0,
      default: null
    },
    awayScore: {
      type: Number,
      min: 0,
      default: null
    }
  },
  {
    timestamps: true
  }
);

matchSchema.pre("validate", function validateTeams(next) {
  if (this.homeTeam && this.awayTeam && String(this.homeTeam) === String(this.awayTeam)) {
    return next(new Error("Un partido no puede enfrentar al mismo equipo."));
  }

  return next();
});

module.exports = mongoose.model("Match", matchSchema);
