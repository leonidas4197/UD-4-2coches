const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Importamos las bibliotecas necesarias.
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Inicializamos la aplicación
const app = express();

// URL de conexión
const uri = "mongodb+srv://sergiojosero:M286ITSda5ANXzzj@cluster0.4hfcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Indicamos que la aplicación puede recibir JSON (API Rest)
app.use(express.json());

// Configuración de Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Indicamos el puerto en el que vamos a desplegar la aplicación
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

// Ruta para obtener todos los coches
app.get("/coches", async (req, res) => {
  const coches = await db.collection("coches").find({}).toArray();
  res.json(coches);
});

// Ruta para crear un coche
app.post("/coches", async (req, res) => {
  const { marca, modelo, cv, precio } = req.body;
  if (!marca || !modelo || !cv || !precio) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  const newCar = { marca, modelo, cv, precio };
  await db.collection("coches").insertOne(newCar);

  res.json({ message: "Coche creado con éxito." });
});

// Ruta para obtener un coche por ID
app.get("/coches/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  const coche = await db.collection("coches").findOne({ _id: id });

  if (!coche) {
    return res.status(404).json({ message: "Coche no encontrado." });
  }

  res.json(coche);
});

// Ruta para actualizar un coche
app.put("/coches/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  const { marca, modelo, cv, precio } = req.body;

  if (!marca || !modelo || !cv || !precio) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  const updated = await db.collection("coches").updateOne(
    { _id: id },
    { $set: { marca, modelo, cv, precio } }
  );

  if (updated.modifiedCount === 0) {
    return res.status(404).json({ message: "Coche no encontrado." });
  }

  res.json({ message: "Coche actualizado con éxito." });
});

// Ruta para eliminar un coche
app.delete("/coches/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  const deleted = await db.collection("coches").deleteOne({ _id: id });

  if (deleted.deletedCount === 0) {
    return res.status(404).json({ message: "Coche no encontrado." });
  }

  res.json({ message: "Coche borrado con éxito." });
});
