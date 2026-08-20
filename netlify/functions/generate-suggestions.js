export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { pozice, pole } = req.body;
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('Chybí ANTHROPIC_API_KEY');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: `Pro pozici "${pozice}" v České republice vygeneruj POUZE 3 konkrétní návrhy do pole "${pole}". Vrať POUZE seznam - každý návrh na novém řádku, bez čísel, bez "-".`
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            throw new Error(data.error?.message || 'API error');
        }

        const suggestions = data.content[0]?.text
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .slice(0, 3) || [];

        return res.status(200).json({ suggestions });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
}
