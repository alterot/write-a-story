import './AgentAvatar.css'

function AgentAvatar({ name, type, color, position, status }) {
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
      <div className="avatar-name">{name}</div>
      {status === 'working' && (
        <div className="working-indicator">💭</div>
      )}
    </div>
  )
}

export default AgentAvatar