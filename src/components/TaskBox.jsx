import './TaskBox.css'

function TaskBox({ id, title, emoji, position, active }) {
  return (
    <div 
      className={`task-box ${active ? 'active' : ''}`}
      data-id={id}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="task-emoji">{emoji}</div>
      <div className="task-title">{title}</div>
      {active && <div className="active-pulse"></div>}
    </div>
  )
}

export default TaskBox