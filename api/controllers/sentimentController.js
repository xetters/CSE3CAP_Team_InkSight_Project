import {spawn} from 'child_process';
import path from 'path';
import fs from 'fs';

export async function analyzeSemantic(req, res) {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        const text = fs.readFileSync(file.path, 'utf-8');

        const scriptPath = path.join(process.cwd(), 'api', 'utils', 'sentiment.py');
        const py = spawn('python', [scriptPath]);

        let data = "";
        let errData = "";

        py.stdout.on('data', chunk => (data += chunk.toString()));
        py.stderr.on('data', chunk => (errData += chunk.toString()));

        py.on('close', () => {
            if (errData) console.error('Python stderr:', errData);

            try {
                const result = JSON.paarse(data.trim());

                return res.json({
                mode: "semantic_analysis",
                semantic_summary: {
                    total_words: result.total_words, 
                    total_clusters: result.total_clusters,  //number of clusters
                    top_clusters: result.top_clusters, //top 4 clusters
                    clusters: result.clusters // all clusters (which can be avaliable for the download function)
                }
                });
            } catch (err) {
                console.error('Error parsing JSON:', err, data);
                return res.status(500).json({ error: 'Failed to parse sentiment analysis result' });
            }
        });

        py.stdin.write(text);
        py.stdin.end();
    } catch (err) {
        console.error('Error during sentiment analysis:', err);
        return res.status(500).json({ error: 'server failed' });
    }
}