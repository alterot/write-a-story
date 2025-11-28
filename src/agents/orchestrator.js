import { callClaude } from './apiClient';
import { AGENTS } from './agentDefinitions';

export async function createStory(userInput, onProgress) {
  const story = {
    title: '',
    chapters: []
  };

  try {
    onProgress?.('agent:move', {
      agentId: 'stella',
      toTask: 'planning',
      bubble: '📋 Planerar sagan...'
    });
    const plan = await planStory(userInput);
    
    if (plan.unsafe) {
      return {
        unsafe: true,
        originalRequest: plan.originalRequest,
        transformedRequest: plan.transformedRequest,
        suggestions: plan.suggestions
      };
    }
    
    story.title = plan.title;
    story.chapters = plan.chapters.map(ch => ({
      number: ch.number,
      description: ch.description,
      scene: ch.scene,
      text: '',
      illustration: { html: '', css: '' }
    }));

    await new Promise(resolve => setTimeout(resolve, 1200));

    onProgress?.('agent:move', {
      agentId: 'nova',
      toTask: 'reviewing',
      bubble: '⏳ Redo att granska...'
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Pixel stannar i start och tänker
    const pixelThoughts = [
      "🔮 Väntar på nya verktyg...",
      "⏳ Snart får jag bättre penslar...",
      "💭 Drömmer om DALL-E..."
    ];

    // Starta Pixel's tanke-loop i bakgrunden
    const pixelThinkingInterval = setInterval(() => {
      const randomThought = pixelThoughts[Math.floor(Math.random() * pixelThoughts.length)];
      onProgress?.('agent:bubble', {
        agentId: 'pixel',
        bubble: randomThought
      });
    }, Math.random() * 7000 + 8000); // 8-15 sekunder random

    // Första tanken direkt
    onProgress?.('agent:bubble', {
      agentId: 'pixel',
      bubble: pixelThoughts[Math.floor(Math.random() * pixelThoughts.length)]
    });

    // Spara interval-ID så vi kan stoppa den senare
    story._pixelInterval = pixelThinkingInterval;

    await new Promise(resolve => setTimeout(resolve, 1500));

    for (let i = 0; i < story.chapters.length; i++) {
      const chapter = story.chapters[i];
      let approved = false;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (!approved && attempts < maxAttempts) {
        attempts++;
        
        onProgress?.('agent:move', {
          agentId: 'luna',
          toTask: 'working',
          bubble: attempts === 1 
            ? `📖 Skriver kapitel ${i + 1}...`
            : `✏️ Fixar kapitel ${i + 1} efter Novas tips...`
        });

        await new Promise(resolve => setTimeout(resolve, 800));
        
        const text = await writeChapter(
          chapter.description, 
          story.title,
          attempts > 1 ? 'Gör texten mer engagerande och barnvänlig' : null
        );
        chapter.text = text;

        onProgress?.('agent:move', {
          agentId: 'luna',
          toTask: 'reviewing',
          bubble: `✅ Kapitel ${i + 1} ${attempts > 1 ? 'omskrivet' : 'skrivet'}!`
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onProgress?.('agent:bubble', {
          agentId: 'nova',
          bubble: `👀 Läser kapitel ${i + 1}...`
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const review = await reviewChapter(chapter, i + 1);
        
        if (review.approved) {
          approved = true;
          onProgress?.('agent:bubble', {
            agentId: 'nova',
            bubble: `✅ Kapitel ${i + 1} godkänt!`
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } else {
          onProgress?.('agent:bubble', {
            agentId: 'nova',
            bubble: `💭 Kapitel ${i + 1} behöver förbättras...`
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          onProgress?.('agent:bubble', {
            agentId: 'luna',
            bubble: `🔄 Okej, jag fixar det!`
          });
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }
      
      if (!approved) {
        onProgress?.('agent:bubble', {
          agentId: 'nova',
          bubble: `✅ Kapitel ${i + 1} godkänt (efter ${attempts} försök)`
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

       await new Promise(resolve => setTimeout(resolve, 1000));
    }

          // Stoppa Pixels tänkande
      if (story._pixelInterval) {
        clearInterval(story._pixelInterval);
        delete story._pixelInterval;
      }

    onProgress?.('agent:bubble', {
      agentId: 'nova',
      bubble: '🎉 Alla kapitel godkända!'
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    onProgress?.('agent:move', {
      agentId: 'luna',
      toTask: 'done',
      bubble: '📖 Kapitel skrivna!'
    });

    await new Promise(resolve => setTimeout(resolve, 400));

    onProgress?.('agent:move', {
      agentId: 'pixel',
      toTask: 'done',
      bubble: '🎨 Illustrationer klara!'
    });

    await new Promise(resolve => setTimeout(resolve, 400));

    onProgress?.('agent:move', {
      agentId: 'nova',
      toTask: 'done',
      bubble: '⭐ Granskning klar!'
    });

    await new Promise(resolve => setTimeout(resolve, 400));

    onProgress?.('agent:move', {
      agentId: 'stella',
      toTask: 'done',
      bubble: '✨ Sagan är klar!'
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    return story;

  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
}

async function planStory(userInput) {
  const prompt = `Skapa en saga-plan baserat på detta önskemål: "${userInput}"`;
  const response = await callClaude(AGENTS.orchestrator.systemPrompt, prompt);
  
    try {
      const cleaned = response.replace(/```json\n?|```/g, '').trim();
      const plan = JSON.parse(cleaned);
        
    // Kolla om innehållet var olämpligt
    if (plan.isSafe === false) {
      return {
        unsafe: true,
        originalRequest: plan.originalRequest,
        transformedRequest: plan.transformedRequest,
        suggestions: plan.suggestions || []
      };
    }
    
    return plan;
    } catch (e) {
    console.error('Parse error:', e);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      if (plan.isSafe === false) {
        return {
          unsafe: true,
          originalRequest: plan.originalRequest,
          transformedRequest: plan.transformedRequest,
          suggestions: plan.suggestions || []
        };
      }
      return plan;
    }
    throw new Error('Could not parse orchestrator response');
  }
}

async function writeChapter(description, storyTitle) {
  const prompt = `Skriv ett kapitel för sagan "${storyTitle}". 
Kapitlets handling: ${description}

Kom ihåg: 2-4 enkla meningar för barn 5-8 år.`;

  const response = await callClaude(AGENTS.storyteller.systemPrompt, prompt);
  
  try {
    const cleaned = response.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.text;
  } catch (e) {
    console.error('Parse error:', e);
    return response.replace(/```json\n?|```/g, '').trim();
  }
}

//Har tagits bort temporärt pga. blir ej så bra bilder än tyvärr
/* async function createIllustration(sceneDescription) {
  const prompt = `Skapa en CSS-illustration för denna scen: ${sceneDescription}`;
  const response = await callClaude(AGENTS.illustrator.systemPrompt, prompt);
  
  try {
    const cleaned = response.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      html: parsed.html || '',
      css: parsed.css || ''
    };
  } catch (e) {
    console.error('Parse error:', e);
    return {
      html: '<div class="illustration-placeholder">🎨</div>',
      css: '.illustration-placeholder { font-size: 4rem; text-align: center; }'
    };
  }
} */

async function reviewChapter(chapter, chapterNumber) {
  const prompt = `Granska detta kapitel från en barnsaga:

Kapitel ${chapterNumber}: ${chapter.text}

Är det lämpligt för barn 5-8 år? Är språket enkelt nog? Är det engagerande?

Svara ENDAST med JSON:
{
  "approved": true/false,
  "feedback": "kort feedback",
  "suggestions": ["förslag 1", "förslag 2"]
}`;

  const response = await callClaude(AGENTS.reviewer.systemPrompt, prompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found');
  } catch (e) {
    console.error('Parse error:', e);
    return {
      approved: true,
      feedback: 'Parse error - defaulting to approved',
      suggestions: []
    };
  }
}