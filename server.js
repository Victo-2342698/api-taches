require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const openapiDoc = yaml.load(fs.readFileSync('./docs/openapi.yaml', 'utf8'));
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.use(express.static('public'));

app.use('/utilisateurs', require('./src/routes/utilisateurs.routes'));
app.use('/cle-api', require('./src/routes/cle.routes'));

const verifierCleAPI = require('./src/middlewares/auth.middleware');

app.use('/taches', verifierCleAPI, require('./src/routes/taches.routes'));
app.use('/sous-taches', verifierCleAPI, require('./src/routes/sousTaches.routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));
