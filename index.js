const express = require('express');
const puppeteer = require('puppeteer');
const vader = require('vader-sentiment'); 

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.post('/api/sentiment', (req, res) => {
        const message = req.body.message;
    
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
    
        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(message);
        const sentimentScore = sentiment.compound;
    
        let result = "NEUTRAL😐";
        if (sentimentScore >= 0.05) result = "POSITIVE😄";
        else if (sentimentScore <= -0.05) result = "NEGATIVE😔";
    
        res.json({ sentiment: result, score: sentimentScore });
     });
app.post('/api/sentiment/tweet', async (req, res) => {
    const { url } = req.body;

    console.log("Received URL:", url); 

    
    const validXURL = url && /^(https?:\/\/)?(www\.)?x\.com\/[A-Za-z0-9_]+\/status\/\d+/.test(url);

    if (!validXURL) {
        return res.status(400).json({ error: "Only valid x.com tweet URLs are accepted" });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

        console.log("Page loaded successfully"); 

        await page.waitForSelector('article div[lang]', { timeout: 10000 });
        console.log("Tweet content found"); 

        const tweetText = await page.$eval('article div[lang]', el => el.innerText);

        console.log("Extracted tweet text:", tweetText); 

        await browser.close();

        const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(tweetText);
        const sentimentScore = sentiment.compound;

        let result = "NEUTRAL😐";
        if (sentimentScore >= 0.05) result = "POSITIVE😄";
        else if (sentimentScore <= -0.05) result = "NEGATIVE😔";

        res.json({
            tweet: tweetText,
            sentiment: result,
            score: sentimentScore
        });

    } catch (err) {
        console.error("Error extracting tweet:", err); 
        res.status(500).json({ error: "Failed to extract tweet", details: err.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
