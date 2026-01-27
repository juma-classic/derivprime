import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useDevice } from '@deriv-com/ui';
import './main-body.scss';

type TMainBodyProps = {
    children: React.ReactNode;
};

const MainBody: React.FC<TMainBodyProps> = ({ children }) => {
    // Default to light theme and ensure it's set in localStorage
    const current_theme = localStorage.getItem('theme') ?? 'light';
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light');
    }

    const { ui } = useStore() ?? {
        ui: {
            setDevice: () => {},
        },
    };
    const { setDevice } = ui;
    const { isDesktop, isMobile, isTablet } = useDevice();

    useEffect(() => {
        const body = document.querySelector('body');
        if (!body) return;

        // Force light theme by default
        body.classList.remove('theme--dark', 'theme--ocean', 'theme--sunset', 'theme--pink');
        body.classList.add('theme--light');

        // Apply the selected theme
        if (current_theme === 'light') {
            body.classList.remove('theme--dark', 'theme--ocean', 'theme--sunset', 'theme--pink');
            body.classList.add('theme--light');
        } else if (current_theme === 'dark') {
            body.classList.remove('theme--light', 'theme--ocean', 'theme--sunset', 'theme--pink');
            body.classList.add('theme--dark');
        } else {
            // For any other theme, default to light
            body.classList.remove('theme--dark', 'theme--ocean', 'theme--sunset', 'theme--pink');
            body.classList.add('theme--light');
        }
    }, [current_theme]);

    useEffect(() => {
        if (isMobile) {
            setDevice('mobile');
        } else if (isTablet) {
            setDevice('tablet');
        } else {
            setDevice('desktop');
        }
    }, [isDesktop, isMobile, isTablet, setDevice]);

    return <div className='main-body'>{children}</div>;
};

export default MainBody;
