import React from 'react';
import bikeLoaderGif from '../../assets/bike-loader.gif';

// Este é o nosso componente de loading personalizado
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

// Estilos para centralizar o componente e dar uma aparência legal
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