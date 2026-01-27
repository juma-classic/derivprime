import React from 'react';
import { localize } from '@deriv-com/translations';
import { LinearProgressBar, Text } from '@deriv-com/ui';
import { QsSteps } from './trade-constants';

type TQSStepper = {
    current_step: QsSteps;
    is_mobile?: boolean;
};

const QSStepper = ({ current_step, is_mobile = false }: TQSStepper) => {
    const percentage = current_step === QsSteps.StrategyCompleted ? 100 : 50;
    const labels = [localize('Default'), localize('Strategy template'), localize('Trade parameters')];

    return is_mobile ? (
        <LinearProgressBar percentage={percentage} label='' danger_limit={101} is_loading={false} warning_limit={0} />
    ) : (
        <div className='qs-stepper'>
            {labels.map((label, index) => (
                <div key={index} className={`qs-stepper__step ${index === current_step ? 'active' : ''}`}>
                    <div className='qs-stepper__step-number'>{index + 1}</div>
                    <Text size='xs'>{label}</Text>
                </div>
            ))}
        </div>
    );
};

export default QSStepper;
