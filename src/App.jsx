import { useState } from 'react'
import './App.css'
import InputArea from './components/InputArea'
import WorkArea from './components/WorkArea'
import { createStory } from './agents/orchestrator'
import SafetyMessage from './components/SafetyMessage'

function App() {
  const [isWorking, setIsWorking] = useState(false)
  const [workSteps, setWorkSteps] = useState([])
  const [story, setStory] = useState(null)
  const [showSafetyMessage, setShowSafetyMessage] = useState(false)
  const [safetyData, setSafetyData] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSelectSuggestion = (suggestion) => {
  setShowSafetyMessage(false)
  setSafetyData(null)
  handleCreateStory(suggestion)     
  }

  const handleTryAgain = () => {
    setShowSafetyMessage(false)
    setSafetyData(null)
  }

  const handleCreateStory = async (userInput) => {
    console.log('Skapar saga om:', userInput)
    setIsWorking(true)
    setStory(null)
    setWorkSteps([])

  const progressCallback = (eventType, eventData) => {
    console.log('📢 Event:', eventType, eventData);
    
    if (eventType === 'agent:move') {
      setWorkSteps(prev => [...prev, {
        agentId: eventData.agentId,
        taskId: eventData.toTask,
        bubble: eventData.bubble
      }]);
      
    if (eventData.toTask === 'done' && eventData.agentId === 'stella') {
      setTimeout(() => {
        setShowSuccess(true);
      }, 1000);
    }
    }
    
    if (eventType === 'agent:bubble') {
      
      //Lägg även till i workSteps så agent-bubblan uppdateras!
      setWorkSteps(prev => [...prev, {
        agentId: eventData.agentId,
        taskId: null, // Ingen förflyttning
        bubble: eventData.bubble,
        bubbleOnly: true // Markera att det bara är bubbla
      }]);
    }
  }
    try {
      const result = await createStory(userInput, progressCallback)
      
      //Kolla om innehållet var olämpligt
      if (result.unsafe) {
        setSafetyData(result)
        setShowSafetyMessage(true)
        setIsWorking(false)
        return
      }
      
      setStory(result)
      console.log('Saga klar!', result)
      
    } catch (error) {
      console.error('Fel vid skapande:', error)
      alert('Något gick fel! Kolla consolen.')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Skriv en Saga 🌟</h1>
        <p>Skapa sagor tillsammans med robotarna Stella, Luna, Pixel och Nova!</p>
      </header>
      <div className="agent-legend">
      <div className="legend-agent">
        <div className="legend-avatar-box" style={{ backgroundColor: '#FFD700', borderColor: 'black' }}>
          <div className="legend-avatar-face">
            <div className="legend-avatar-eyes">
              <span className="legend-eye"></span>
              <span className="legend-eye"></span>
            </div>
            <div className="legend-avatar-emoji">🎭</div>
          </div>
        </div>
        <div className="legend-info">
          <div className="legend-name">Stella</div>
          <div className="legend-role">Planerar</div>
        </div>
      </div>

      <div className="legend-agent">
        <div className="legend-avatar-box" style={{ backgroundColor: '#A78BFA', borderColor: 'black' }}>
          <div className="legend-avatar-face">
            <div className="legend-avatar-eyes">
              <span className="legend-eye"></span>
              <span className="legend-eye"></span>
            </div>
            <div className="legend-avatar-emoji">⭐</div>
          </div>
        </div>
        <div className="legend-info">
          <div className="legend-name">Nova</div>
          <div className="legend-role">Kontrollerar</div>
        </div>
      </div>      

      <div className="legend-agent">
        <div className="legend-avatar-box" style={{ backgroundColor: '#FF6B9D', borderColor: 'black' }}>
          <div className="legend-avatar-face">
            <div className="legend-avatar-eyes">
              <span className="legend-eye"></span>
              <span className="legend-eye"></span>
            </div>
            <div className="legend-avatar-emoji">📖</div>
          </div>
        </div>
        <div className="legend-info">
          <div className="legend-name">Luna</div>
          <div className="legend-role">Skriver</div>
        </div>
      </div>

      <div className="legend-agent">
        <div className="legend-avatar-box" style={{ backgroundColor: '#4ECDC4', borderColor: 'black' }}>
          <div className="legend-avatar-face">
            <div className="legend-avatar-eyes">
              <span className="legend-eye"></span>
              <span className="legend-eye"></span>
            </div>
            <div className="legend-avatar-emoji">🎨</div>
          </div>
        </div>
        <div className="legend-info">
          <div className="legend-name">Pixel</div>
          <div className="legend-role">Ritar</div>
        </div>
      </div>


    </div>

     <main className="app-main">
      <div className="content">
        <InputArea 
          onSubmit={handleCreateStory}
          isLoading={isWorking}
        />
        
        <WorkArea 
          isWorking={isWorking}
          workSteps={workSteps}
        />

        {story && (
          <div className="story-display">
            <div className="story-header">
              <h2>✨ {story.title}</h2>
              <p className="chapter-count">{story.chapters.length} kapitel</p>
            </div>
            
            <div className="chapters-container">
              {story.chapters.map((chapter, index) => (
                <div key={index} className="chapter-card">
                  <div className="chapter-number">Kapitel {index + 1}</div>
                  
                  {/* Illustration */}
                  {chapter.illustration?.html && (
                    <div className="chapter-illustration">
                      <style>{chapter.illustration.css}</style>
                      <div dangerouslySetInnerHTML={{ __html: chapter.illustration.html }} />
                    </div>
                  )}
                  
                  <p className="chapter-text">{chapter.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {showSuccess && story && (
          <div className="success-overlay">
            <div className="success-card">
              <h2>🎉 Sagan är klar!</h2>
              <h3>{story.title}</h3>
              <p>{story.chapters.length} kapitel</p>
              <div className="success-buttons">
                <button onClick={() => {
                  setShowSuccess(false);
                  // Scrolla till sagan
                  setTimeout(() => {
                    document.querySelector('.story-display')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }, 100);
                }}>
                  📖 Läs sagan
                </button>
                <button onClick={() => {
                  window.location.reload();
                }}>
                  ✨ Skapa ny saga
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ✅ SafetyMessage ska vara HÄR, UTANFÖR alla andra villkor */}
        {showSafetyMessage && safetyData && (
          <SafetyMessage
            originalRequest={safetyData.originalRequest}
            transformedRequest={safetyData.transformedRequest}
            suggestions={safetyData.suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            onTryAgain={handleTryAgain}
            onClose={handleTryAgain}
          />
        )}
      </div>
    </main>
      <footer className="app-footer">
        <p>
          Skapad av <a href="mailto:max.alterot@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>m.alterot</a> (fast mest av Claude helt ärligt...) 
          <a href="https://github.com/alterot/write-a-story" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>. Källkod finnes här</a>
        </p>
      </footer>
    </div>
  )
}

export default App