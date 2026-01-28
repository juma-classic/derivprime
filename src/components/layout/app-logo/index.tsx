import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;

    return (
        <a className='app-header__logo' href='https://derivprime.vercel.app' target='_blank' rel='noopener noreferrer'>
            <div className='deriv-prime-logo'>
                <span className='deriv-prime-logo__text'>Deriv Prime</span>
            </div>
        </a>
    );
};
