// Importamos las bibliotecas necesarias.
// Concretamente el framework express y ciertas librerías de mongodb.
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

// Lista todos los coches
app.get("/coches", async (request, response) => {
  const coches = await db.collection("coches").find({}).toArray();

  response.json(coches);
});

// Añadir un nuevo coche
app.post("/coches", async (request, response) => {
  await db.collection("coches").insertOne(request.body);

  response.json({ message: "ok" });
});

// Obtener un solo coche
app.get("/coches/:id", async (request, response) => {
  const id = new ObjectId(request.params.id);
  const coche = await db.collection("coches").find({ _id: id }).toArray();

  response.json({ coche });
});

// Actualizar un solo coche
app.put("/coches/:id", async (request, response) => {
  const id = new ObjectId(request.params.id);
  await db.collection("coches").updateOne({ _id: id }, { $set: request.body });

  response.json({ message: "ok" });
});

// Borrar un elemento del array
app.delete("/coches/:id", async (request, response) => {
  const id = new ObjectId(request.params.id);
  await db.collection("coches").deleteOne({ _id: id });

  response.json({ message: "ok" });
});
