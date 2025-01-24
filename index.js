// Importamos las bibliotecas necesarias.
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Inicializamos la aplicación
const app = express();

// URL de conexión
const uri = 
    "mongodb+srv://sergiojosero:M286ITSda5ANXzzj@cluster0.4hfcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Indicamos que la aplicación puede recibir JSON (API Rest)
app.use(express.json());

// Indicamos el puerto en el que vamos a desplegar la aplicación
// eslint-disable-next-line no-undef
const port = process.env.PORT || 8080;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let db;

// Arrancamos la aplicación
app.listen(port, async () => {
  await client.connect();
  db = await client.db("mi-proyecto");

  console.log(`Servidor desplegado en puerto: ${port}`);
});

// Lista todos los concesionarios
app.get("/concesionarios", async (request, response) => {
  const concesionarios = await db.collection("concesionarios").find({}).toArray();
  response.json(concesionarios);
});

// Crear un nuevo concesionario
app.post("/concesionarios", async (request, response) => {
  const { nombre, direccion } = request.body;
  if (!nombre || !direccion) {
    return response.status(400).json({ message: "Nombre y dirección son requeridos." });
  }

  await db.collection("concesionarios").insertOne({ nombre, direccion, coches: [] });
  response.json({ message: "Concesionario creado con éxito." });
});

// Obtener un concesionario
app.get("/concesionarios/:id", async (request, response) => {
  const id = new ObjectId(request.params.id);
  const concesionario = await db.collection("concesionarios").findOne({ _id: id });

  if (!concesionario) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  response.json(concesionario);
});

// Actualizar un concesionario
app.put("/concesionarios/:id", async (request, response) => {
  const id = new ObjectId(request.params.id);
  const { nombre, direccion } = request.body;

  if (!nombre || !direccion) {
    return response.status(400).json({ message: "Nombre y dirección son requeridos." });
  }

  const updated = await db.collection("concesionarios").updateOne(
    { _id: id },
    { $set: { nombre, direccion } }
  );

  if (updated.modifiedCount === 0) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  response.json({ message: "Concesionario actualizado." });
});

// Borrar un concesionario
app.delete("/concesionarios/:id", async (request, response) => {
  const id = new ObjectId(request.params.id);
  const deleted = await db.collection("concesionarios").deleteOne({ _id: id });

  if (deleted.deletedCount === 0) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  response.json({ message: "Concesionario borrado." });
});

// Obtener todos los coches de un concesionario
app.get("/concesionarios/:id/coches", async (request, response) => {
  const id = new ObjectId(request.params.id);
  const concesionario = await db.collection("concesionarios").findOne({ _id: id });

  if (!concesionario) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  response.json(concesionario.coches);
});

// Añadir un coche a un concesionario
app.post("/concesionarios/:id/coches", async (request, response) => {
  const id = new ObjectId(request.params.id);
  const { modelo, cv, precio } = request.body;

  if (!modelo || !cv || !precio) {
    return response.status(400).json({ message: "Modelo, cv y precio son requeridos." });
  }

  const concesionario = await db.collection("concesionarios").findOne({ _id: id });
  if (!concesionario) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  const newCar = { modelo, cv, precio };
  await db.collection("concesionarios").updateOne(
    { _id: id },
    { $push: { coches: newCar } }
  );

  response.json({ message: "Coche añadido con éxito." });
});

// Obtener un coche de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  const concesionarioId = new ObjectId(request.params.id);
  const cocheId = request.params.cocheId;

  const concesionario = await db.collection("concesionarios").findOne({ _id: concesionarioId });
  if (!concesionario) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  const coche = concesionario.coches.find(c => c._id == cocheId);
  if (!coche) {
    return response.status(404).json({ message: "Coche no encontrado." });
  }

  response.json(coche);
});

// Actualizar un coche de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  const concesionarioId = new ObjectId(request.params.id);
  const cocheId = request.params.cocheId;
  const { modelo, cv, precio } = request.body;

  if (!modelo || !cv || !precio) {
    return response.status(400).json({ message: "Modelo, cv y precio son requeridos." });
  }

  const concesionario = await db.collection("concesionarios").findOne({ _id: concesionarioId });
  if (!concesionario) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  const cocheIndex = concesionario.coches.findIndex(c => c._id == cocheId);
  if (cocheIndex === -1) {
    return response.status(404).json({ message: "Coche no encontrado." });
  }

  concesionario.coches[cocheIndex] = { ...concesionario.coches[cocheIndex], modelo, cv, precio };
  
  await db.collection("concesionarios").updateOne(
    { _id: concesionarioId },
    { $set: { coches: concesionario.coches } }
  );

  response.json({ message: "Coche actualizado con éxito." });
});

// Borrar un coche de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  const concesionarioId = new ObjectId(request.params.id);
  const cocheId = request.params.cocheId;

  const concesionario = await db.collection("concesionarios").findOne({ _id: concesionarioId });
  if (!concesionario) {
    return response.status(404).json({ message: "Concesionario no encontrado." });
  }

  const updatedCoches = concesionario.coches.filter(c => c._id != cocheId);
  if (updatedCoches.length === concesionario.coches.length) {
    return response.status(404).json({ message: "Coche no encontrado." });
  }

  await db.collection("concesionarios").updateOne(
    { _id: concesionarioId },
    { $set: { coches: updatedCoches } }
  );

  response.json({ message: "Coche borrado con éxito." });
});
