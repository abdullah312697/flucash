// Import React
import React from 'react';

// Define the Loading component
const Loading = () => {
  // Define styles for the loading container
  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Full viewport height
    width: '100vw', // Full viewport width
    background: 'linear-gradient(90deg, #011626, #ccc9)',
    animation: 'gradientAnimation 3s ease infinite', // Apply animation
  };

  // Define keyframes for the gradient animation
  const keyframesStyle = `
    @keyframes gradientAnimation {
      0% {
        background: linear-gradient(90deg, #011626, #ccc9);
      }
      50% {
        background: linear-gradient(0deg, #011626, #ccc9);
      }
      100% {
        background: linear-gradient(90deg, #011626, #ccc9);
      }
    }
  `;

  return (
    <div style={loadingStyle}>
      <style>{keyframesStyle}</style> {/* Add keyframes to the component */}
    </div>
  );
};

export default Loading;
