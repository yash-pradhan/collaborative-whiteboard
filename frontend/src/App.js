import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css'

const Whiteboard = () => {
    const canvasRef = useRef(null); 
    const [drawing, setDrawing] = useState(false); 
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000'); 
        setSocket(newSocket);
        return () => newSocket.close();
    }, [setSocket]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const draw = (x, y) => {
            context.lineTo(x, y);
            context.stroke();
        };

        const handleDrawing = (data) => {
            draw(data.x, data.y);
        };

        if (socket) {
            socket.on('drawing', handleDrawing);
        }

        return () => {
            if (socket) {
                socket.off('drawing', handleDrawing);
            }
        };
    }, [socket]);

    const startDrawing = (e) => {
        setDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setDrawing(false);
        const context = canvasRef.current.getContext('2d');
        context.beginPath();
    };

    const draw = (e) => {
        if (!drawing) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const context = canvasRef.current.getContext('2d');
        context.lineTo(x, y);
        context.stroke();
        context.beginPath();
        context.moveTo(x, y);

        if (socket) {
            socket.emit('drawing', { x, y });
        }
    };

    return (
      <div className='canvas'>
        <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            style={{ border: '1px solid black' }}
        />
      </div>
    );
};

export default Whiteboard;
