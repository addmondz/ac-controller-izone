const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/control-ac', async (req, res) => {
    const { body } = req;
    try {
        const response = await axios.post('https://api.izone.com.au/testsimplelocalcocb', body);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling external API:', error.message);
        res.status(500).json({ error: 'Failed to call external API' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
