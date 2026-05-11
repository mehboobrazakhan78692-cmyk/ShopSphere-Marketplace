import React from 'react';

const Loader = ({ fullPage = false }) => {
  const spinner = (
    <div className="loader" style={{
      width: '48px',
      height: '48px',
      border: '5px solid #f3f3f3',
      borderBottomColor: '#f90',
      borderRadius: '50%',
      display: 'inline-block',
      boxSizing: 'border-box',
      animation: 'rotation 1s linear infinite'
    }} />
  );

  const containerStyle = fullPage ? {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#eaeded',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  return (
    <div style={containerStyle}>
      {spinner}
      <style>{`
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
