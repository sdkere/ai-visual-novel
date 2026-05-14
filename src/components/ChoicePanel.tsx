import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

export default function ChoicePanel() {
  const { choices, selectChoice, isLoading } = useGameStore()

  const handleChoice = (choice: string) => {
    if (!isLoading) {
      selectChoice(choice)
    }
  }

  return (
    <div className="choices-container pb-6">
      <div className="text-center mb-3">
        <span className="text-purple-400 text-sm">做出你的选择</span>
      </div>
      {choices.map((choice, index) => (
        <motion.button
          key={choice}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 }}
          className="choice-button"
          onClick={() => handleChoice(choice)}
          disabled={isLoading}
        >
          <span className="text-purple-400 mr-2">{index + 1}.</span>
          {choice}
        </motion.button>
      ))}
    </div>
  )
}
