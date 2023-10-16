const express = require('express');
const qr = require('qrcode');
const uuid = require('uuid');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");

const username = encodeURIComponent("cristianCadavid");
const password = encodeURIComponent("Uyr14mr2nYAIPt2x");
const uri = `mongodb+srv://${username}:${password}@cluster0.dmid3jn.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
const port = 3000;

app.use(express.urlencoded())
app.use(express.json());
app.use(cors())


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);

app.post('/generar-cupon/', async (req, res) => {
    try {
      const { valor  } = req.query;
      console.log(valor)
      const codigoCupon = uuid.v4();
  
      // Almacenar el código del cupón en la base de datos
      (await client.connect()).db("cluster0")
      await client.db("cluster0").collection('cupones').insertOne({ codigo: codigoCupon, valor });
  
      // Generar el código QR y devolverlo como respuesta
      const qrCode = await qr.toDataURL(codigoCupon);
      res.send({ qrCode, couponCode: codigoCupon });
    } catch (error) {
      console.error('Error al generar el cupón:', error);
      res.status(500).send('Error interno del servidor');
    }
  });
  
  app.post('/redimir-cupon', async (req, res) => {
    try {
      const { codigo } = req.body;

      console.log(req.body);
  
      // Verificar si el cupón ya se redimió
      (await client.connect()).db("cluster0")
      const cupon = await client.db("cluster0").collection('cupones').findOne({ codigo });
      console.log(cupon)
      if (!cupon) {
        res.json({ mensaje: "El cupón ya ha sido usado en anterioridad o no existe" });
        return;
      }
  
      // Realizar la acción de redimir el cupón aquí
  
      // Marcar el cupón como redimido para evitar redenciones adicionales
      await client.db("cluster0").collection('cupones').deleteOne({ codigo });
  
      res.json({ mensaje: "Cupón redimido con éxito" });
    } catch (error) {
      console.error('Error al redimir el cupón:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  });
  
  

app.listen(port, () => {
  console.log(`Aplicación escuchando en el puerto ${port}`);
});
