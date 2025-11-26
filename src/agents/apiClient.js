const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function callClaude(systemPrompt, userMessage, onStream = null) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
       'anthropic-dangerous-direct-browser-access': 'true' 
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      stream: !!onStream
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  if (!onStream) {
    const data = await response.json();
    return data.content[0].text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta') {
            const text = parsed.delta?.text || '';
            fullText += text;
            if (onStream) onStream(text, fullText);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return fullText;
}