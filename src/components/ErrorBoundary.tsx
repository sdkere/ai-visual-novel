import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('Render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-gray-300 mb-4">页面加载出错</p>
            <button
              onClick={() => {
                localStorage.removeItem('visual-novel-game-state')
                window.location.reload()
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition"
            >
              清除缓存并刷新
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
