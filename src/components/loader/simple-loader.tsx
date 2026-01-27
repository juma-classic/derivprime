import React from 'react';
import './simple-loader.scss';

interface SimpleLoaderProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

const SimpleLoader: React.FC<SimpleLoaderProps> = ({ message, size = 'medium' }) => {
    return (
        <div className={`simple-loader simple-loader--${size}`}>
            <div className='simple-loader__container'>
                <div className='simple-loader__circles'>
                    <div className='simple-loader__circle simple-loader__circle--1'>
                        <svg viewBox='0 0 24 24' className='simple-loader__icon'>
                            <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z' />
                        </svg>
                    </div>
                    <div className='simple-loader__circle simple-loader__circle--2'>
                        <svg viewBox='0 0 24 24' className='simple-loader__icon'>
                            <path d='M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12S9.79 8 12 8 16 9.79 16 12 14.21 16 12 16Z' />
                        </svg>
                    </div>
                    <div className='simple-loader__circle simple-loader__circle--3'>
                        <svg viewBox='0 0 24 24' className='simple-loader__icon'>
                            <path d='M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2ZM12 4.5L10.18 8.5L6 9L10.18 9.5L12 13.5L13.82 9.5L18 9L13.82 8.5L12 4.5Z' />
                        </svg>
                    </div>
                    <div className='simple-loader__circle simple-loader__circle--4'>
                        <svg viewBox='0 0 24 24' className='simple-loader__icon'>
                            <path d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5C14.8 6.1 14.6 5.7 14.3 5.4L16.5 1.5L15 0.5L12.9 4.3C12.6 4.1 12.3 4 12 4S11.4 4.1 11.1 4.3L9 0.5L7.5 1.5L9.7 5.4C9.4 5.7 9.2 6.1 9 6.5L3 7V9L9 9.5C9.2 9.9 9.4 10.3 9.7 10.6L7.5 14.5L9 15.5L11.1 11.7C11.4 11.9 11.7 12 12 12S12.6 11.9 12.9 11.7L15 15.5L16.5 14.5L14.3 10.6C14.6 10.3 14.8 9.9 15 9.5L21 9Z' />
                        </svg>
                    </div>
                </div>
                {message && <div className='simple-loader__message'>{message}</div>}
            </div>
        </div>
    );
};

export default SimpleLoader;
