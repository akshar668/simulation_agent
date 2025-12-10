import React, { useState } from 'react';
import { generateSimulationLayout } from '../services/geminiService';
import { SimulationConfig } from '../types';
import ThreeScene from './ThreeScene';
import { Play, RotateCw, Box } from 'lucide-react';

const SimulationBuilder: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<SimulationConfig | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const result = await generateSimulationLayout(prompt);
            setConfig(result);
        } catch (error) {
            console.error(error);
            alert("Failed to generate simulation layout. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Control Panel */}
            <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                        <Box className="w-5 h-5" />
                        Solution Architect
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Describe your industrial process (e.g., "A robotic arm picks items from a conveyor belt and places them on an AGV").
                    </p>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
                        placeholder="Enter process requirements..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <RotateCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        {loading ? 'Designing...' : 'Generate Simulation'}
                    </button>
                </div>

                {config && (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex-1 overflow-auto">
                        <h3 className="font-semibold text-lg mb-2 text-white">{config.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{config.description}</p>
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Asset List</h4>
                            {config.entities.map(e => (
                                <div key={e.id} className="flex justify-between items-center bg-gray-900 p-2 rounded text-sm">
                                    <span className="text-gray-300">{e.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${e.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                        {e.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3D Viewport */}
            <div className="lg:col-span-2 flex flex-col h-full">
                <ThreeScene config={config} />
                <div className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-sm text-gray-400">
                    <p>Use Left Click to Rotate • Right Click to Pan • Scroll to Zoom</p>
                </div>
            </div>
        </div>
    );
};

export default SimulationBuilder;
