const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/events', eventRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Serving on PORT ${PORT}`));