import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

// No StrictMode: the GSAP master timeline is built imperatively and we
// want a single, stable instance driving the deterministic composition.
createRoot(document.getElementById('root')!).render(<App />)
