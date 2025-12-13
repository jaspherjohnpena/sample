// Event Management API with MongoDB + Swagger
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ==================== SWAGGER SETUP ====================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Management API",
      version: "1.0.0",
      description: "API documentation for the Event Management system",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ["./server.js"], // <-- points to this file
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Event management endpoints
 *   - name: Attendees
 *     description: Attendee management endpoints
 *   - name: Organizers
 *     description: Organizer management endpoints
 */

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
  eventId: { type: Number, required: true },
});

const organizerSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
});

const Event = mongoose.model("Event", eventSchema);
const Attendee = mongoose.model("Attendee", attendeeSchema);
const Organizer = mongoose.model("Organizer", organizerSchema);

// ==================== ROUTES ====================

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 */
app.get("/api/events", async (req, res) => {
  const events = await Event.find().sort({ id: 1 }).select("-_id -__v");
  res.json(events);
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event found
 *       404:
 *         description: Event not found
 */
app.get("/api/events/:id", async (req, res) => {
  const event = await Event.findOne({ id: Number(req.params.id) }).select("-_id -__v");
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

app.post("/api/events", async (req, res) => {
  const lastEvent = await Event.findOne().sort({ id: -1 });
  const newId = lastEvent ? lastEvent.id + 1 : 1;
  const newEvent = new Event({ id: newId, ...req.body });
  await newEvent.save();
  res.status(201).json({ id: newEvent.id, ...req.body });
});

app.patch("/api/events/:id", async (req, res) => {
  const updatedEvent = await Event.findOneAndUpdate(
    { id: Number(req.params.id) },
    { $set: req.body },
    { new: true }
  ).select("-_id -__v");

  if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
  res.json(updatedEvent);
});

app.delete("/api/events/:id", async (req, res) => {
  const deletedEvent = await Event.findOneAndDelete({ id: Number(req.params.id) });
  if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
  res.json({ message: "Event deleted successfully" });
});

// ==================== ATTENDEES ====================
app.get("/api/attendees", async (req, res) => {
  const attendees = await Attendee.find().sort({ id: 1 }).select("id name eventId -_id");
  res.json(attendees);
});

app.get("/api/attendees/:id", async (req, res) => {
  const attendee = await Attendee.findOne({ id: Number(req.params.id) }).select("id name eventId -_id");
  if (!attendee) return res.status(404).json({ message: "Attendee not found" });
  res.json(attendee);
});

app.post("/api/attendees", async (req, res) => {
  const lastAttendee = await Attendee.findOne().sort({ id: -1 });
  const newId = lastAttendee ? lastAttendee.id + 1 : 1;
  const newAttendee = new Attendee({ id: newId, ...req.body });
  await newAttendee.save();
  res.status(201).json({ id: newAttendee.id, name: newAttendee.name, eventId: newAttendee.eventId });
});

app.patch("/api/attendees/:id", async (req, res) => {
  const updatedAttendee = await Attendee.findOneAndUpdate(
    { id: Number(req.params.id) },
    { $set: req.body },
    { new: true }
  ).select("id name eventId -_id");

  if (!updatedAttendee) return res.status(404).json({ message: "Attendee not found" });
  res.json(updatedAttendee);
});

app.delete("/api/attendees/:id", async (req, res) => {
  const deletedAttendee = await Attendee.findOneAndDelete({ id: Number(req.params.id) });
  if (!deletedAttendee) return res.status(404).json({ message: "Attendee not found" });
  res.json({ message: "Attendee removed" });
});

// ==================== ORGANIZERS ====================
app.get("/api/organizers", async (req, res) => {
  const organizers = await Organizer.find().sort({ id: 1 }).select("id name contact -_id");
  res.json(organizers);
});

app.get("/api/organizers/:id", async (req, res) => {
  const organizer = await Organizer.findOne({ id: Number(req.params.id) }).select("id name contact -_id");
  if (!organizer) return res.status(404).json({ message: "Organizer not found" });
  res.json(organizer);
});

app.post("/api/organizers", async (req, res) => {
  const lastOrg = await Organizer.findOne().sort({ id: -1 });
  const newId = lastOrg ? lastOrg.id + 1 : 1;
  const newOrg = new Organizer({ id: newId, ...req.body });
  await newOrg.save();
  res.status(201).json({ id: newOrg.id, name: newOrg.name, contact: newOrg.contact });
});

app.patch("/api/organizers/:id", async (req, res) => {
  const updatedOrg = await Organizer.findOneAndUpdate(
    { id: Number(req.params.id) },
    { $set: req.body },
    { new: true }
  ).select("id name contact -_id");

  if (!updatedOrg) return res.status(404).json({ message: "Organizer not found" });
  res.json(updatedOrg);
});

app.delete("/api/organizers/:id", async (req, res) => {
  const deletedOrg = await Organizer.findOneAndDelete({ id: Number(req.params.id) });
  if (!deletedOrg) return res.status(404).json({ message: "Organizer not found" });
  res.json({ message: "Organizer deleted" });
});

// ==================== CONNECT TO MONGO ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server running at http://localhost:${3000}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
