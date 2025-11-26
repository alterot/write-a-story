import { useState } from 'react'
import './App.css'
import InputArea from './components/InputArea'

function App() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateStory = (userInput) => {
    console.log('Användaren vill ha en saga om:', userInput)
    setIsLoading(true)
    
    // Simulera att något händer (tar bort senare)
    setTimeout(() => {
      setIsLoading(false)
      alert(`Bra! Du vill ha en saga om: "${userInput}"`)
    }, 2000)
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
            isLoading={isLoading}
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