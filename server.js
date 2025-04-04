const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 9999;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// MARK: так сказать база так сказать данных
const users = [];

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
}

// MARK: пути
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = { id: Date.now().toString(), username, password: hashedPassword };
        users.push(user);

        req.session.userId = user.id;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

app.get('/profile', requireAuth, (req, res) => {
    const user = users.find(u => u.id === req.session.userId);
    if (!user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/data', (req, res) => {
    const cacheFile = path.join(__dirname, 'cache', 'data.json');

    if (fs.existsSync(cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile));
        const now = new Date().getTime();

        if (now - cacheData.timestamp < 60000) {
            return res.json(cacheData.data);
        }
    }

    const newData = {
        timestamp: new Date().getTime(),
        data: {
            message: 'de_cache',
            randomNumber: Math.floor(Math.random() * 10e20),
            time: new Date().toISOString()
        }
    };

    if (!fs.existsSync(path.join(__dirname, 'cache'))) {
        fs.mkdirSync(path.join(__dirname, 'cache'));
    }
    fs.writeFileSync(cacheFile, JSON.stringify(newData));

    res.json(newData.data);
});

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

app.listen(PORT, () => {
    console.log(`started on http://localhost:${PORT}`);
});