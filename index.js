const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const uri = "mongodb+srv://sergiojosero:M286ITSda5ANXzzj@cluster0.4hfcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 8080;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

app.listen(port, async () => {
  await client.connect();
  db = await client.db("mi-proyecto");
  console.log(`Servidor desplegado en puerto: ${port}`);
});

// Rutas para concesionarios

app.get("/concesionarios", async (req, res) => {
  const concesionarios = await db.collection("concesionarios").find({}).toArray();
  res.json(concesionarios);
});

app.post("/concesionarios", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "El campo id es requerido." });
  }

  const newConcesionario = { id, coches: [] };
  await db.collection("concesionarios").insertOne(newConcesionario);

  res.json({ message: "Concesionario creado con éxito." });
});

app.get("/concesionarios/:id", async (req, res) => {
  const id = req.params.id;
  const concesionario = await db.collection("concesionarios").findOne({ id });

  if (!concesionario) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  res.json(concesionario);
});

app.put("/concesionarios/:id", async (req, res) => {
  const id = req.params.id;
  const { coches } = req.body;

  const updated = await db.collection("concesionarios").updateOne(
    { id },
    { $set: { coches } }
  );

  if (updated.modifiedCount === 0) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  res.json({ message: "Concesionario actualizado con éxito." });
});

app.delete("/concesionarios/:id", async (req, res) => {
  const id = req.params.id;
  const deleted = await db.collection("concesionarios").deleteOne({ id });

  if (deleted.deletedCount === 0) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  res.json({ message: "Concesionario borrado con éxito." });
});

// Rutas para coches dentro de concesionarios

app.get("/concesionarios/:id/coches", async (req, res) => {
  const id = req.params.id;
  const concesionario = await db.collection("concesionarios").findOne({ id });

  if (!concesionario) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  res.json(concesionario.coches);
});

app.post("/concesionarios/:id/coches", async (req, res) => {
  const id = req.params.id;
  const { cocheId, marca, modelo } = req.body;

  if (!cocheId || !marca || !modelo) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  const concesionario = await db.collection("concesionarios").findOne({ id });

  if (!concesionario) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  concesionario.coches.push({ cocheId, marca, modelo });

  await db.collection("concesionarios").updateOne(
    { id },
    { $set: { coches: concesionario.coches } }
  );

  res.json({ message: "Coche añadido con éxito." });
});

app.get("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  const id = req.params.id;
  const cocheId = req.params.cocheId;

  const concesionario = await db.collection("concesionarios").findOne({ id });

  if (!concesionario) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  const coche = concesionario.coches.find((c) => c.cocheId === cocheId);

  if (!coche) {
    return res.status(404).json({ message: "Coche no encontrado." });
  }

  res.json(coche);
});

app.put("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  const id = req.params.id;
  const cocheId = req.params.cocheId;
  const { marca, modelo } = req.body;

  if (!marca || !modelo) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  const concesionario = await db.collection("concesionarios").findOne({ id });

  if (!concesionario) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  const cocheIndex = concesionario.coches.findIndex((c) => c.cocheId === cocheId);

  if (cocheIndex === -1) {
    return res.status(404).json({ message: "Coche no encontrado." });
  }

  concesionario.coches[cocheIndex] = { cocheId, marca, modelo };

  await db.collection("concesionarios").updateOne(
    { id },
    { $set: { coches: concesionario.coches } }
  );

  res.json({ message: "Coche actualizado con éxito." });
});

app.delete("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  const id = req.params.id;
  const cocheId = req.params.cocheId;

  const concesionario = await db.collection("concesionarios").findOne({ id });

  if (!concesionario) {
    return res.status(404).json({ message: "Concesionario no encontrado." });
  }

  const cocheIndex = concesionario.coches.findIndex((c) => c.cocheId === cocheId);

  if (cocheIndex === -1) {
    return res.status(404).json({ message: "Coche no encontrado." });
  }

  concesionario.coches.splice(cocheIndex, 1);

  await db.collection("concesionarios").updateOne(
    { id },
    { $set: { coches: concesionario.coches } }
  );

  res.json({ message: "Coche borrado con éxito." });
});
