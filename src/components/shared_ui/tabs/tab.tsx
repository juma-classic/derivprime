import React from 'react';
import classNames from 'classnames';
import Counter from '../counter';

type TTabProps = {
    active_icon_color?: string;
    active_tab_ref?: React.RefObject<HTMLLIElement> | null;
    bottom?: boolean;
    className?: string;
    count: number;
    header_content: React.ReactElement;
    header_fit_content?: boolean;
    icon_color?: string;
    id?: string;
    is_active: boolean;
    is_label_hidden?: boolean;
    is_scrollable?: boolean;
    label: string;
    onClick: React.MouseEventHandler<HTMLLIElement>;
    setActiveLineStyle: () => void;
    top: boolean;
};

const Tab = ({
    active_icon_color = '',
    active_tab_ref,
    bottom = false,
    className = '',
    count,
    header_content,
    header_fit_content = false,
    icon_color = '',
    id = '',
    is_active,
    is_label_hidden,
    is_scrollable,
    label,
    onClick,
    setActiveLineStyle,
    top,
}: TTabProps) => {
    React.useEffect(() => {
        setActiveLineStyle();
    }, [count, label, header_content, setActiveLineStyle]);

    const classes = classNames('dc-tabs__item', {
        'dc-tabs__active': is_active,
        [`dc-tabs__active--${className}`]: className && is_active,
        'dc-tabs__item--top': top,
        'dc-tabs__item--bottom': bottom,
        'dc-tabs__item--header-fit-content': header_fit_content,
        'dc-tabs__item--is-hidden': is_label_hidden,
        [`dc-tabs__item--${className}`]: className,
        'dc-tabs__item--is-scrollable-and-active': is_scrollable && is_active,
    });
    const title_color = is_active ? active_icon_color : icon_color;

    // Get futuristic icon based on tab ID or label
    const getFuturisticIcon = () => {
        const tabIdentifier = id || label?.toString().toLowerCase() || '';

        if (tabIdentifier.includes('dashboard')) {
            return <path d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' />;
        } else if (tabIdentifier.includes('bot') || tabIdentifier.includes('builder')) {
            return (
                <path d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5C14.8 6.1 14.6 5.7 14.3 5.4L16.5 1.5L15 0.5L12.9 4.3C12.6 4.1 12.3 4 12 4S11.4 4.1 11.1 4.3L9 0.5L7.5 1.5L9.7 5.4C9.4 5.7 9.2 6.1 9 6.5L3 7V9L9 9.5C9.2 9.9 9.4 10.3 9.7 10.6L7.5 14.5L9 15.5L11.1 11.7C11.4 11.9 11.7 12 12 12S12.6 11.9 12.9 11.7L15 15.5L16.5 14.5L14.3 10.6C14.6 10.3 14.8 9.9 15 9.5L21 9Z' />
            );
        } else if (tabIdentifier.includes('chart')) {
            return (
                <path d='M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z' />
            );
        } else if (tabIdentifier.includes('tutorial')) {
            return (
                <path d='M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2ZM12 4.5L10.18 8.5L6 9L10.18 9.5L12 13.5L13.82 9.5L18 9L13.82 8.5L12 4.5Z' />
            );
        } else if (tabIdentifier.includes('analysis')) {
            return (
                <path d='M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z' />
            );
        } else if (tabIdentifier.includes('signal')) {
            return (
                <path d='M2 17H22V19H2V17ZM1.15 12.95L4 15.8L9.85 9.95C10.24 9.56 10.87 9.56 11.26 9.95L13.14 11.83L20.85 4.12C21.24 3.73 21.87 3.73 22.26 4.12C22.65 4.51 22.65 5.14 22.26 5.53L13.84 13.95C13.45 14.34 12.82 14.34 12.43 13.95L10.55 12.07L5.41 17.21C5.02 17.6 4.39 17.6 4 17.21L0.44 13.65C0.05 13.26 0.05 12.63 0.44 12.24C0.83 11.85 1.46 11.85 1.85 12.24L1.15 12.95Z' />
            );
        } else if (tabIdentifier.includes('trading') || tabIdentifier.includes('hub')) {
            return (
                <path d='M21.49 13.926l-3.273 2.48c.054-.663.116-1.435.143-2.275.04-.89.023-1.854-.043-2.835-.043-.487-.097-.98-.184-1.467-.077-.485-.196-.982-.31-1.39-.238-.862-.535-1.68-.9-2.35-.352-.673-.786-1.173-1.12-1.462-.172-.144-.31-.248-.414-.306l-.153-.093c-.083-.05-.187-.056-.275-.003-.13.08-.175.252-.1.388l.01.02s.11.198.258.54c.07.176.155.38.223.63.08.24.14.528.206.838.063.313.114.66.17 1.03l.15 1.188c.055.44.106.826.13 1.246.03.416.033.85.026 1.285.004.872-.063 1.76-.115 2.602-.062.853-.12 1.65-.172 2.335 0 .04-.004.073-.005.11l-.115-.118-2.996-3.028-1.6.454 5.566 6.66 6.394-5.803-1.503-.677z' />
            );
        } else if (tabIdentifier.includes('speed')) {
            return (
                <path d='M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2ZM12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20ZM12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z' />
            );
        } else if (tabIdentifier.includes('free') || tabIdentifier.includes('bot')) {
            return (
                <path d='M10,13H4a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V14A1,1,0,0,0,10,13ZM9,19H5V15H9ZM20,3H14a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,20,3ZM19,9H15V5h4Zm1,7H18V14a1,1,0,0,0-2,0v2H14a1,1,0,0,0,0,2h2v2a1,1,0,0,0,2,0V18h2a1,1,0,0,0,0-2ZM10,3H4A1,1,0,0,0,3,4v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,10,3ZM9,9H5V5H9Z' />
            );
        } else {
            // Default star icon
            return <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z' />;
        }
    };

    return (
        <li id={id} className={classes} style={{ color: title_color }} onClick={onClick} ref={active_tab_ref}>
            <div className='dc-tabs__item__glass-circle'>
                <div className='dc-tabs__item__futuristic-icon'>
                    <svg viewBox='0 0 24 24' className='dc-tabs__item__icon-svg'>
                        {getFuturisticIcon()}
                    </svg>
                </div>
            </div>
            <div className='dc-tabs__item__content'>
                {header_content || label}
                {!!count && <Counter className='dc-tabs__item__counter' count={count} />}
            </div>
        </li>
    );
};

export default Tab;
