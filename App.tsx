import React, { useState, useEffect } from 'react';
import SimulationBuilder from './components/SimulationBuilder';
import ImageTools from './components/ImageTools';
import { Box, Layers, Image as ImageIcon, Key, AlertTriangle } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'simulation' | 'media'>('simulation');
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        } catch (e) {
            console.error("Error checking API key status:", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // As per instructions, assume success immediately after opening logic
            setHasApiKey(true);
        } catch (e) {
            console.error("Error selecting API key:", e);
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Industrial<span className="text-blue-400">AI</span> Architect</h1>
          </div>
          
          <nav className="flex bg-gray-900 rounded-lg p-1">
            <button
                onClick={() => setCurrentView('simulation')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentView === 'simulation' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
                <Box className="w-4 h-4" />
                Simulation Builder
            </button>
            <button
                onClick={() => setCurrentView('media')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentView === 'media' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
                <ImageIcon className="w-4 h-4" />
                Media Studio
            </button>
          </nav>
        </div>
      </header>

      {/* API Key Warning Banner */}
      {!hasApiKey && (
        <div className="bg-yellow-900/40 border-b border-yellow-700/50 px-6 py-4 backdrop-blur-sm">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <span className="text-sm font-medium">Authentication required. Please select a Google Cloud Project with Gemini API enabled to use AI features.</span>
            </div>
            <button 
              onClick={handleSelectKey}
              className="whitespace-nowrap bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-yellow-900/20"
            >
              <Key className="w-4 h-4" />
              Select API Key
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8 overflow-hidden">
        {currentView === 'simulation' ? <SimulationBuilder /> : <ImageTools />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 bg-gray-900 text-center text-gray-500 text-sm">
        <p>© 2024 Industrial AI Architect. Powered by Gemini 2.5 & Veo.</p>
      </footer>
    </div>
  );
}

export default App;