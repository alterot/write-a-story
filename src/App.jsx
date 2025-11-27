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
      }, 4000);
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
        <h1>🌟 Saga-Boken</h1>
        <p>Skapa magiska sagor tillsammans med AI-agenter!</p>
      </header>

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
          <div className="story-preview">
            <h2>✨ {story.title}</h2>
            <p>Antal kapitel: {story.chapters.length}</p>
            <details>
              <summary>Visa första kapitlet</summary>
              <p>{story.chapters[0]?.text}</p>
            </details>
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
                  // TODO: Öppna BookReader här senare
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
        <p>Gjord med ❤️ för barn</p>
      </footer>
    </div>
  )
}

export default App