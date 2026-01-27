import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import SimpleLoader from '@/components/loader/simple-loader';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import SpeedBot from '@/components/speed-bot';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';

const Chart = lazy(() => import('../chart'));
const Tutorial = lazy(() => import('../tutorials'));

const DashboardIcon = () => (
    <svg
        width='20'
        height='20'
        fill='#87ceeb'
        viewBox='0 0 24 24'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' />
    </svg>
);

const BotBuilderIcon = () => (
    <svg
        fill='#87ceeb'
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5C14.8 6.1 14.6 5.7 14.3 5.4L16.5 1.5L15 0.5L12.9 4.3C12.6 4.1 12.3 4 12 4S11.4 4.1 11.1 4.3L9 0.5L7.5 1.5L9.7 5.4C9.4 5.7 9.2 6.1 9 6.5L3 7V9L9 9.5C9.2 9.9 9.4 10.3 9.7 10.6L7.5 14.5L9 15.5L11.1 11.7C11.4 11.9 11.7 12 12 12S12.6 11.9 12.9 11.7L15 15.5L16.5 14.5L14.3 10.6C14.6 10.3 14.8 9.9 15 9.5L21 9Z' />
    </svg>
);

const ChartsIcon = () => (
    <svg
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path
            d='M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z'
            fill='#87ceeb'
        />
    </svg>
);

const TutorialsIcon = () => (
    <svg
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path
            d='M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2ZM12 4.5L10.18 8.5L6 9L10.18 9.5L12 13.5L13.82 9.5L18 9L13.82 8.5L12 4.5Z'
            fill='#87ceeb'
        />
    </svg>
);

const AnalysisToolIcon = () => (
    <svg
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path
            d='M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z'
            fill='#87ceeb'
        />
    </svg>
);

const SignalsIcon = () => (
    <svg
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path
            d='M2 17H22V19H2V17ZM1.15 12.95L4 15.8L9.85 9.95C10.24 9.56 10.87 9.56 11.26 9.95L13.14 11.83L20.85 4.12C21.24 3.73 21.87 3.73 22.26 4.12C22.65 4.51 22.65 5.14 22.26 5.53L13.84 13.95C13.45 14.34 12.82 14.34 12.43 13.95L10.55 12.07L5.41 17.21C5.02 17.6 4.39 17.6 4 17.21L0.44 13.65C0.05 13.26 0.05 12.63 0.44 12.24C0.83 11.85 1.46 11.85 1.85 12.24L1.15 12.95Z'
            fill='#87ceeb'
        />
    </svg>
);

const TradingHubIcon = () => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='#87ceeb'
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path d='M21.49 13.926l-3.273 2.48c.054-.663.116-1.435.143-2.275.04-.89.023-1.854-.043-2.835-.043-.487-.097-.98-.184-1.467-.077-.485-.196-.982-.31-1.39-.238-.862-.535-1.68-.9-2.35-.352-.673-.786-1.173-1.12-1.462-.172-.144-.31-.248-.414-.306l-.153-.093c-.083-.05-.187-.056-.275-.003-.13.08-.175.252-.1.388l.01.02s.11.198.258.54c.07.176.155.38.223.63.08.24.14.528.206.838.063.313.114.66.17 1.03l.15 1.188c.055.44.106.826.13 1.246.03.416.033.85.026 1.285.004.872-.063 1.76-.115 2.602-.062.853-.12 1.65-.172 2.335 0 .04-.004.073-.005.11l-.115-.118-2.996-3.028-1.6.454 5.566 6.66 6.394-5.803-1.503-.677z' />
    </svg>
);

const FreeBotsIcon = () => (
    <svg
        fill='#87ceeb'
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        data-name='Layer 1'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path d='M10,13H4a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V14A1,1,0,0,0,10,13ZM9,19H5V15H9ZM20,3H14a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,20,3ZM19,9H15V5h4Zm1,7H18V14a1,1,0,0,0-2,0v2H14a1,1,0,0,0,0,2h2v2a1,1,0,0,0,2,0V18h2a1,1,0,0,0,0-2ZM10,3H4A1,1,0,0,0,3,4v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,10,3ZM9,9H5V5H9Z' />
    </svg>
);

