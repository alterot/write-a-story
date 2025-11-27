import './AgentAvatar.css'

function AgentAvatar({ name, type, color, position, status, bubble }) {
  // Olika emojis baserat på agent-typ
  const getEmoji = () => {
    switch(type) {
      case 'orchestrator': return '🎭'
      case 'berättare': return '📖'
      case 'illustratör': return '🎨'
      case 'regissör': return '⭐'
      default: return '🤖'
    }
  }

  const getBubbleClass = () => {
    if (type === 'regissör') return 'bubble-right';
    return 'bubble-left';
};

  return (
    <div 
      className={`agent-avatar ${status}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        borderColor: color
      }}
      title={name}
    >
      <div className="avatar-body" style={{ backgroundColor: color }}>
        <div className="avatar-face">
          <div className="avatar-eyes">
            <span className="eye"></span>
            <span className="eye"></span>
          </div>
          <div className="avatar-emoji">{getEmoji()}</div>
        </div>
      </div>
      
      {/* Speech bubble */}
      {bubble && (
        <div className={`speech-bubble ${getBubbleClass()}`}>
          {bubble}
        </div>
      )}
    </div>
  )
}

export default AgentAvatar