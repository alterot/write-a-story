import { useState } from 'react'
import './App.css'
import InputArea from './components/InputArea'
import WorkArea from './components/WorkArea'

function App() {
  const [isWorking, setIsWorking] = useState(false)
  const [workSteps, setWorkSteps] = useState([])

  const handleCreateStory = (userInput) => {
    console.log('Skapar saga om:', userInput)
    setIsWorking(true)
    
    // Simulera ett arbetsflöde
    const steps = [
      { agentId: 'stella', taskId: 'planning', duration: 2000 },
      { agentId: 'luna', taskId: 'writing', duration: 3000 },
      { agentId: 'pixel', taskId: 'drawing', duration: 3000 },
      { agentId: 'nova', taskId: 'reviewing', duration: 2000 },
      { agentId: 'stella', taskId: 'done', duration: 1000 }
    ]
    
    setWorkSteps(steps)
    
    // Efter alla steg är klara
    setTimeout(() => {
      setIsWorking(false)
      alert(`Saga klar! Om: "${userInput}"`)
    }, 12000) // Total tid för alla steg
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
        </div>
      </main>

      <footer className="app-footer">
        <p>Gjord med ❤️ för barn</p>
      </footer>
    </div>
  )
}

export default App