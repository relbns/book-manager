import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, message, Spin } from 'antd';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ScanOutlined,
  LoadingOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const ScannerContainer = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const ScanOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 10;
  text-align: center;
  padding: 16px;
`;

const ScanFrame = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px solid #1890ff;
  border-radius: 8px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.5);
  z-index: 5;

  @media (max-width: 768px) {
    width: 180px;
    height: 180px;
  }
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    color: white;
  }
`;

const BarcodeScanner = ({
  onScan,
  buttonText = 'סרוק ברקוד',
  buttonType = 'default',
  buttonSize = 'middle',
  block = false,
  style = {},
}) => {
  const [visible, setVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanning = async () => {
    if (!scannerRef.current) {
      message.error('לא ניתן לאתחל את הסורק');
      return;
    }

    try {
      setInitializing(true);

      const html5QrCode = new Html5Qrcode('barcode-scanner-container');
      html5QrCodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText) => {
        console.log('Scan successful:', decodedText);
        stopScanning();

        // Make sure onScan is properly called with the scanned barcode
        if (typeof onScan === 'function') {
          onScan({ isbn: decodedText });
          message.success('ברקוד נסרק בהצלחה');
        } else {
          console.error('onScan is not a function!');
          message.error('שגיאה בעיבוד הברקוד');
        }

        setVisible(false);
      };

      const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        formatsToSupport: [
          Html5Qrcode.FORMATS.EAN_13,
          Html5Qrcode.FORMATS.EAN_8,
          Html5Qrcode.FORMATS.ISBN,
        ],
      };

      // Ask for camera permission
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const cameraId = devices[0].id;

          await html5QrCode.start(
            { deviceId: cameraId },
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {
              // This is just warning/info, don't stop scanning
              console.warn('Scanner message:', errorMessage);
            }
          );

          setScanning(true);
        } else {
          throw new Error('No cameras found');
        }
      } catch (err) {
        console.log('Falling back to default camera');
        // Fall back to default camera
        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {
              // This is just warning/info, don't stop scanning
              console.warn('Scanner message:', errorMessage);
            }
          );
          setScanning(true);
        } catch (finalErr) {
          console.error('Failed to start scanner with any camera:', finalErr);
          message.error('לא ניתן לגשת למצלמה. אנא ודא שנתת הרשאה למצלמה.');
          setScanning(false);
          setVisible(false);
        }
      }
    } catch (err) {
      console.error('Error initializing scanner:', err);
      message.error('שגיאה באתחול הסורק');
    } finally {
      setInitializing(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          console.log('Scanner stopped successfully');
        })
        .catch((error) => {
          console.error('Error stopping scanner:', error);
        })
        .finally(() => {
          setScanning(false);
          html5QrCodeRef.current = null;
        });
    }
  };

  const showScanner = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    stopScanning();
    setVisible(false);
  };

  useEffect(() => {
    if (visible && !scanning && !initializing) {
      // Slight delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        startScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible, scanning, initializing]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <>
      <Button
        type={buttonType}
        icon={<ScanOutlined />}
        onClick={showScanner}
        size={buttonSize}
        block={block}
        style={style}
      >
        {buttonText}
      </Button>

      <Modal
        title="סריקת ברקוד"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        centered
        closeIcon={<CloseOutlined />}
        styles={{
          body: { padding: '12px 0' },
          mask: { background: 'rgba(0, 0, 0, 0.85)' },
        }}
      >
        <ScannerContainer>
          <div
            ref={scannerRef}
            id="barcode-scanner-container"
            style={{ width: '100%', height: '100%' }}
          />

          <ScanFrame />

          {initializing && (
            <ScanOverlay>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <p style={{ marginTop: 12 }}>אתחול המצלמה...</p>
            </ScanOverlay>
          )}

          {scanning && !initializing && (
            <ScanOverlay>
              <p>הצב את הברקוד בתוך המסגרת</p>
              <p style={{ fontSize: '12px', marginTop: 8 }}>
                ודא שהברקוד נמצא בתאורה טובה וללא השתקפויות
              </p>
            </ScanOverlay>
          )}

          <CloseButton
            icon={<CloseOutlined />}
            onClick={handleCancel}
            size="small"
            aria-label="סגור"
          />
        </ScannerContainer>
      </Modal>
    </>
  );
};

export default BarcodeScanner;
