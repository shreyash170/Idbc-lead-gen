const express = require('express');
const cors = require('cors');
const leadsRouter = require('./routes/leads');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/leads', leadsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'IDBI Lead Gen PoC API running' });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));