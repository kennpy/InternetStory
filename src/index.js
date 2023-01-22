import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // renders twice in strict mode --> queries data twice and doubles our initial wordlist state
 // <React.StrictMode>
    <App />
 // </React.StrictMode>
);
