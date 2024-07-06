const express = require('express');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');
const { sequelize } = require('./models');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
