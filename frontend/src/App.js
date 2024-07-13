import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css'

const Whiteboard = () => {
    const canvasRef = useRef(null); // Reference to the canvas element
    const [drawing, setDrawing] = useState(false); // State to track whether the user is currently drawing
    const [socket, setSocket] = useState(null); // State to store the socket connection

    // Establish a socket connection when the component mounts
    useEffect(() => {
        const newSocket = io('http://localhost:5000'); // Connect to the backend server
        setSocket(newSocket);

        return () => newSocket.close(); // Cleanup on component unmount
    }, [setSocket]);

    // Handle socket events
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Function to draw on the canvas
        const draw = (x, y) => {
            context.lineTo(x, y); // Draw a line to the new coordinates
            context.stroke(); // Actually draw the line
        };

        // Handle incoming drawing data from the socket
        const handleDrawing = (data) => {
            draw(data.x, data.y);
        };

        if (socket) {
            socket.on('drawing', handleDrawing); // Listen for drawing events from the server
        }

        return () => {
            if (socket) {
                socket.off('drawing', handleDrawing); // Cleanup socket event listener on component unmount
            }
        };
    }, [socket]);

    // Handle mouse down event to start drawing
    const startDrawing = (e) => {
        setDrawing(true);
        draw(e);
    };

    // Handle mouse up event to stop drawing
    const stopDrawing = () => {
        setDrawing(false);
        const context = canvasRef.current.getContext('2d');
        context.beginPath(); // Reset the path so the next line starts clean
    };

    // Handle mouse move event to draw on the canvas
    const draw = (e) => {
        if (!drawing) return; // Only draw if the user is currently drawing

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // Calculate x position relative to the canvas
        const y = e.clientY - rect.top; // Calculate y position relative to the canvas

        const context = canvasRef.current.getContext('2d');
        context.lineTo(x, y); // Draw line to new position
        context.stroke(); // Actually draw the line
        context.beginPath(); // Reset the path so the next line starts clean
        context.moveTo(x, y); // Move to the new position

        if (socket) {
            socket.emit('drawing', { x, y }); // Send the drawing data to the server
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
