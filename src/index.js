const mongoose = require('mongoose');

// import environment variables
require('dotenv').config({ path: 'variables.env' });

// connect to the database
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', err => {
  console.log(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// require models here

// start the app
const app = require('./app');

app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running ➡ PORT ${server.address().port} `);
});
