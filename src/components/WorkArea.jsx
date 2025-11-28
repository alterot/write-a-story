import { useEffect, useState, useRef } from 'react'
import AgentAvatar from './AgentAvatar'
import TaskBox from './TaskBox'
import './WorkArea.css'

// Agent-definitioner
const AGENTS = [
  { id: 'stella', name: 'Stella', type: 'orchestrator', color: '#FFD700' },
  { id: 'nova', name: 'Nova', type: 'regissör', color: '#A78BFA' },
  { id: 'luna', name: 'Luna', type: 'berättare', color: '#FF6B9D' },
  { id: 'pixel', name: 'Pixel', type: 'illustratör', color: '#4ECDC4' }
]

// Task boxes (aktivitetsrutor)
const TASK_BOXES = [
  { id: 'start', title: 'Start', emoji: '🏠', position: { x: 275, y: 25 } },
  { id: 'planning', title: 'Planerar', emoji: '📋', position: { x: 575, y: 25 } },
  { id: 'working', title: 'Skapar', emoji: '⚡', position: { x: 175, y: 225 } },
  { id: 'reviewing', title: 'Granskar', emoji: '👀', position: { x: 675, y: 225 } },
  { id: 'done', title: 'Klar!', emoji: '🎉', position: { x: 425, y: 410 } }
]
function WorkArea({ isWorking, workSteps }) {
  const [agentPositions, setAgentPositions] = useState({})
  const [agentStatuses, setAgentStatuses] = useState({})
  const [agentBubbles, setAgentBubbles] = useState({})  
  const [activeTask, setActiveTask] = useState(null)

  // Sätt alla agenter till START-positionen i början
  useEffect(() => {
    const startPos = TASK_BOXES.find(box => box.id === 'start').position
    const initialPositions = {}
    const initialStatuses = {}
    
    const yOffsets = {
      'stella': 0,
      'nova': 35,
      'luna': 70,
      'pixel': 105
    }
    
      AGENTS.forEach((agent) => {
        initialPositions[agent.id] = {
          x: 290,
          y: startPos.y + (yOffsets[agent.id] || 0)
        }
        initialStatuses[agent.id] = 'idle'
      })
    
    setAgentPositions(initialPositions)
    setAgentStatuses(initialStatuses)
  }, [])

  // Simulera arbetsflöde när isWorking är true
const executingRef = useRef(false);

useEffect(() => {
  if (!isWorking || !workSteps || workSteps.length === 0) return;
  if (executingRef.current) return;
  
  executingRef.current = true;
  let stepIndex = 0;
  
  const executeStep = () => {
    if (stepIndex >= workSteps.length) {
      setActiveTask(null);
      executingRef.current = false;
      return;
    }

    const step = workSteps[stepIndex];
    
    // Om det bara är en bubbla (ingen förflyttning)
    if (step.bubbleOnly) {
      if (step.bubble) {
        setAgentBubbles(prev => ({
          ...prev,
          [step.agentId]: step.bubble
        }));
      }
      stepIndex++;
      executeStep();
      return;
    }
    
    // Annars normal förflyttning...
    const taskBox = TASK_BOXES.find(box => box.id === step.taskId);
    
    setActiveTask(step.taskId);
    
    const yOffsets = {
      'stella': 0,
      'nova': 35,
      'luna': 70,
      'pixel': 105
    }

    setAgentPositions(prev => ({
      ...prev,
      [step.agentId]: {
        x: taskBox.position.x,
        y: taskBox.position.y + (yOffsets[step.agentId] || 0)
      }
    }));
    
    setAgentStatuses(prev => ({
      ...prev,
      [step.agentId]: 'working'
    }));

    if (step.bubble) {
      setAgentBubbles(prev => ({
        ...prev,
        [step.agentId]: step.bubble
      }));
    }

    // Nästa steg direkt (orchestrator äger timingen!)
    stepIndex++;
    executeStep();
  };

  executeStep();
}, [isWorking, workSteps]);

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
            bubble={agentBubbles[agent.id]}
          />
        ))}
      </div>
    </div>
  )
}

export default WorkArea