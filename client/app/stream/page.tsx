'use client'
import React, { useRef, useState, useEffect } from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Monitor,
  Smartphone,
  Camera,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Play,
  Square
} from 'lucide-react';

const StreamPage: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streaming, setStreaming] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [streamTitle, setStreamTitle] = useState('');
    const [streamDescription, setStreamDescription] = useState('');
    const [viewers, setViewers] = useState(0);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState<Array<{id: string, user: string, text: string, timestamp: Date}>>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const [streamStats, setStreamStats] = useState({
        duration: 0,
        quality: '1080p',
        bitrate: '2500 kbps',
        fps: 30
    });

    useEffect(() => {
        // Get available cameras
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const cameras = devices.filter(device => device.kind === 'videoinput');
                setAvailableCameras(cameras);
                if (cameras.length > 0 && !selectedCamera) {
                    setSelectedCamera(cameras[0].deviceId);
                }
            });

        // Simulate viewer count changes
        const viewerInterval = setInterval(() => {
            if (isLive) {
                setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
            }
        }, 3000);

        // Stream duration timer
        const durationInterval = setInterval(() => {
            if (isLive) {
                setStreamStats(prev => ({
                    ...prev,
                    duration: prev.duration + 1
                }));
            }
        }, 1000);

        return () => {
            clearInterval(viewerInterval);
            clearInterval(durationInterval);
        };
    }, [isLive, selectedCamera]);

    const startStream = async () => {
        setError(null);
        try {
            const constraints = {
                video: {
                    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setStreaming(true);
            setIsLive(true);
            setViewers(Math.floor(Math.random() * 50) + 10);
        } catch (err) {
            setError("Unable to access camera/microphone. Please check permissions.");
        }
    };

    const stopStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setStreaming(false);
        setIsLive(false);
        setViewers(0);
        setStreamStats(prev => ({ ...prev, duration: 0 }));
    };

    const toggleVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getVideoTracks();
            tracks.forEach(track => {
                track.enabled = !videoEnabled;
            });
            setVideoEnabled(!videoEnabled);
        }
    };

    const toggleAudio = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getAudioTracks();
            tracks.forEach(track => {
                track.enabled = !audioEnabled;
            });
            setAudioEnabled(!audioEnabled);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            const comment = {
                id: Date.now().toString(),
                user: `User${Math.floor(Math.random() * 1000)}`,
                text: newComment,
                timestamp: new Date()
            };
            setComments(prev => [comment, ...prev].slice(0, 50));
            setNewComment('');
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Live Stream Studio</h1>
                            <p className="text-gray-400 text-sm">Professional streaming platform</p>
                        </div>
                    </div>
                    
                    {isLive && (
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">LIVE</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{viewers.toLocaleString()} viewers</span>
                            </div>
                            <div className="text-sm text-gray-400">
                                {formatDuration(streamStats.duration)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Stream Area */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                            {/* Stream Preview */}
                            <div className="relative aspect-video bg-black">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    playsInline
                                    muted
                                />
                                
                                {!streaming && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-400">Stream preview will appear here</p>
                                        </div>
                                    </div>
                                )}

                                {/* Stream Overlay */}
                                {streaming && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
                                )}

                                {/* Stream Controls Overlay */}
                                {streaming && (
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={toggleVideo}
                                                className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                                                    videoEnabled 
                                                        ? 'bg-white/20 hover:bg-white/30' 
                                                        : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                            >
                                                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                            </button>
                                            
                                            <button
                                                onClick={toggleAudio}
                                                className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                                                    audioEnabled 
                                                        ? 'bg-white/20 hover:bg-white/30' 
                                                        : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                            >
                                                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={toggleFullscreen}
                                                className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                                            >
                                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stream Info */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        {!streaming ? (
                                            <button
                                                onClick={startStream}
                                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                                            >
                                                <Play className="w-5 h-5" />
                                                <span>Start Streaming</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={stopStream}
                                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                                            >
                                                <Square className="w-5 h-5" />
                                                <span>Stop Streaming</span>
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => setShowSettings(!showSettings)}
                                            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {isLive && (
                                        <div className="flex items-center space-x-4">
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg transition-all duration-200">
                                                <Heart className="w-4 h-4" />
                                                <span>{likes}</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200">
                                                <Share2 className="w-4 h-4" />
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Stream Settings */}
                                {showSettings && (
                                    <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                                        <h3 className="font-semibold mb-3">Stream Settings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Camera</label>
                                                <select 
                                                    value={selectedCamera}
                                                    onChange={(e) => setSelectedCamera(e.target.value)}
                                                    className="w-full p-2 bg-gray-600 rounded-lg text-white border border-gray-500"
                                                >
                                                    {availableCameras.map(camera => (
                                                        <option key={camera.deviceId} value={camera.deviceId}>
                                                            {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Quality</label>
                                                <select className="w-full p-2 bg-gray-600 rounded-lg text-white border border-gray-500">
                                                    <option value="1080p">1080p HD</option>
                                                    <option value="720p">720p HD</option>
                                                    <option value="480p">480p SD</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Stream Stats */}
                                {isLive && (
                                    <div className="bg-gray-700/30 rounded-xl p-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-blue-400">{viewers}</div>
                                                <div className="text-sm text-gray-400">Viewers</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-400">{streamStats.quality}</div>
                                                <div className="text-sm text-gray-400">Quality</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-purple-400">{streamStats.bitrate}</div>
                                                <div className="text-sm text-gray-400">Bitrate</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-400">{streamStats.fps}</div>
                                                <div className="text-sm text-gray-400">FPS</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4">
                                        <p className="text-red-400 flex items-center">
                                            <span className="mr-2">⚠️</span>
                                            {error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat & Controls Sidebar */}
                    <div className="space-y-6">
                        {/* Stream Info Form */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                            <h3 className="text-lg font-semibold mb-4">Stream Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Stream Title</label>
                                    <input
                                        type="text"
                                        value={streamTitle}
                                        onChange={(e) => setStreamTitle(e.target.value)}
                                        placeholder="Enter your stream title..."
                                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={streamDescription}
                                        onChange={(e) => setStreamDescription(e.target.value)}
                                        placeholder="Describe your stream..."
                                        rows={3}
                                        className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Chat */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                            <div className="p-4 border-b border-gray-700/50">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Live Chat
                                    {isLive && (
                                        <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                            Active
                                        </span>
                                    )}
                                </h3>
                            </div>
                            
                            <div className="h-80 overflow-y-auto p-4 space-y-3">
                                {comments.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No messages yet</p>
                                        <p className="text-sm">Start streaming to see live chat</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                                                {comment.user.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-medium">{comment.user}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {comment.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {isLive && (
                                <div className="p-4 border-t border-gray-700/50">
                                    <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                                        >
                                            Send
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all duration-200 transform hover:scale-105">
                                    <Users className="w-5 h-5" />
                                    <span>Invite Viewers</span>
                                </button>
                                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all duration-200 transform hover:scale-105">
                                    <Share2 className="w-5 h-5" />
                                    <span>Share Stream</span>
                                </button>
                                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200 transform hover:scale-105">
                                    <Monitor className="w-5 h-5" />
                                    <span>Screen Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreamPage;