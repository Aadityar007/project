import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GovConnectView } from './components/GovConnectView';
import { ChatView } from './components/ChatView';
import { ViewType, Language } from './types';
import type { NavItem } from './types';
import { LANGUAGES, COMMANDS } from './constants';
import { DashboardIcon } from './components/icons/DashboardIcon';
import { PestIcon } from './components/icons/PestIcon';
import { MarketIcon } from './components/icons/MarketIcon';
import { GovIcon } from './components/icons/GovIcon';
import { useVoiceCommands, type Command } from './hooks/useVoiceCommands';
import { VoiceCommandController } from './components/VoiceCommandController';

const NAV_ITEMS: NavItem[] = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: DashboardIcon },
    { id: ViewType.CROP_ADVISORY, label: 'Crop Advisory', icon: PestIcon },
    { id: ViewType.MARKET_WEATHER, label: 'Market & Weather', icon: MarketIcon },
    { id: ViewType.GOV_CONNECT, label: 'Government Connect', icon: GovIcon },
];

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);

    // Voice Commands Setup
    const commands = useMemo(() => NAV_ITEMS
        .map((item): Command | null => {
            const phrases = COMMANDS[item.id]?.[selectedLanguage.code];
            if (!phrases) return null;
            return {
                phrases,
                callback: () => setCurrentView(item.id),
            };
        }).filter((command): command is Command => command !== null), 
    [selectedLanguage]);

    const {
        isListening,
        transcript,
        error: voiceCommandError,
        startListening,
        stopListening,
        hasRecognitionSupport,
    } = useVoiceCommands(commands);

    const handleStartListening = () => {
        startListening(selectedLanguage.code);
    };

    const renderView = () => {
        switch (currentView) {
            case ViewType.DASHBOARD:
                return <DashboardView onViewChange={setCurrentView} navItems={NAV_ITEMS} />;
            case ViewType.CROP_ADVISORY:
                return <ChatView 
                    title="Crop Advisory"
                    description="Ask about pests, diseases, farming techniques, or upload an image for identification."
                    language={selectedLanguage}
                    allowImageUpload={true}
                    examplePrompts={[
                        { text: 'Identify this pest from an image.', upload: true },
                        { text: 'What are the most common insects that attack cotton crops?' },
                        { text: 'Suggest some organic pest control methods for my vegetable garden.' },
                        { text: 'How do I identify and treat leaf curl virus on my chili plants?' },
                    ]}
                />;
            case ViewType.MARKET_WEATHER:
                return <ChatView
                    title="Market Prices & Weather"
                    description="Get real-time market prices for crops and accurate weather forecasts for your location."
                    language={selectedLanguage}
                    useSearch={true}
                />;
            case ViewType.GOV_CONNECT:
                return <GovConnectView />;
            default:
                return <DashboardView onViewChange={setCurrentView} navItems={NAV_ITEMS} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar 
                currentView={currentView} 
                onViewChange={setCurrentView} 
                navItems={NAV_ITEMS}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
            />
            <div className="flex-1 flex flex-col md:ml-64">
                 <main className="flex-1 overflow-y-auto bg-gray-50">
                    {renderView()}
                </main>
            </div>
            <VoiceCommandController 
                isListening={isListening}
                transcript={transcript}
                error={voiceCommandError}
                startListening={handleStartListening}
                stopListening={stopListening}
                hasSupport={hasRecognitionSupport}
            />
        </div>
    );
};

export default App;