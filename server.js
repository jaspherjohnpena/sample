// Event Management API with MongoDB
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ==================== MONGOOSE MODELS ====================

// Event schema
const eventSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  date: String,
  venue: String,
});

const attendeeSchema = new mongoose.Schema({
  name: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
});

const organizerSchema = new mongoose.Schema({
  name: String,
  contact: String,
});

const Event = mongoose.model("Event", eventSchema);
const Attendee = mongoose.model("Attendee", attendeeSchema);
const Organizer = mongoose.model("Organizer", organizerSchema);

// ==================== ROUTES ====================

// GET all events
app.get("/api/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// GET specific event
app.get("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);

  const event = await Event.findOne({ id: eventId });
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json(event);
});

// POST a new event
app.post("/api/events", async (req, res) => {
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.status(201).json(newEvent);
});

// PUT update event
app.post("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);

  const existingEvent = await Event.findOne({ id: eventId });
  if (existingEvent) {
    return res.status(400).json({ message: "Event ID already exists" });
  }

  const newEvent = new Event({
    id: eventId,
    name: req.body.name,
    date: req.body.date,
    venue: req.body.venue,
  });

  await newEvent.save();
  res.status(201).json(newEvent);
});

// DELETE event
app.delete("/api/events/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event deleted successfully" });
});

// You can do the same for Attendees and Organizers
// GET all attendees
app.get("/api/attendees", async (req, res) => {
  const attendees = await Attendee.find();
  res.json(attendees);
});

// POST attendee
app.post("/api/attendees", async (req, res) => {
  const newAttendee = new Attendee(req.body);
  await newAttendee.save();
  res.status(201).json(newAttendee);
});

// DELETE attendee
app.delete("/api/attendees/:id", async (req, res) => {
  await Attendee.findByIdAndDelete(req.params.id);
  res.json({ message: "Attendee removed" });
});

// GET all organizers
app.get("/api/organizers", async (req, res) => {
  const organizers = await Organizer.find();
  res.json(organizers);
});

// POST organizer
app.post("/api/organizers", async (req, res) => {
  const newOrg = new Organizer(req.body);
  await newOrg.save();
  res.status(201).json(newOrg);
});

// PUT update organizer
app.put("/api/organizers/:id", async (req, res) => {
  const updatedOrg = await Organizer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedOrg) return res.status(404).json({ message: "Organizer not found" });
  res.json(updatedOrg);
});

// ==================== CONNECT TO MONGO & START SERVER ====================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${3000}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));
