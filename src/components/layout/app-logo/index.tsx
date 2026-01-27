import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) return null;

    return (
        <a className='app-header__logo' href='https://tickshark.top' target='_blank' rel='noopener noreferrer'>
            <div className='ceo-paul-logo'>
                <span className='ceo-paul-logo__text'>CEO PAUL</span>
            </div>
        </a>
    );
};
