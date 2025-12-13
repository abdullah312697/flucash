const Loading = () => {
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(1 22 38)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const spinnerStyle = {
    width: '80px',
    height: '80px',
    border: '8px solid rgba(0, 255, 255, 0.2)', // light cyan border
    borderTop: '8px solid #00ffff', // cyan color on top
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle}></div>
      <p style={{ marginTop: '15px', fontSize: '1rem', color: '#00ffff' }}>Loading...</p>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;
