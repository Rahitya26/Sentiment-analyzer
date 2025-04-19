const express = require('express');
const bodyParser = require('body-parser');
const vader = require('vader-sentiment');

const app = express();
const port = 5000;
app.use(express.static('public'));

// Middleware to parse JSON
app.use(bodyParser.json());

// Endpoint to analyze sentiment
app.post('/api/sentiment', (req, res) => {
    const message = req.body.message;

    // if (!message) {
    //     return res.status(400).json({ error: "Message is required" });
    // }

    // Perform sentiment analysis using Vader Sentiment
    const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(message);
    const sentimentScore = sentiment.compound;

    // Determine sentiment based on score
    let result = "NEUTRAL 😐";
    if (sentimentScore >= 0.05) {
        result = "POSITIVE 😄";
    } else if (sentimentScore <= -0.05) {
        result = "NEGATIVE 😔";
    }

    // Respond with sentiment result
    res.json({ sentiment: result, score: sentimentScore });
});

app.get("/",(req,res)=>{
    res.render("index.ejs");
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});