const SpeedBotIcon = () => (
    <svg
        fill='#87ceeb'
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        style={{ filter: 'drop-shadow(0 0 3px rgba(135, 206, 235, 0.6))' }}
    >
        <path d='M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2ZM12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20ZM12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z' />
    </svg>
);

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, summary_card } = useStore();
    const { active_tab, is_chart_modal_visible, setActiveTab } = dashboard;
    const { onEntered } = load_modal;
    const {
        is_dialog_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
        is_drawer_open,
    } = run_panel;
    const { cancel_button_text, ok_button_text, title, message } = dialog_options as { [key: string]: string };
    const { clear } = summary_card;
    const { isDesktop } = useDevice();

    type BotType = {
        title: string;
        fileName: string;
        description: string;
        image: string;
        filePath: string;
        xmlContent: string;
        category: string;
    };
    const [bots, setBots] = useState<BotType[]>([]);
    const [analysisToolUrl, setAnalysisToolUrl] = useState('ai');

    // Helper functions for bot display
    const getBotIcon = (category: string): string => {
        if (category.includes('Ghost')) return '👻';
        if (category.includes('AI')) return '🤖';
        if (category.includes('Over/Under')) return '🎯';
        if (category.includes('CFX')) return '⚡';
        if (category.includes('Auto')) return '🔄';
        if (category.includes('D6')) return '🎲';
        return '🔧';
    };

    const getBotIconGradient = (category: string): string => {
        if (category.includes('Ghost')) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        if (category.includes('AI')) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        if (category.includes('Over/Under')) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        if (category.includes('CFX')) return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        if (category.includes('Auto')) return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        if (category.includes('D6')) return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
        return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
    };

    useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
            }
        }
    }, [clear, connectionStatus, stopBot]);

    useEffect(() => {
        const fetchBots = async () => {
            const botFiles = [
                // Original bots
                'Dexterator CFX Hit&Run by Dexter.xml',
                'Odins_ghost.xml',
                'M27 Auto Switch bot 2024 (1).xml',
                '(eRe Test 1)Even Odd Ghost V1 by Dexter.xml',
                'updated CFX Auto-Bot by Dexterator.xml',
                'Over 3 Delirium by Elvis Trades.xml',
                'D6 Deriv by Duke.xml',
                'Raziel Over Under.xml',
                'Game Changer AI (1).xml',
                // 15 NEW BOTS ADDED
                '_Expert seed bot📈📉🚀.xml',
                '(eRe Test 1)Even Odd Ghost V1 by Dexter (1).xml',
                'Alpha .xml',
                'DDiffer-Random (1).xml',
                'Dexterator AI .xml',
                'DIFF SMART BOT.xml',
                'DIGIT DIFFER RANDOMIZE LDP.xml',
                'Digit Differ Split martingale Strategy[4nd July 2022].xml',
                'Digit hyper.xml',
                'G.7over under pro.xml',
                'G7.xml',
                'King Auto Over 2 Under 7.xml',
                'LAS VEGAS 📃💵 (1).xml',
                'M7M Ver 3.2 Still Amazing.xml',
                'Master Bot V6 CEO Gatimu (1).xml',
                'MASTER BOT V7 - $Elvis Trades.xml',
                'MASTER BOT V7 - Elvis Trades.xml',
                'Over_Under Ghost - by ElvisTrades.xml',
                'Over_Under Ghost v2 - by Elvis Trades.xml',
                'Over2_Under7_Armor Ai Bot.xml',
                'Random LDP Differ - Elvis Trades.xml',
            ];

            // Helper function to generate bot description
            const getBotDescription = (botName: string): string => {
                const name = botName.toLowerCase();
                // AI & Expert Bots
                if (name.includes('game changer')) {
                    return 'Revolutionary AI-powered trading bot with adaptive algorithms';
                } else if (name.includes('dexterator ai')) {
                    return 'Advanced AI-powered Dexterator strategy with machine learning';
                } else if (name.includes('expert seed')) {
                    return 'Expert-level seed strategy with professional market analysis';
                } else if (name.includes('alpha')) {
                    return 'Alpha generation strategy for consistent market outperformance';
                }
                // Ghost Strategies
                else if (name.includes('ghost') || name.includes('odin')) {
                    return 'Stealth trading strategy with advanced prediction algorithms';
                }
                // Over/Under Strategies
                else if (name.includes('raziel')) {
                    return 'Sophisticated Over/Under strategy with hot/cold zone detection';
                } else if (name.includes('over') && name.includes('under')) {
                    return 'Professional Over/Under strategy with intelligent market timing';
                } else if (name.includes('g.7over') || name.includes('g7')) {
                    return 'G7 Over/Under professional strategy with advanced analytics';
                } else if (name.includes('king auto')) {
                    return 'Royal Over 2 Under 7 strategy with automated precision';
                }
                // CFX & Dexterator Strategies
                else if (name.includes('dexterator') && name.includes('cfx')) {
                    return 'Professional CFX strategy with hit & run methodology';
                }
                // Auto & Switching Strategies
                else if (name.includes('m27')) {
                    return 'Auto-switching strategy that adapts to market conditions';
                } else if (name.includes('m7m')) {
                    return 'M7M Version 3.2 - Still amazing auto-trading strategy';
                }
                // Master Bots
                else if (name.includes('master bot v6')) {
                    return 'Master Bot V6 by CEO Gatimu - Professional grade strategy';
                } else if (name.includes('master bot v7')) {
                    return 'Master Bot V7 by Elvis Trades - Advanced trading system';
                }
                // Digit Strategies
                else if (name.includes('digit differ') || name.includes('ddiffer')) {
                    return 'Advanced digit difference strategy with randomization';
                } else if (name.includes('digit hyper')) {
                    return 'Hyper-speed digit trading with precision algorithms';
                } else if (name.includes('diff smart')) {
                    return 'Smart difference strategy with intelligent market analysis';
                }
                // D6 Strategies
                else if (name.includes('d6 deriv')) {
                    return 'Advanced D6 strategy with intelligent market analysis and risk management';
                }
                // Special Strategies
                else if (name.includes('las vegas')) {
                    return 'Las Vegas style high-stakes trading strategy';
                } else if (name.includes('delirium')) {
                    return 'High-performance Over 3 strategy for experienced traders';
                } else if (name.includes('random ldp')) {
                    return 'Random LDP strategy with advanced market prediction';
                } else if (name.includes('armor ai')) {
                    return 'Armored AI protection with Over2/Under7 strategy';
                } else {
                    return 'Professional trading strategy with optimized parameters';
                }
            };

            // Helper function to categorize bots
            const categorizeBotByName = (botName: string): string => {
                const name = botName.toLowerCase();
                // Ghost & Stealth Strategies
                if (name.includes('ghost') || name.includes('odin')) return '👻 Ghost Strategies';
                // AI & Expert Bots
                if (
                    name.includes('ai') ||
                    name.includes('game changer') ||
                    name.includes('expert') ||
                    name.includes('alpha')
                )
                    return '🤖 AI & Expert';
                // Over/Under Strategies
                if (
                    name.includes('over') ||
                    name.includes('under') ||
                    name.includes('raziel') ||
                    name.includes('g7') ||
                    name.includes('king')
                )
                    return '🎯 Over/Under';
                // CFX & Dexterator Trading
                if (name.includes('dexterator') || name.includes('cfx')) return '⚡ CFX Trading';
                // Auto & Switching Strategies
                if (name.includes('auto') || name.includes('m27') || name.includes('m7m')) return '🔄 Auto Strategies';
                // D6 Strategies
                if (name.includes('d6') || name.includes('duke')) return '🎲 D6 Strategies';
                // Digit Strategies
                if (
                    name.includes('digit') ||
                    name.includes('differ') ||
                    name.includes('ldp') ||
                    name.includes('random')
                )
                    return '🔢 Digit Strategies';
                // Master Bots
                if (name.includes('master bot') || name.includes('ceo') || name.includes('elvis'))
                    return '👑 Master Bots';
                // Special & Premium
                if (name.includes('las vegas') || name.includes('armor') || name.includes('hyper'))
                    return '💎 Premium Strategies';
                return '🔧 General';
            };

            const botPromises = botFiles.map(async file => {
                try {
                    const response = await fetch(file);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
                    }
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'application/xml');

                    // Extract bot name and clean it up
                    const fileName = file.split('/').pop() || file;
                    const botName = fileName
                        .replace('.xml', '')
                        .replace(/\([^)]*\)/g, '')
                        .trim();

                    return {
                        title: botName,
                        fileName: fileName,
                        description: getBotDescription(botName),
                        image: xml.getElementsByTagName('image')[0]?.textContent || 'default_image_path',
                        filePath: file,
                        xmlContent: text,
                        category: categorizeBotByName(botName),
                    };
                } catch (error) {
                    console.error(`Error loading bot ${file}:`, error);
                    return null;
                }
            });

            const loadedBots = (await Promise.all(botPromises)).filter(Boolean);

            // Sort bots by category and name
            const sortedBots = loadedBots.sort((a, b) => {
                if (a.category !== b.category) {
                    return a.category.localeCompare(b.category);
                }
                return a.title.localeCompare(b.title);
            });

            setBots(sortedBots);
            console.log(`📦 [FREE BOTS] Loaded ${sortedBots.length} bots successfully`);
        };
        fetchBots();
    }, []);

    const handleBotClick = useCallback(
        async bot => {
            setActiveTab(DBOT_TABS.BOT_BUILDER);
            try {
                if (typeof load_modal.loadStrategyToBuilder === 'function') {
                    await load_modal.loadStrategyToBuilder({
                        id: bot.filePath, // Use filePath as id (or generate a unique id if needed)
                        name: bot.title,
                        xml: bot.xmlContent,
                        save_type: 'LOCAL', // or another type if needed
                    });
                } else {
                    console.error('loadStrategyToBuilder is not defined on load_modal');
                }
                updateWorkspaceName();
            } catch (error) {
                console.error('Error loading bot file:', error);
            }
        },
        [setActiveTab, load_modal]
    );

    const handleOpen = useCallback(async () => {
        await load_modal.loadFileFromRecent();
        setActiveTab(DBOT_TABS.BOT_BUILDER);
    }, [load_modal, setActiveTab]);

    const toggleAnalysisTool = (url: string) => setAnalysisToolUrl(url);

    const showRunPanel = [DBOT_TABS.BOT_BUILDER, DBOT_TABS.CHART, DBOT_TABS.ANALYSIS_TOOL, DBOT_TABS.SIGNALS].includes(
        active_tab
    );

    return (
        <>
            <div className='main'>
                <div className='main__container'>
                    <Tabs
                        active_index={active_tab}
                        className='main__tabs'
                        onTabItemChange={onEntered}
                        onTabItemClick={setActiveTab}
                        top
                        is_scrollable={!isDesktop} // Enable scrolling on mobile/tablet
                        fit_content={!isDesktop} // Use fit content on mobile
                    >
                        <div
                            label={
                                <>
                                    <DashboardIcon />
                                    <Localize i18n_default_text='Dashboard' />
                                </>
                            }
                            id='id-dbot-dashboard'
                        >
                            <Dashboard handleTabChange={setActiveTab} />
                            <button onClick={handleOpen}>Load Bot</button>
                        </div>
                        <div
                            label={
                                <>
                                    <BotBuilderIcon />
                                    <Localize i18n_default_text='Bot Builder' />
                                </>
                            }
                            id='id-bot-builder'
                        />
                        <div
                            label={
                                <>
                                    <ChartsIcon />
                                    <Localize i18n_default_text='Charts' />
                                </>
                            }
                            id='id-charts'
                        >
                            <Suspense
                                fallback={
                                    <SimpleLoader message={localize('Please wait, loading chart...')} size='large' />
                                }
                            >
                                <Chart show_digits_stats={false} />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <TutorialsIcon />
                                    <Localize i18n_default_text='Tutorials' />
                                </>
                            }
                            id='id-tutorials'
                        >
                            <Suspense
                                fallback={
                                    <SimpleLoader
                                        message={localize('Please wait, loading tutorials...')}
                                        size='large'
                                    />
                                }
                            >
                                <Tutorial handleTabChange={setActiveTab} />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <AnalysisToolIcon />
                                    <Localize i18n_default_text='Analysis Tool' />
                                </>
                            }
                            id='id-analysis-tool'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        padding: '8px',
                                        borderBottom: '1px solid var(--border-normal)',
                                    }}
                                >
                                    <button
                                        onClick={() => toggleAnalysisTool('ai')}
                                        style={{
                                            backgroundColor:
                                                analysisToolUrl === 'ai'
                                                    ? 'var(--button-primary-default)'
                                                    : 'transparent',
                                            color: analysisToolUrl === 'ai' ? 'white' : 'var(--text-general)',
                                            padding: '8px 16px',
                                            border: '1px solid var(--border-normal)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        A Tool
                                    </button>
                                    <button
                                        onClick={() => toggleAnalysisTool('ldpanalyzer')}
                                        style={{
                                            backgroundColor:
                                                analysisToolUrl === 'ldpanalyzer'
                                                    ? 'var(--button-primary-default)'
                                                    : 'transparent',
                                            color: analysisToolUrl === 'ldpanalyzer' ? 'white' : 'var(--text-general)',
                                            padding: '8px 16px',
                                            border: '1px solid var(--border-normal)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        LDP Tool
                                    </button>
                                </div>
                                <iframe
                                    src={analysisToolUrl}
                                    width='100%'
                                    height='600px'
                                    style={{ border: 'none', display: 'block' }}
                                    scrolling='yes'
                                />
                            </div>
                        </div>
                        <div
                            label={
                                <>
                                    <SignalsIcon />
                                    <Localize i18n_default_text='Signals' />
                                </>
                            }
                            id='id-signals'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <iframe
                                    src='signals'
                                    width='100%'
                                    height='600px'
                                    style={{ border: 'none', display: 'block' }}
                                    scrolling='yes'
                                />
                            </div>
                        </div>
                        <div
                            label={
                                <>
                                    <TradingHubIcon />
                                    <Localize i18n_default_text='Trading Hub' />
                                </>
                            }
                            id='id-Trading-Hub'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <iframe src='https://mekop.netlify.app' height='600px' frameBorder='0' />
                            </div>
                        </div>
                        {/* SPEED BOT TAB */}
                        <div
                            label={
                                <>
                                    <SpeedBotIcon />
                                    <Localize i18n_default_text='Speed Bot' />
                                </>
                            }
                            id='id-speed-bot'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                                style={{ height: '100%', padding: 0 }}
                            >
                                <SpeedBot />
                            </div>
                        </div>
                        {/* FREE BOTS TAB */}
                        <div
                            label={
                                <>
                                    <FreeBotsIcon />
                                    <Localize i18n_default_text='Free Bots' />
                                </>
                            }
                            id='id-free-bots'
                            style={{
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            <div
                                className='free-bots'
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <h2
                                    className='free-bots__heading'
                                    style={{
                                        fontSize: '2rem',
                                        fontWeight: 700,
                                        marginBottom: '2rem',
                                        color: '#1e3a8a',
                                        flexShrink: 0,
                                    }}
                                >
                                    Free Bots
                                </h2>
                                <div
                                    className='free-bots__content-wrapper'
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '1.5rem',
                                        justifyContent: 'flex-start',
                                        flex: 1,
                                        overflowY: 'auto',
                                        alignContent: 'flex-start',
                                        padding: '0.5rem',
                                    }}
                                >
                                    <ul
                                        className='free-bots__content'
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '1.5rem',
                                            padding: 0,
                                            margin: 0,
                                            listStyle: 'none',
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            alignContent: 'flex-start',
                                        }}
                                    >
                                        {bots.length === 0 ? (
                                            <li style={{ textAlign: 'center', width: '100%', color: '#888' }}>
                                                <Localize i18n_default_text='No free bots available.' />
                                            </li>
                                        ) : (
                                            bots.map((bot, index) => (
                                                <li
                                                    className='free-bot'
                                                    key={index}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                                                        color: '#151a23',
                                                        borderRadius: '20px',
                                                        padding: '1.5rem 1.2rem',
                                                        minWidth: '240px',
                                                        maxWidth: '240px',
                                                        minHeight: '280px',
                                                        flex: '0 0 auto',
                                                        boxShadow:
                                                            '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        border: '2px solid rgba(99, 102, 241, 0.1)',
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 8px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.1)';
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: '50%',
                                                            background: getBotIconGradient(bot.category),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: '1rem',
                                                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)',
                                                            border: '3px solid rgba(255, 255, 255, 0.8)',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: '1.5rem',
                                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                                                            }}
                                                        >
                                                            {getBotIcon(bot.category)}
                                                        </span>
                                                    </div>
                                                    <div className='free-bot__details' style={{ textAlign: 'center' }}>
                                                        {/* Category Badge */}
                                                        <div
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                color: '#6366f1',
                                                                fontWeight: 600,
                                                                marginBottom: '0.5rem',
                                                                background: 'rgba(99, 102, 241, 0.1)',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '12px',
                                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                            }}
                                                        >
                                                            {bot.category}
                                                        </div>

                                                        <h3
                                                            className='free-bot__title'
                                                            style={{
                                                                color: '#18213a',
                                                                fontSize: '1.1rem',
                                                                fontWeight: 700,
                                                                margin: '0 0 0.6rem 0',
                                                                lineHeight: '1.3',
                                                            }}
                                                        >
                                                            {bot.title}
                                                        </h3>

                                                        {/* Description */}
                                                        <p
                                                            style={{
                                                                fontSize: '0.85rem',
                                                                color: '#64748b',
                                                                margin: '0 0 1rem 0',
                                                                lineHeight: '1.4',
                                                                height: '2.8rem',
                                                                overflow: 'hidden',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                            }}
                                                        >
                                                            {bot.description}
                                                        </p>

                                                        <button
                                                            style={{
                                                                padding: '0.6rem 1.4rem',
                                                                fontSize: '0.95rem',
                                                                background:
                                                                    'linear-gradient(135deg, #00c853 0%, #00a843 100%)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '24px',
                                                                cursor: 'pointer',
                                                                fontWeight: 700,
                                                                letterSpacing: '0.02em',
                                                                transition: 'all 0.3s ease',
                                                                boxShadow: '0 4px 12px rgba(0,200,83,0.3)',
                                                                width: '100%',
                                                            }}
                                                            onClick={() => handleBotClick(bot)}
                                                            onMouseEnter={e => {
                                                                e.currentTarget.style.background =
                                                                    'linear-gradient(135deg, #00a843 0%, #008a36 100%)';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow =
                                                                    '0 6px 16px rgba(0,200,83,0.4)';
                                                            }}
                                                            onMouseLeave={e => {
                                                                e.currentTarget.style.background =
                                                                    'linear-gradient(135deg, #00c853 0%, #00a843 100%)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow =
                                                                    '0 4px 12px rgba(0,200,83,0.3)';
                                                            }}
                                                        >
                                                            🚀 Load Bot
                                                        </button>
                                                    </div>
                                                </li>
                                            )) || null
                                        )}
                                    </ul>
                                </div>
                                <style>
                                    {`
                                        @media (max-width: 768px) {
                                            .free-bots__content {
                                                justify-content: center !important;
                                            }
                                            .free-bot {
                                                min-width: 200px !important;
                                                max-width: 200px !important;
                                                min-height: 260px !important;
                                                padding: 1.2rem 1rem !important;
                                            }
                                        }
                                        
                                        @media (max-width: 600px) {
                                            .free-bots__content {
                                                flex-direction: column !important;
                                                gap: 1rem !important;
                                                align-items: center !important;
                                            }
                                            .free-bot {
                                                min-width: 280px !important;
                                                max-width: 90% !important;
                                                min-height: 240px !important;
                                                padding: 1.2rem 1rem !important;
                                            }
                                            .free-bots__heading {
                                                font-size: 1.5rem !important;
                                                text-align: center !important;
                                            }
                                            .free-bot__title {
                                                font-size: 1rem !important;
                                            }
                                        }
                                        
                                        @media (max-width: 480px) {
                                            .free-bot {
                                                min-width: 260px !important;
                                                max-width: 95% !important;
                                            }
                                        }
                                    `}
                                </style>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    {showRunPanel && <RunPanel />}
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>
                <RunPanel />
            </MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                title={title}
            >
                {message}
            </Dialog>
        </>
    );
});

export default AppWrapper;
