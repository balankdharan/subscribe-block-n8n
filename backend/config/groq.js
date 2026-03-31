const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const callGroq = async (systemPrompt, userMessage, temperature = 0.7) => {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const parseJSON = (text) => {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

const generatePromptTemplate = async (userDescription) => {
  const systemPrompt = `You are an expert at designing AI prompt templates for daily reminder cards.
The user will describe what kind of daily reminder block they want.
You must return a JSON object with these exact fields:
{
  "topic": "short topic name",
  "languages": ["array of language names the content should include, empty if not applicable"],
  "format": "brief description of the card format",
  "systemPrompt": "a detailed reusable system prompt that an AI will use every day to generate one unique card. It must instruct the AI to: return only valid JSON, never repeat previously shown content, and follow the exact outputSchema structure provided.",
  "outputSchema": {
    "description": "define whatever fields make sense for this specific block type. Each field should describe what it contains. There are no required fields — design the schema purely based on what the user wants to see on their card. Include a tags array if relevant."
  }
}
The outputSchema should be designed specifically for the user's request.
For example, a Thirukural block might have: kural_tamil, kural_transliteration, meaning_tamil, meaning_english, meaning_japanese, chapter, number, tags.
A Japanese vocab block might have: word, reading, meaning, example_sentence, tags.
A stoic quote block might have: quote, author, reflection, tags.
Design it to match exactly what the user described.
Return only valid JSON. No extra text.`;

  const raw = await callGroq(systemPrompt, userDescription, 0.4);
  return parseJSON(raw);
};

const generateCard = async (promptTemplate, recentOriginals = []) => {
  const historyContext =
    recentOriginals.length > 0
      ? `\n\nDo NOT repeat any of these previously generated entries:\n${recentOriginals.map((o, i) => `${i + 1}. ${o}`).join("\n")}`
      : "";

  const userMessage = `Generate one unique card for today.${historyContext}\n\nReturn only valid JSON matching the outputSchema. No extra text.`;

  const raw = await callGroq(promptTemplate.systemPrompt, userMessage, 0.8);
  return parseJSON(raw);
};

module.exports = { callGroq, generatePromptTemplate, generateCard, parseJSON };
