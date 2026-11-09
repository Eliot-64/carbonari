const http = require('http');
const https = require('https');
const { URL } = require('url');

// Gère les requêtes entrantes
const server = http.createServer((req, res) => {
  // Active CORS pour que le navigateur accepte les réponses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Réponse aux requêtes OPTIONS (pré-vol CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Récupère l'URL cible depuis le paramètre "url"
  const urlParam = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = urlParam.searchParams.get('url');

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Paramètre "url" manquant. Exemple : ?url=https://discord.com/api/v9');
    return;
  }

  // Valide que l'URL commence par http:// ou https://
  let target;
  try {
    target = new URL(targetUrl);
    if (!['http:', 'https:'].includes(target.protocol)) {
      throw new Error('Protocole invalide');
    }
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('URL invalide : ' + err.message);
    return;
  }

  // Choisis le module approprié (http ou https)
  const client = target.protocol === 'https:' ? https : http;

  // Crée la requête vers la cible
  const proxyReq = client.request(
    target,
    {
      method: req.method,
      headers: { ...req.headers, host: target.host },
    },
    (proxyRes) => {
      // Copie le statut et les headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      // Transfère le corps de la réponse
      proxyRes.pipe(res);
    }
  );

  // Gère les erreurs
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Erreur proxy : ' + err.message);
  });

  // Transfère le corps de la requête (si POST, etc.)
  req.pipe(proxyReq);
});

// Port d'écoute
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Proxy démarré sur le port ${PORT}`);
});
