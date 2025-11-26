import './SafetyMessage.css'

function SafetyMessage({ originalRequest, transformedRequest, suggestions, onSelectSuggestion, onTryAgain, onClose }) {
  return (
    <div className="safety-overlay">
      <div className="safety-modal">
        <div className="safety-icon">🌟</div>
        <h2>Hmm, kan vi göra det lite roligare? 😊</h2>
        
        <p className="safety-message">
          Jag förstår att du vill ha en saga om "<strong>{originalRequest}</strong>", 
          men det kanske blir lite för spännande eller läskigt för de allra minsta!
        </p>

        {transformedRequest && (
          <div className="transformed-suggestion">
            <p>💡 Vad sägs om detta istället:</p>
            <button 
              className="suggestion-button big"
              onClick={() => onSelectSuggestion(transformedRequest)}
            >
              {transformedRequest}
            </button>
          </div>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="suggestions-box">
            <p>🎨 Eller något av dessa:</p>
            <div className="suggestions-grid">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  className="suggestion-button"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  {i + 1}. {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="safety-actions">
          <button className="btn-secondary" onClick={onTryAgain}>
            ✏️ Jag skriver om min idé
          </button>
          <button className="btn-close" onClick={onClose}>
            Stäng
          </button>
        </div>
      </div>
    </div>
  )
}

export default SafetyMessage