import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const ScannerContainer = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
`;

const BarcodeScanner = ({ onScan, buttonText = 'סרוק ברקוד' }) => {
  const [visible, setVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanning = () => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText) => {
      stopScanning();
      onScan({ isbn: decodedText });
      setVisible(false);
    };

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    html5QrCode.start(
      { facingMode: 'environment' },
      config,
      qrCodeSuccessCallback,
      (errorMessage) => {
        console.error('Scan error:', errorMessage);
      }
    );

    setScanning(true);
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          setScanning(false);
          html5QrCodeRef.current = null;
        })
        .catch((error) => {
          console.error('Error stopping scanner:', error);
        });
    }
  };

  const showScanner = () => {
    setVisible(true);
    // Slight delay to ensure modal is rendered
    setTimeout(startScanning, 500);
  };

  const handleCancel = () => {
    stopScanning();
    setVisible(false);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <>
      <Button type="default" icon={<ScanOutlined />} onClick={showScanner}>
        {buttonText}
      </Button>

      <Modal
        title="סריקת ברקוד"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <ScannerContainer>
          <div
            ref={scannerRef}
            id="barcode-scanner-container"
            style={{ width: '100%', height: '100%' }}
          />
          {scanning && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 10,
              }}
            >
              הצב את הברקוד בתוך המסגרת
            </div>
          )}
        </ScannerContainer>
      </Modal>
    </>
  );
};

export default BarcodeScanner;
