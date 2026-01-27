import { observer } from 'mobx-react-lite';
import SimpleLoader from '@/components/loader/simple-loader';
import { useStore } from '@/hooks/useStore';

const BlocklyLoading = observer(() => {
    const { blockly_store } = useStore();
    const { is_loading } = blockly_store;

    return (
        <>
            {is_loading && (
                <div className='bot__loading' data-testid='blockly-loader'>
                    <SimpleLoader message='Loading Blockly...' size='medium' />
                </div>
            )}
        </>
    );
});

export default BlocklyLoading;
