import React from 'react';
import bikeLoaderGif from '../../assets/bike-loader.gif';

const LoadingSpinner = () => {
  return (
    <div style={styles.spinnerContainer}>
      <img 
        src={bikeLoaderGif}
        alt="Carregando..." 
        style={styles.spinnerImage}
      />
      <p style={styles.spinnerText}>Buscando informações...</p>
    </div>
  );
};

const styles = {
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px',
    minHeight: '300px',
  },
  spinnerImage: {
    width: '480px',
    height: '360px',
  },
  spinnerText: {
    marginTop: '20px',
    fontSize: '1.2em',
    color: '#555',
  },
};

export default LoadingSpinner;