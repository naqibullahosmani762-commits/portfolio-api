const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.use(cors());
app.use(express.json());

// Errors are sent as short codes. The website translates them.
function requireAdmin(req, res, next) {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "WRONG_PASSWORD" });
  }
  next();
}

// ---- Public routes ----
app.get("/api/profile", (req, res) => res.json(db.read().profile));
app.get("/api/projects", (req, res) => res.json(db.read().projects));

app.post("/api/messages", (req, res) => {
  const { name, email, text } = req.body;
  if (!name || !email || !text) {
    return res.status(400).json({ error: "MISSING_FIELDS" });
  }
  const data = db.read();
  data.messages.unshift({ id: Date.now(), name, email, text, date: new Date().toISOString() });
  db.write(data);
  res.status(201).json({ ok: true });
});

// ---- Admin routes ----
app.get("/api/admin/check", requireAdmin, (req, res) => res.json({ ok: true }));

app.put("/api/profile", requireAdmin, (req, res) => {
  const data = db.read();
  data.profile = { ...data.profile, ...req.body };
  db.write(data);
  res.json(data.profile);
});

app.post("/api/projects", requireAdmin, (req, res) => {
  const data = db.read();
  const project = { ...req.body, id: Date.now() };
  data.projects.push(project);
  db.write(data);
  res.status(201).json(project);
});

app.put("/api/projects/:id", requireAdmin, (req, res) => {
  const data = db.read();
  const index = data.projects.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "NOT_FOUND" });
  data.projects[index] = { ...data.projects[index], ...req.body, id: data.projects[index].id };
  db.write(data);
  res.json(data.projects[index]);
});

app.delete("/api/projects/:id", requireAdmin, (req, res) => {
  const data = db.read();
  data.projects = data.projects.filter((p) => p.id !== Number(req.params.id));
  db.write(data);
  res.json({ ok: true });
});

app.get("/api/messages", requireAdmin, (req, res) => res.json(db.read().messages));

app.delete("/api/messages/:id", requireAdmin, (req, res) => {
  const data = db.read();
  data.messages = data.messages.filter((m) => m.id !== Number(req.params.id));
  db.write(data);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
