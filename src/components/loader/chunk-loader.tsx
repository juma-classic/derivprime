import React from 'react';
import './chunk-loader.scss';

export default function ChunkLoader({ message }: { message: string }) {
    return (
        <div className='app-root modern-loader'>
            <div className='loader-container'>
                {/* Animated Logo/Brand */}
                <div className='brand-container'>
                    <div className='brand-text'>
                        <span className='ceo'>CEO</span>
                        <span className='paul'>PAUL</span>
                    </div>
                    <div className='brand-subtitle'>Trading Platform</div>
                </div>

                {/* Modern Spinner */}
                <div className='spinner-container'>
                    <div className='spinner'>
                        <div className='spinner-ring'></div>
                        <div className='spinner-ring'></div>
                        <div className='spinner-ring'></div>
                    </div>
                </div>

                {/* Loading Message */}
                <div className='load-message'>{message}</div>

                {/* Progress Bar */}
                <div className='progress-container'>
                    <div className='progress-bar'>
                        <div className='progress-fill'></div>
                    </div>
                </div>
            </div>

            {/* Background Animation */}
            <div className='background-animation'>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={`floating-particle particle-${i + 1}`}></div>
                ))}
            </div>
        </div>
    );
}
