import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Modal, notification } from 'antd';
import {
  generateContract,
} from '../../../features/servicenow/contract/contractSlice';
import { 
  getQuote
} from '../../../features/servicenow/quote/quotaSlice';

const SignatureModal = ({dispatch, quoteId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signature, setSignature] = useState(null);
    const [partiallyLoading, setPartiallyLoading] = useState(false);
    const sigCanvas = useRef(null);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleGenerateContract = async (signatureData) => {
        try {
            setPartiallyLoading(true);
            // Here you would typically send the signature data along with the contract generation
            // You might need to modify your generateContract action to accept signature data
            await dispatch(generateContract({ 
                quoteId, 
                signature: signatureData 
            })).unwrap();
            
            notification.success({
                message: 'Success',
                description: 'Contract generated successfully with your signature'
            });
            dispatch(getQuote(quoteId)); // Refresh the quote data
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to generate contract'
            });
        } finally {
            setPartiallyLoading(false);
        }
    };

   const handleOk = async () => {
    // Check if canvas is empty
    if (sigCanvas.current?.isEmpty()) {
        notification.warning({
            message: 'Warning',
            description: 'Please provide a signature before saving'
        });
        return;
    }

    const signatureData = sigCanvas.current?.toDataURL();
    setSignature(signatureData);
    console.log(signatureData);
    console.log(quoteId);
    
    setIsModalOpen(false);
    
    // Call the contract generation with the signature
     await handleGenerateContract(signatureData);
};

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
    };

    return (
        <div className="">
            <button 
                className="overflow-hidden relative w-fit px-2 h-10 bg-cyan-700 text-white hover:bg-cyan-800 cursor-pointer"
                onClick={showModal}
                disabled={partiallyLoading}
            >
                {partiallyLoading ? 'Generating...' : 'Generate Contract'}
            </button>

           
            <Modal
                title="Please Sign Below"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <div className="p-4 border border-gray-300 relative">
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{
                            width: 750,
                            height: 200,
                            className: 'w-full signature-canvas',
                        }}
                        penColor='#104e64'
                    />
                    <button 
                        className='z-50 absolute top-0 right-0 px-2 py-1 cursor-pointer hover:scale-105' 
                        onClick={clearSignature}
                    >
                        <i className="ri-delete-back-2-fill text-cyan-700 text-2xl"></i>
                    </button>
                </div>
                <div className='mt-2 pt-3 flex justify-end '>
                    <button 
                        className="overflow-hidden text-base relative w-fit px-2 h-10 bg-cyan-700 text-white hover:bg-cyan-800 cursor-pointer"
                        onClick={handleOk}
                        disabled={partiallyLoading}
                    >
                        {partiallyLoading ? 'Saving...' : 'Generate Contract'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SignatureModal;