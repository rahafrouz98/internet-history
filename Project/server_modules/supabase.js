require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

async function saveContributedData(data, userId, token) {
    const tables = {
        Technology: "technology",
        Legislation: "legislation",
    };

    const table = tables[data.dataType];

    if (!table) {
        throw new Error("Invalid contribution type.");
    }

    // Create a separate client for this user's request.
    const userSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });

    // Store website content only.
    // Contributor identity belongs in the user_id column.
    const content = {
        category: data.category,
        title: data.title,
        start: data.start,
        content: data.content,
        references: (data.references || []).filter((value) => value.trim() !== ""),
        videos: (data.videos || []).filter((value) => value.trim() !== ""),
        images: data.images || [],
    };

    if (data.end) {
        content.end = data.end;
    }

    const { error } = await userSupabase.from(table).insert({
        data: content,
        user_id: userId,
        review: "in process",
    });

    if (error) {
        throw error;
    }
}

module.exports = { supabase, saveContributedData };
