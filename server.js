const express = require("express");
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const cacheDir = path.join(__dirname, 'cache');
const port = 9999;

if (!fs.existsSync(cacheDir)) {
    fs.mkdir(cacheDir);
}

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

function getCacheData(key, ttlSeconds = 30) {
    const cacheFile = path.join(cacheDir, `${key}.json`);

    if (fs.existsSync(cacheFile)) {
        const stats = fs.statSync(cacheFile);
        const now = new Date().getTime();
        const fileAge = (now - stats.mtimeMs) / 1000;

        if (fileAge < ttlSeconds) {
            const cachedData = fs.readFileSync(cacheFile, 'utf-8');
            return JSON.parse(cachedData);
        }
    }
    const newData = {
        items: [1, 2, 3],
        timestamp: Date.now(),
        source: 'файловый кэш'
    };

    fs.writeFileSync(cacheFile, JSON.stringify(newData));


    setTimeout(() => {
        if (fs.existsSync(cacheFile)) {
            fs.unlinkSync(cacheFile);
        }
    }, ttlSeconds * 1000);
    return newData;
}

app.get('/api/data', (req, res) => {
    const data = getCacheData('api_data');
    res.json(data);
});

app.post('/theme', (req, res) => {
    const theme = req.body.theme;
    res.cookie('theme', theme, {
        maxAge: 86400000,
        httpOnly: true,
        sameSite: 'strict'
    });
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Started: http://localhost:${port}`)
})