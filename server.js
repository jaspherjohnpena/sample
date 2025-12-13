// Event Management API with MongoDB
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ==================== SCHEMAS ====================

const eventSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  date: String,
  venue: String,
});

const attendeeSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  eventId: { type: Number, required: true }
});

const organizerSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  contact: String,
});

const Event = mongoose.model("Event", eventSchema);
const Attendee = mongoose.model("Attendee", attendeeSchema);
const Organizer = mongoose.model("Organizer", organizerSchema);

// ==================== EVENTS ====================

// GET all events
app.get("/api/events", async (req, res) => {
  const events = await Event.find().sort({ id: 1 }).select("-_id -__v");
  res.json(events);
});

// GET event by ID
app.get("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const event = await Event.findOne({ id: eventId }).select("-_id -__v");
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

// POST new event (auto ID)
app.post("/api/events", async (req, res) => {
  const lastEvent = await Event.findOne().sort({ id: -1 });
  const newId = lastEvent ? lastEvent.id + 1 : 1;

  const newEvent = new Event({ id: newId, ...req.body });
  await newEvent.save();
  res.status(201).json({ id: newEvent.id, ...req.body });
});

// PUT update event (full replace)
app.put("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const updatedEvent = await Event.findOneAndUpdate(
    { id: eventId },
    req.body,
    { new: true }
  ).select("-_id -__v");

  if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
  res.json(updatedEvent);
});

// PATCH update event (partial)
app.patch("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const updatedEvent = await Event.findOneAndUpdate(
    { id: eventId },
    { $set: req.body },
    { new: true }
  ).select("-_id -__v");

  if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
  res.json(updatedEvent);
});

// DELETE event
app.delete("/api/events/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const deletedEvent = await Event.findOneAndDelete({ id: eventId });
  if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
  res.json({ message: "Event deleted successfully" });
});

// ==================== ATTENDEES ====================

// GET all attendees
app.get("/api/attendees", async (req, res) => {
  const attendees = await Attendee.find().sort({ id: 1 }).select("id name eventId -_id");
  res.json(attendees);
});

// GET attendee by ID
app.get("/api/attendees/:id", async (req, res) => {
  const attendeeId = Number(req.params.id);
  const attendee = await Attendee.findOne({ id: attendeeId }).select("id name eventId -_id");

  if (!attendee) return res.status(404).json({ message: "Attendee not found" });

  res.json(attendee);
});

// POST new attendee
app.post("/api/attendees", async (req, res) => {
  const lastAttendee = await Attendee.findOne().sort({ id: -1 });
  const newId = lastAttendee ? lastAttendee.id + 1 : 1;

  const newAttendee = new Attendee({
    id: newId,
    name: req.body.name,
    eventId: req.body.eventId
  });

  await newAttendee.save();

  // Return selected fields
  res.status(201).json({
    id: newAttendee.id,
    name: newAttendee.name,
    eventId: newAttendee.eventId
  });
});

// PATCH attendee
app.patch("/api/attendees/:id", async (req, res) => {
  const attendeeId = Number(req.params.id);
  const updatedAttendee = await Attendee.findOneAndUpdate(
    { id: attendeeId },
    { $set: req.body },
    { new: true }
  ).select("-_id -__v");

  if (!updatedAttendee) return res.status(404).json({ message: "Attendee not found" });
  res.json(updatedAttendee);
});

// DELETE attendee
app.delete("/api/attendees/:id", async (req, res) => {
  const attendeeId = Number(req.params.id);
  const deletedAttendee = await Attendee.findOneAndDelete({ id: attendeeId });
  if (!deletedAttendee) return res.status(404).json({ message: "Attendee not found" });
  res.json({ message: "Attendee removed" });
});

// ==================== ORGANIZERS ====================

// GET all organizers
app.get("/api/organizers", async (req, res) => {
  const organizers = await Organizer.find().sort({ id: 1 }).select("-_id -__v");
  res.json(organizers);
});

// GET organizer by ID
app.get("/api/organizers/:id", async (req, res) => {
  const organizerId = Number(req.params.id);
  const organizer = await Organizer.findOne({ id: organizerId }).select("-_id -__v");
  if (!organizer) return res.status(404).json({ message: "Organizer not found" });
  res.json(organizer);
});

// POST new organizer
app.post("/api/organizers", async (req, res) => {
  const lastOrg = await Organizer.findOne().sort({ id: -1 });
  const newId = lastOrg ? lastOrg.id + 1 : 1;

  const newOrg = new Organizer({ id: newId, ...req.body });
  await newOrg.save();

  res.status(201).json({ id: newOrg.id, name: newOrg.name, contact: newOrg.contact });
});

// PATCH organizer
app.patch("/api/organizers/:id", async (req, res) => {
  const organizerId = Number(req.params.id);
  const updatedOrg = await Organizer.findOneAndUpdate(
    { id: organizerId },
    { $set: req.body },
    { new: true }
  ).select("-_id -__v");

  if (!updatedOrg) return res.status(404).json({ message: "Organizer not found" });
  res.json(updatedOrg);
});

// DELETE organizer
app.delete("/api/organizers/:id", async (req, res) => {
  const organizerId = Number(req.params.id);
  const deletedOrg = await Organizer.findOneAndDelete({ id: organizerId });
  if (!deletedOrg) return res.status(404).json({ message: "Organizer not found" });
  res.json({ message: "Organizer deleted" });
});

// ==================== CONNECT TO MONGO ====================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${3000}`);
    });
  })
  .catch(err => console.error("MongoDB connection error:", err));
