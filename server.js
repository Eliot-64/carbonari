const express = require('express');
const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Paramètre "url" manquant. Exemple : ?url=https://discord.com/api/v9');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://discord.com',
        'Referer': 'https://discord.com/'
      }
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).send('Erreur proxy : ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy démarré sur le port ${PORT}`);
});
