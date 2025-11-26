import { useState } from 'react'
import './InputArea.css'

function InputArea({ onSubmit, isLoading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input)
      setInput('') // Rensa input efter submit
    }
  }

  return (
    <div className="input-area">
      <h2>Vad vill du ha för saga?</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Skriv din idé här... till exempel: 'En saga om en rymdkatt som älskar pizza'"
          disabled={isLoading}
          rows={4}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? '⏳ Agenterna arbetar...' : '✨ Skapa saga!'}
        </button>
      </form>
    </div>
  )
}

export default InputArea