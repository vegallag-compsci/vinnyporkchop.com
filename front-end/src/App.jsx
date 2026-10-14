import Cursor from './components/Cursor.jsx'
import Wordmark from './components/Wordmark.jsx'
import { usePointer } from './hooks/usePointer.js'
import { useReducedMotion } from './hooks/useReducedMotion.js'
import { useThemeFlip } from './hooks/useThemeFlip.js'

function App() {
  const pointerRef = usePointer()
  const reducedMotion = useReducedMotion()
  const flipTheme = useThemeFlip(reducedMotion)

  return (
    <main
      className="stage"
      onClick={(event) => flipTheme(event.clientX, event.clientY)}
    >
      <Wordmark pointerRef={pointerRef} reducedMotion={reducedMotion} />
      <Cursor pointerRef={pointerRef} />
    </main>
  )
}

export default App
