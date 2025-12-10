import React, { useState, useRef } from 'react';
import { editImageWithGemini, generateVideoWithVeo } from '../services/geminiService';
import { Image as ImageIcon, Video, Wand2, Upload, AlertCircle } from 'lucide-react';

const ImageTools: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'edit' | 'video'>('edit');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setResultUrl(null);
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreviewUrl(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // remove data:image/xxx;base64, prefix
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleAction = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setResultUrl(null);

        try {
            const base64 = await convertToBase64(selectedFile);
            const mimeType = selectedFile.type;

            if (activeTab === 'edit') {
                if (!prompt) {
                    alert("Please enter a prompt for editing.");
                    setLoading(false);
                    return;
                }
                const result = await editImageWithGemini(base64, mimeType, prompt);
                setResultUrl(result);
            } else {
                // Veo Video Generation
                // Check for API Key selection first as per requirement
                if (window.aistudio && window.aistudio.openSelectKey) {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    if (!hasKey) {
                        await window.aistudio.openSelectKey();
                    }
                }
                
                const result = await generateVideoWithVeo(base64, mimeType);
                setResultUrl(result);
            }
        } catch (error) {
            console.error(error);
            alert(`Operation failed: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                        activeTab === 'edit' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    <ImageIcon className="w-5 h-5" />
                    <span>AI Image Editor (Nano Banana)</span>
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                        activeTab === 'video' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    <Video className="w-5 h-5" />
                    <span>Veo Video Generator</span>
                </button>
            </div>

            <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 p-8 flex flex-col gap-6">
                
                {/* Upload Section */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-700/50 transition-colors h-48"
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>Click to upload a source image</p>
                            <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4">
                    {activeTab === 'edit' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Editing Instruction</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'Add a yellow safety helmet', 'Make it look futuristic'"
                                    className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <button
                                    onClick={handleAction}
                                    disabled={loading || !selectedFile}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-bold flex items-center gap-2"
                                >
                                    {loading ? <Wand2 className="animate-spin" /> : <Wand2 />}
                                    Edit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-semibold text-pink-400 mb-1">Veo Video Generation</p>
                                    <p>This generates a 720p video based on your image. It may take a minute. <br/>You will be asked to select a paid API key.</p>
                                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-pink-400 underline hover:text-pink-300">Billing Info</a>
                                </div>
                            </div>
                            <button
                                onClick={handleAction}
                                disabled={loading || !selectedFile}
                                className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                            >
                                {loading ? <Wand2 className="animate-spin" /> : <Video />}
                                {loading ? 'Generating Animation...' : 'Animate with Veo'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {resultUrl && (
                    <div className="mt-4 border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-white">Generated Result</h3>
                        <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center">
                            {activeTab === 'edit' ? (
                                <img src={resultUrl} alt="Edited Result" className="max-h-[400px] w-auto" />
                            ) : (
                                <video controls autoPlay loop className="max-h-[400px] w-auto">
                                    <source src={resultUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageTools;
