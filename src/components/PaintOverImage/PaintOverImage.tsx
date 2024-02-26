// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';

interface PaintOverImageProps {
  src: string;
  onMaskChange: Dispatch<SetStateAction<string>>;
}

const PaintOverImage: React.FC<PaintOverImageProps> = ({ src, onMaskChange }) => {
  const [isPainting, setIsPainting] = useState(false);
  const [base64Mask, setBase64Mask] = useState(null);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = src; // Use the src prop here
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [src]); //

  const updateBase64Mask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      // @ts-ignore
      const base64Mask = maskCanvas.toDataURL();
      setBase64Mask(base64Mask);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas.getContext('2d');

    const startPaint = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setIsPainting(true);
      lastPosition.current = { x, y };
    };

    const stopPaint = () => {
      setIsPainting(false);
      updateBase64Mask();
      onMaskChange(base64Mask);
    };

    const paint = (event) => {
      if (!isPainting) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      maskContext.fillStyle = 'black';
      maskContext.fillRect(mouseX - 10, mouseY - 10, 20, 20);

      context.fillStyle = 'yellow';
      const size = 10;
      const halfSize = size / 2;
      context.fillRect(mouseX - halfSize, mouseY - halfSize, size, size);

      lastPosition.current = { x: mouseX, y: mouseY };
    };

    if (canvas) {
      canvas.addEventListener('mousedown', startPaint);
      canvas.addEventListener('mouseup', stopPaint);
      canvas.addEventListener('mousemove', paint);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', startPaint);
        canvas.removeEventListener('mouseup', stopPaint);
        canvas.removeEventListener('mousemove', paint);
      }
    };
  }, [isPainting]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ border: '1px solid black' }}
        />
      </div>
      <div>
        <canvas
          ref={maskCanvasRef}
          width={800}
          height={600}
          style={{ border: '1px solid black'}}
        />
      </div>
    </div>
  );
};

export default PaintOverImage;
