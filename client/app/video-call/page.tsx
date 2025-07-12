'use client';
import React, { useRef, useState, useEffect } from 'react';
import { 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    Phone, 
    PhoneOff, 
    Monitor, 
    Settings, 
    Users, 
    MessageCircle, 
    MoreVertical,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Camera,
    Grid3X3,
    User,
    Clock,
    Wifi,
    WifiOff,
    AlertCircle,
    Copy,
    Link
} from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    avatar: string;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isHost: boolean;
    isScreenSharing: boolean;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const VideoCallPage: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [callStarted, setCallStarted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [chatMessages, setChatMessages] = useState<Array<{id: string, sender: string, message: string, timestamp: Date}>>([]);
    const [newMessage, setNewMessage] = useState('');
    const [roomId] = useState('room-' + Math.random().toString(36).substr(2, 9));
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
    const [availableDevices, setAvailableDevices] = useState<{cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[]}>({
        cameras: [],
        microphones: []
    });

    useEffect(() => {
        // Get available devices
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const cameras = devices.filter(device => device.kind === 'videoinput');
                const microphones = devices.filter(device => device.kind === 'audioinput');
                setAvailableDevices({ cameras, microphones });
                
                if (cameras.length > 0 && !selectedCamera) {
                    setSelectedCamera(cameras[0].deviceId);
                }
                if (microphones.length > 0 && !selectedMicrophone) {
                    setSelectedMicrophone(microphones[0].deviceId);
                }
            });

        // Simulate participants joining
        const demoParticipants: Participant[] = [
            {
                id: '1',
                name: 'John Doe',
                avatar: '👨‍💼',
                isVideoEnabled: true,
                isAudioEnabled: true,
                isHost: false,
                isScreenSharing: false,
                connectionStatus: 'connected'
            },
            {
                id: '2',
                name: 'Sarah Wilson',
                avatar: '👩‍💻',
                isVideoEnabled: false,
                isAudioEnabled: true,
                isHost: false,
                isScreenSharing: false,
                connectionStatus: 'connected'
            }
        ];

        // Call duration timer
        const timer = setInterval(() => {
            if (callStarted) {
                setCallDuration(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [callStarted, selectedCamera, selectedMicrophone]);

    const startCall = async () => {
        try {
            setConnectionStatus('connecting');
            const constraints = {
                video: {
                    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: {
                    deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            setCallStarted(true);
            setConnectionStatus('connected');
            
            // Simulate participants joining
            setTimeout(() => {
                setParticipants([
                    {
                        id: '1',
                        name: 'John Doe',
                        avatar: '👨‍💼',
                        isVideoEnabled: true,
                        isAudioEnabled: true,
                        isHost: false,
                        isScreenSharing: false,
                        connectionStatus: 'connected'
                    },
                    {
                        id: '2',
                        name: 'Sarah Wilson',
                        avatar: '👩‍💻',
                        isVideoEnabled: false,
                        isAudioEnabled: true,
                        isHost: false,
                        isScreenSharing: false,
                        connectionStatus: 'connected'
                    }
                ]);
            }, 2000);
        } catch (err) {
            alert('Could not access camera/microphone.');
            setConnectionStatus('disconnected');
        }
    };

    const endCall = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
        setCallStarted(false);
        setConnectionStatus('disconnected');
        setCallDuration(0);
        setParticipants([]);
    };

    const toggleVideo = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const tracks = (localVideoRef.current.srcObject as MediaStream).getVideoTracks();
            tracks.forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    const toggleAudio = () => {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
            const tracks = (localVideoRef.current.srcObject as MediaStream).getAudioTracks();
            tracks.forEach(track => {
                track.enabled = !isAudioEnabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    const toggleSpeaker = () => {
        setIsSpeakerEnabled(!isSpeakerEnabled);
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: true, 
                    audio: true 
                });
                // In a real app, you would replace the video track in the peer connection
                setIsScreenSharing(true);
            } catch (err) {
                console.error('Error sharing screen:', err);
            }
        } else {
            setIsScreenSharing(false);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const message = {
                id: Date.now().toString(),
                sender: 'You',
                message: newMessage,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        // You could show a toast notification here
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getConnectionStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-400';
            case 'connecting': return 'text-yellow-400';
            case 'disconnected': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getConnectionStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <Wifi className="w-4 h-4" />;
            case 'connecting': return <AlertCircle className="w-4 h-4 animate-pulse" />;
            case 'disconnected': return <WifiOff className="w-4 h-4" />;
            default: return <WifiOff className="w-4 h-4" />;
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-lg border-b border-gray-700/50 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Video Conference</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Room: {roomId}</span>
                            <button 
                                onClick={copyRoomId}
                                className="flex items-center space-x-1 hover:text-white transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {callStarted && (
                        <>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
                            </div>
                            <div className={`flex items-center space-x-2 ${getConnectionStatusColor(connectionStatus)}`}>
                                {getConnectionStatusIcon(connectionStatus)}
                                <span className="text-sm capitalize">{connectionStatus}</span>
                            </div>
                        </>
                    )}
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowParticipants(!showParticipants)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 flex flex-col">
                    {/* View Mode Toggle */}
                    {callStarted && (
                        <div className="p-4 flex items-center justify-between bg-gray-800/30">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${
                                        viewMode === 'grid' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('speaker')}
                                    className={`p-2 rounded-lg transition-colors ${
                                        viewMode === 'speaker' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                                >
                                    <User className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="text-sm text-gray-400">
                                {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
                            </div>
                        </div>
                    )}

                    {/* Video Grid */}
                    <div className="flex-1 p-4">
                        {!callStarted ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Video className="w-16 h-16 text-gray-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Ready to start your call?</h2>
                                    <p className="text-gray-400 mb-6">Click the button below to join the video conference</p>
                                    <button
                                        onClick={startCall}
                                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 mx-auto"
                                    >
                                        <Video className="w-5 h-5" />
                                        <span>Start Call</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`h-full ${
                                viewMode === 'grid' 
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4' 
                                    : 'flex flex-col'
                            }`}>
                                {/* Local Video */}
                                <div className={`relative bg-gray-800 rounded-2xl overflow-hidden ${
                                    viewMode === 'speaker' ? 'h-32 w-48 absolute top-4 right-4 z-10' : 'aspect-video'
                                }`}>
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {!isVideoEnabled && (
                                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <User className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <span className="text-sm text-gray-400">You</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                                                You
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {!isAudioEnabled && (
                                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                    <MicOff className="w-3 h-3" />
                                                </div>
                                            )}
                                            {!isVideoEnabled && (
                                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                    <VideoOff className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Remote Participants */}
                                {participants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className={`relative bg-gray-800 rounded-2xl overflow-hidden ${
                                            viewMode === 'speaker' ? 'flex-1' : 'aspect-video'
                                        }`}
                                    >
                                        {participant.isVideoEnabled ? (
                                            <video
                                                ref={remoteVideoRef}
                                                autoPlay
                                                playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                                                        {participant.avatar}
                                                    </div>
                                                    <span className="text-lg font-medium">{participant.name}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                                                    {participant.name}
                                                </span>
                                                {participant.isHost && (
                                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                                                        Host
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {!participant.isAudioEnabled && (
                                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                        <MicOff className="w-3 h-3" />
                                                    </div>
                                                )}
                                                {!participant.isVideoEnabled && (
                                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                        <VideoOff className="w-3 h-3" />
                                                    </div>
                                                )}
                                                <div className={`w-2 h-2 rounded-full ${
                                                    participant.connectionStatus === 'connected' ? 'bg-green-500' :
                                                    participant.connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="bg-black/50 backdrop-blur-lg border-t border-gray-700/50 p-4">
                        <div className="flex items-center justify-center space-x-6">
                            <button
                                onClick={toggleVideo}
                                className={`p-3 rounded-full transition-colors ${
                                    isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {isVideoEnabled ? (
                                    <Video className="w-5 h-5" />
                                ) : (
                                    <VideoOff className="w-5 h-5" />
                                )}
                            </button>
                            
                            <button
                                onClick={toggleAudio}
                                className={`p-3 rounded-full transition-colors ${
                                    isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {isAudioEnabled ? (
                                    <Mic className="w-5 h-5" />
                                ) : (
                                    <MicOff className="w-5 h-5" />
                                )}
                            </button>
                            
                            <button
                                onClick={toggleSpeaker}
                                className={`p-3 rounded-full transition-colors ${
                                    isSpeakerEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {isSpeakerEnabled ? (
                                    <Volume2 className="w-5 h-5" />
                                ) : (
                                    <VolumeX className="w-5 h-5" />
                                )}
                            </button>
                            
                            <button
                                onClick={toggleScreenShare}
                                className={`p-3 rounded-full transition-colors ${
                                    isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                <Monitor className="w-5 h-5" />
                            </button>
                            
                            <button
                                onClick={toggleFullscreen}
                                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-5 h-5" />
                                ) : (
                                    <Maximize className="w-5 h-5" />
                                )}
                            </button>
                            
                            <button
                                onClick={endCall}
                                className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Side Panels */}
                {showParticipants && (
                    <div className="w-80 bg-gray-800/50 backdrop-blur-lg border-l border-gray-700/50 flex flex-col">
                        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                            <h2 className="font-semibold">Participants ({participants.length + 1})</h2>
                            <button
                                onClick={() => setShowParticipants(false)}
                                className="p-1 hover:bg-gray-700 rounded"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="flex items-center space-x-3 p-2 bg-gray-700/30 rounded-lg">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">You</div>
                                    <div className="text-xs text-gray-400">Host</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        connectionStatus === 'connected' ? 'bg-green-500' :
                                        connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                    <span className="text-xs text-gray-400 capitalize">{connectionStatus}</span>
                                </div>
                            </div>
                            
                            {participants.map(participant => (
                                <div key={participant.id} className="flex items-center space-x-3 p-2 bg-gray-700/30 rounded-lg">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl">
                                        {participant.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{participant.name}</div>
                                        <div className="text-xs text-gray-400">
                                            {participant.isHost ? 'Host' : 'Participant'}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            participant.connectionStatus === 'connected' ? 'bg-green-500' :
                                            participant.connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}></div>
                                        <span className="text-xs text-gray-400 capitalize">{participant.connectionStatus}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showChat && (
                    <div className="w-80 bg-gray-800/50 backdrop-blur-lg border-l border-gray-700/50 flex flex-col">
                        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                            <h2 className="font-semibold">Chat</h2>
                            <button
                                onClick={() => setShowChat(false)}
                                className="p-1 hover:bg-gray-700 rounded"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No messages yet
                                </div>
                            ) : (
                                chatMessages.map(message => (
                                    <div key={message.id} className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-blue-400">{message.sender}</span>
                                            <span className="text-xs text-gray-400">
                                                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p className="text-sm">{message.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-700/50">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {showSettings && (
                    <div className="w-80 bg-gray-800/50 backdrop-blur-lg border-l border-gray-700/50 flex flex-col">
                        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                            <h2 className="font-semibold">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-1 hover:bg-gray-700 rounded"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Camera</h3>
                                <select
                                    value={selectedCamera}
                                    onChange={(e) => setSelectedCamera(e.target.value)}
                                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {availableDevices.cameras.map(camera => (
                                        <option key={camera.deviceId} value={camera.deviceId}>
                                            {camera.label || `Camera ${availableDevices.cameras.indexOf(camera) + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium mb-2">Microphone</h3>
                                <select
                                    value={selectedMicrophone}
                                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {availableDevices.microphones.map(microphone => (
                                        <option key={microphone.deviceId} value={microphone.deviceId}>
                                            {microphone.label || `Microphone ${availableDevices.microphones.indexOf(microphone) + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium mb-2">Appearance</h3>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                                        <span>Dark Mode</span>
                                        <span className="text-xs text-gray-400">On</span>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                                        <span>Font Size</span>
                                        <span className="text-xs text-gray-400">Medium</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium mb-2">About</h3>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p>Video Conference App</p>
                                    <p>Version 1.0.0</p>
                                    <p>© 2025 VideoConf Inc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCallPage;