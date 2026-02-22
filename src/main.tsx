import React from 'react'
import ReactDOM from 'react-dom/client'

import { setupIonicReact } from '@ionic/react'

import '@/shared/theme/typography.css'
import '@/shared/theme/global.css'

import App from './App'

setupIonicReact()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
