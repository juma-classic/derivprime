import React, { useEffect, useState } from 'react';
import ChunkLoader from '@/components/loader/chunk-loader';

export type LandingWithIntroProps = {
    onFinish: () => void;
};

const LandingWithIntro: React.FC<LandingWithIntroProps> = ({ onFinish }) => {
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        // Auto-hide loader after 3 seconds
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!showLoader) {
            onFinish();
        }
    }, [showLoader, onFinish]);

    return showLoader ? <ChunkLoader message='Loading Trading Platform...' /> : null;
};

export default LandingWithIntro;
