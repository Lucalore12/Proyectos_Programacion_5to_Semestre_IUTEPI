const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'Prueba';

async function main() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log('Conectado a la base de datos');

        const db = client.db(dbName);
        const collection = db.collection('Prueba');

        const documento = { nombre: 'Kimmich', edad: 32, ciudad: 'Berlin', industria:"Riot Games" };
        const resultado = await collection.insertOne(documento);
        console.log('Documento insertado:', resultado.insertedId);
    } 
    catch (error) {
        console.error('Error al conectar a la base de datos', error);
    } 
    finally {
        await client.close();
    }
}

main().catch(console.error);