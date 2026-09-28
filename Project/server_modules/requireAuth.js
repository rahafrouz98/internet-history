const { supabase } = require("./supabase");

async function requireAuth(req, res, next) {
    const authorization = req.get("Authorization");
    const match = authorization?.match(/^Bearer (\S+)$/i);

    if (!match) {
        return res.status(401).json({ error: "Please sign in." });
    }

    try {
        const token = match[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({ error: "Invalid or expired login." });
        }

        req.user = data.user;
        next();
    } catch (error) {
        res.status(503).json({ error: "Unable to verify login. Try again." });
    }
}

module.exports = requireAuth;
