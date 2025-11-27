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
    
    // ⚠️ NYTT: Kolla om innehållet var olämpligt
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

// Nova går till reviewing och väntar
onProgress?.('agent:move', {
  agentId: 'nova',
  toTask: 'reviewing',
  bubble: '⏳ Redo att granska...'
});

for (let i = 0; i < story.chapters.length; i++) {
  const chapter = story.chapters[i];
  
  // Luna skriver
  onProgress?.('agent:move', {
    agentId: 'luna',
    toTask: 'writing',
    bubble: `📖 Skriver kapitel ${i + 1}...`
  });
  const text = await writeChapter(chapter.description, story.title);
  chapter.text = text;

  // Luna går till Nova med texten
  onProgress?.('agent:move', {
    agentId: 'luna',
    toTask: 'reviewing',
    bubble: `✅ Kapitel ${i + 1} skrivet!`
  });

// TA BORT TEMPORÄRT FÖR ATT SPARA TOKENS

  // Pixel ritar
/*   onProgress?.('agent:move', {
    agentId: 'pixel',
    toTask: 'drawing',
    bubble: `🎨 Ritar kapitel ${i + 1}...`
  });
  const illustration = await createIllustration(chapter.scene);
  chapter.illustration = illustration;

  // Pixel går till Nova med bilden
  onProgress?.('agent:move', {
    agentId: 'pixel',
    toTask: 'reviewing',
    bubble: `✅ Illustration ${i + 1} klar!`
  }); */
}

// EFTER loopen - Nova granskar allt
onProgress?.('agent:bubble', {
  agentId: 'nova',
  bubble: '👀 Granskar hela sagan...'
});

const review = await reviewStory(story);

if (!review.approved && review.suggestions.length > 0) {
  onProgress?.('agent:bubble', {
    agentId: 'nova',
    bubble: '💭 Behöver justeringar...'
  });
  // TODO: Iteration kommer här!
}

onProgress?.('agent:move', {
  agentId: 'stella',
  toTask: 'done',
  bubble: '✨ Sagan är klar!'
});

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

async function createIllustration(sceneDescription) {
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
}

async function reviewStory(story) {
  const prompt = `Granska denna saga:
Titel: ${story.title}
Antal kapitel: ${story.chapters.length}
Första kapitlet: ${story.chapters[0]?.text}

Är den lämplig för barn 5-8 år?`;

  const response = await callClaude(AGENTS.reviewer.systemPrompt, prompt);
  
  try {
    const cleaned = response.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Parse error:', e);
    return {
      approved: true,
      feedback: 'Looks good!',
      suggestions: []
    };
  }
}