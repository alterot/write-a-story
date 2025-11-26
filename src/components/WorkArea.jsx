import { useEffect, useState } from 'react'
import AgentAvatar from './AgentAvatar'
import TaskBox from './TaskBox'
import './WorkArea.css'

// Agent-definitioner
const AGENTS = [
  { id: 'stella', name: 'Stella', type: 'orchestrator', color: '#FFD700' },
  { id: 'luna', name: 'Luna', type: 'berättare', color: '#FF6B9D' },
  { id: 'pixel', name: 'Pixel', type: 'illustratör', color: '#4ECDC4' },
  { id: 'nova', name: 'Nova', type: 'regissör', color: '#A78BFA' }
]

// Task boxes (aktivitetsrutor)
const TASK_BOXES = [
  { id: 'start', title: 'Start', emoji: '🏠', position: { x: 400, y: 50 } },
  { id: 'planning', title: 'Planerar', emoji: '📋', position: { x: 400, y: 150 } },
  { id: 'writing', title: 'Skriver saga', emoji: '✍️', position: { x: 100, y: 300 } },
  { id: 'drawing', title: 'Skapar bilder', emoji: '🎨', position: { x: 400, y: 300 } },
  { id: 'reviewing', title: 'Granskar', emoji: '👀', position: { x: 700, y: 300 } },
  { id: 'done', title: 'Färdig!', emoji: '✅', position: { x: 400, y: 450 } }
]

function WorkArea({ isWorking, workSteps }) {
  const [agentPositions, setAgentPositions] = useState({})
  const [agentStatuses, setAgentStatuses] = useState({})
  const [activeTask, setActiveTask] = useState(null)

  // Sätt alla agenter till START-positionen i början
  useEffect(() => {
    const startPos = TASK_BOXES.find(box => box.id === 'start').position
    const initialPositions = {}
    const initialStatuses = {}
    
    AGENTS.forEach((agent, index) => {
      initialPositions[agent.id] = {
        x: startPos.x - 30 + (index * 20), // Lite offset så de inte överlappar
        y: startPos.y
      }
      initialStatuses[agent.id] = 'idle'
    })
    
    setAgentPositions(initialPositions)
    setAgentStatuses(initialStatuses)
  }, [])

  // Simulera arbetsflöde när isWorking är true
  useEffect(() => {
    if (!isWorking || !workSteps || workSteps.length === 0) return

    let stepIndex = 0
    const executeStep = () => {
      if (stepIndex >= workSteps.length) {
        // Alla steg klara!
        setActiveTask(null)
        return
      }

      const step = workSteps[stepIndex]
      const taskBox = TASK_BOXES.find(box => box.id === step.taskId)
      
      // Sätt active task
      setActiveTask(step.taskId)
      
      // Flytta agent till task
      // Hitta agent index för offset
      const agentIndex = AGENTS.findIndex(a => a.id === step.agentId)
      const offset = agentIndex * 25 // 25px mellan varje agent

      setAgentPositions(prev => ({
      ...prev,
      [step.agentId]: {
          x: taskBox.position.x - 30 + offset,
          y: taskBox.position.y
      }
      }))
      
      // Sätt agent som working
      setAgentStatuses(prev => ({
        ...prev,
        [step.agentId]: 'working'
      }))

      // Vänta en stund, sen nästa steg
      setTimeout(() => {
        setAgentStatuses(prev => ({
          ...prev,
          [step.agentId]: 'done'
        }))
        
        stepIndex++
        setTimeout(executeStep, 500)
      }, step.duration || 2000)
    }

    executeStep()
  }, [isWorking, workSteps])

  return (
    <div className="work-area">
      <div className="work-canvas">
        {/* Rita task boxes */}
        {TASK_BOXES.map(box => (
          <TaskBox
            key={box.id}
            id={box.id}
            title={box.title}
            emoji={box.emoji}
            position={box.position}
            active={activeTask === box.id}
          />
        ))}

        {/* Rita agenter */}
        {AGENTS.map(agent => (
          <AgentAvatar
            key={agent.id}
            name={agent.name}
            type={agent.type}
            color={agent.color}
            position={agentPositions[agent.id] || { x: 0, y: 0 }}
            status={agentStatuses[agent.id] || 'idle'}
          />
        ))}
      </div>
    </div>
  )
}

export default WorkArea