// src/components/common/BarcodeScanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Spin, Alert, Result } from 'antd';
import { ScanOutlined, BookOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import Quagga from 'quagga';

const ScannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #000;
`;

const ScannerViewport = styled.div`
  width: 100%;
  height: 100%;

  video,
  canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  canvas.drawingBuffer {
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const ScannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
`;

const ScanFrame = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.6);
  width: 280px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScanLine = styled.div`
  position: absolute;
  width: 260px;
  height: 2px;
  background: rgba(0, 255, 71, 0.7);
  animation: scanAnimation 2s linear infinite;

  @keyframes scanAnimation {
    0% {
      transform: translateY(-50px);
    }
    50% {
      transform: translateY(50px);
    }
    100% {
      transform: translateY(-50px);
    }
  }
`;

const BookInfoDisplay = ({ bookInfo }) => (
  <div style={{ textAlign: 'right', maxWidth: '500px', margin: '0 auto' }}>
    <p>
      <strong>כותר:</strong> {bookInfo.title}
    </p>
    {bookInfo.authors && (
      <p>
        <strong>מחבר/ים:</strong> {bookInfo.authors}
      </p>
    )}
    {bookInfo.publisher && (
      <p>
        <strong>הוצאה לאור:</strong> {bookInfo.publisher}
      </p>
    )}
    {bookInfo.publishDate && (
      <p>
        <strong>תאריך הוצאה:</strong> {bookInfo.publishDate}
      </p>
    )}
    {bookInfo.pageCount && (
      <p>
        <strong>מספר עמודים:</strong> {bookInfo.pageCount}
      </p>
    )}
    <p>
      <strong>ISBN:</strong> {bookInfo.isbn}
    </p>
  </div>
);

const BarcodeScanner = ({ onScan, buttonText = 'סרוק ברקוד' }) => {
  const [visible, setVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [detectedCode, setDetectedCode] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scanning) {
        Quagga.stop();
      }
    };
  }, [scanning]);

  const initScanner = () => {
    if (!scannerRef.current) {
      return;
    }

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment', // Use back camera on mobile
            width: { min: 450 },
            height: { min: 300 },
            aspectRatio: { min: 1, max: 2 },
          },
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'code_39_reader',
            'code_128_reader',
            'upc_reader',
          ],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          setScanError(
            'אירעה שגיאה בהפעלת הסורק. אנא ודא שניתנה הרשאת גישה למצלמה.'
          );
          console.error('Error initializing scanner:', err);
          return;
        }

        // Start scanner
        Quagga.start();
        setScanning(true);
        setScanError(null);

        Quagga.onDetected(handleScan);
      }
    );
  };

  const handleScan = async (result) => {
    if (!result || !result.codeResult) return;

    const code = result.codeResult.code;

    // Stop scanner
    Quagga.stop();
    setScanning(false);
    setDetectedCode(code);

    // Try to fetch book info from ISBN
    try {
      setLoading(true);
      const bookData = await fetchBookInfo(code);
      setBookInfo(bookData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching book info:', error);
      // We'll still return the code even if we couldn't get info
    }
  };

  // Fetch book info from Open Library API
  const fetchBookInfo = async (isbn) => {
    try {
      const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const data = await response.json();

      // Check if we got data back
      const bookData = data[`ISBN:${isbn}`];

      if (!bookData) {
        throw new Error('No book information found for this ISBN');
      }

      // Extract useful information
      return {
        title: bookData.title,
        authors: bookData.authors?.map((author) => author.name).join(', '),
        publisher: bookData.publishers?.[0]?.name,
        publishDate: bookData.publish_date,
        coverImage: bookData.cover?.medium,
        pageCount: bookData.number_of_pages,
        isbn: isbn,
      };
    } catch (error) {
      console.error('Error fetching book info:', error);
      return null;
    }
  };

  const showScanner = () => {
    setVisible(true);
    setDetectedCode(null);
    setBookInfo(null);
    setScanError(null);

    // Short delay to ensure the modal is fully visible before initializing
    setTimeout(() => {
      initScanner();
    }, 500);
  };

  const closeScanner = () => {
    if (scanning) {
      Quagga.stop();
      setScanning(false);
    }
    setVisible(false);
  };

  const handleConfirm = () => {
    if (bookInfo) {
      onScan(bookInfo);
    } else if (detectedCode) {
      onScan({ isbn: detectedCode });
    }
    closeScanner();
  };

  const handleRetry = () => {
    setDetectedCode(null);
    setBookInfo(null);
    setScanError(null);
    initScanner();
  };

  // Render scanner content based on state
  const renderScannerContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px' }}>
            מחפש מידע עבור ISBN: {detectedCode}...
          </p>
        </div>
      );
    }

    if (detectedCode) {
      // Use extra props array for buttons
      const extraButtons = [
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          {bookInfo ? 'השתמש במידע' : 'השתמש במספר ISBN'}
        </Button>,
        <Button key="retry" onClick={handleRetry}>
          סריקה חדשה
        </Button>,
      ];

      return (
        <div>
          <Result
            status={bookInfo ? 'success' : 'info'}
            title={bookInfo ? 'נסרק בהצלחה!' : 'ברקוד נסרק'}
            subTitle={
              bookInfo
                ? `נמצא מידע עבור: ${bookInfo.title}`
                : `ISBN: ${detectedCode} (לא נמצא מידע מקוון)`
            }
            extra={extraButtons}
          />

          {bookInfo && <BookInfoDisplay bookInfo={bookInfo} />}
        </div>
      );
    }

    if (scanError) {
      return (
        <Alert
          message="שגיאת סריקה"
          description={scanError}
          type="error"
          showIcon
          action={<Button onClick={handleRetry}>נסה שנית</Button>}
        />
      );
    }

    return (
      <ScannerContainer>
        <ScannerViewport ref={scannerRef} />
        <ScannerOverlay>
          <ScanFrame>
            <ScanLine />
          </ScanFrame>
        </ScannerOverlay>
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'white',
            textShadow: '0 0 2px black',
          }}
        >
          יש למקם את הברקוד בתוך המסגרת
        </div>
      </ScannerContainer>
    );
  };

  return (
    <>
      <Button type="default" icon={<ScanOutlined />} onClick={showScanner}>
        {buttonText}
      </Button>

      <Modal
        title={
          <div>
            <BookOutlined /> סריקת ברקוד ספר
          </div>
        }
        open={visible}
        onCancel={closeScanner}
        footer={null}
        width={detectedCode ? 600 : 400}
        destroyOnClose={true}
        centered
      >
        {renderScannerContent()}
      </Modal>
    </>
  );
};

export default BarcodeScanner;
