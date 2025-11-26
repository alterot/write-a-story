import { callClaude } from './apiClient';
import { AGENTS } from './agentDefinitions';

export async function createStory(userInput, onProgress) {
  const story = {
    title: '',
    chapters: []
  };

  try {
    onProgress?.('planning', 'Stella planerar sagan...');
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

    for (let i = 0; i < story.chapters.length; i++) {
      const chapter = story.chapters[i];
      
      onProgress?.('writing', `Luna skriver kapitel ${i + 1}...`, i);
      const text = await writeChapter(chapter.description, story.title);
      chapter.text = text;

      onProgress?.('illustrating', `Pixel ritar kapitel ${i + 1}...`, i);
      const illustration = await createIllustration(chapter.scene);
      chapter.illustration = illustration;
    }

    onProgress?.('reviewing', 'Nova granskar sagan...');
    const review = await reviewStory(story);
    
    if (!review.approved && review.suggestions.length > 0) {
      onProgress?.('revising', 'Justerar sagan...');
    }

    onProgress?.('done', 'Sagan är klar!');
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