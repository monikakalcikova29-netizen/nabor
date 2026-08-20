export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { data } = req.body;
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
                max_tokens: 5000,
                messages: [{
                    role: 'user',
                    content: `Jsi expert na HR a nábor v České republice. Na základě těchto dat vytvoř 5 věcí:

## 1. JOB DESCRIPTION
Detailní interní popis pozice (200-300 slov).

## 2. INZERÁT
Atraktivní text pro LinkedIn (300-400 slov).

## 3. SROVNĚNÍ MEZD
- Zadané rozpětí vs reálné platy v ČR
- Je to competitive?
- Doporučení

## 4. REALITA TRHU
- Počet kandidátů
- Obtížnost náboru
- Čas na obsazení
- Top kanály
- Expectations kandidátů

## 5. HR STRATEGIE
- Rizika
- Red flags
- Tipy na hledání
- Retention

DATA:
${data}`
                }],
                tools: [{
                    type: 'web_search_20250305',
                    name: 'web_search'
                }]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(result);
            throw new Error(result.error?.message || 'API error');
        }

        const analysis = result.content
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('\n');

        return res.status(200).json({ analysis });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
}
