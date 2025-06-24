import React from 'react';
import Header from './Header';
import Footer from './Footer';

function MainLayout({ children }) {
    return (
        <div style={layoutContainerStyles}>
            <Header />
            <main style={mainContentStyles}>
                {children}
            </main>
            <Footer />
        </div>
    );
}

const layoutContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh', 
};

const mainContentStyles = {
    flex: 1,
};

export default MainLayout;