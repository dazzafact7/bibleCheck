// In deiner main.jsx oder index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Stelle sicher, dass hier .jsx steht
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)