const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    // Categoria superior a la que ascendio (opcional). Si esta seteada, el jugador
    // tambien figura en el plantel y la tabla de esa categoria.
    extraCategory: {
      type: String,
      trim: true,
      default: ""
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Player", playerSchema);
