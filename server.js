const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const OpenAI = require('openai');
require('dotenv').config({ path: './openai.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function fetchWebsiteContent(url) {
  try {
    const { data } = await axios.get(url);
    return data.substring(0, 2000);
  } catch (err) {
    return 'Website content could not be retrieved.';
  }
}

app.post('/chat', async (req, res) => {
  const { company, service, userMessage, website } = req.body;

  let websiteText = '';
  if (website && website.startsWith('http')) {
    websiteText = await fetchWebsiteContent(website);
  }

  const systemPrompt = `You are an AI assistant for a company called "${company}", which provides "${service}". 
Use the following website info if useful: ${websiteText}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ reply: 'An error occurred. Please try again later.' });
  }
}

});

app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));
