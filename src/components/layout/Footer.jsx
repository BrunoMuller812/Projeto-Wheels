import layoutStyles from './layoutStyles'; 

function Footer() {
    return (
        <footer style={footerStyles.footer}>
            <div style={footerStyles.footerContent}>
                <div style={footerStyles.section}>
                    <h3 style={footerStyles.sectionTitle}>Wheels - Aluguel de Bicicletas</h3>
                    <p style={footerStyles.text}>Alugue a bicicleta perfeita para sua aventura urbana ou trilha!</p>
                    <p style={footerStyles.contactInfo}>
                        Email: contato@wheels.com <br/>
                        Telefone: (21) 4002-8922
                    </p>
                </div>

                <div style={footerStyles.section}>
                    <h3 style={footerStyles.sectionTitle}>Links Úteis</h3>
                    <ul style={footerStyles.navList}>
                        <li><a href="#" style={footerStyles.navLink}>Sobre Nós</a></li>
                        <li><a href="#" style={footerStyles.navLink}>Termos de Serviço</a></li>
                        <li><a href="#" style={footerStyles.navLink}>Política de Privacidade</a></li>
                        <li><a href="#" style={footerStyles.navLink}>FAQ</a></li>
                    </ul>
                </div>

                <div style={footerStyles.section}>
                    <h3 style={footerStyles.sectionTitle}>Siga-nos</h3>
                    <div style={footerStyles.socialIcons}>
                        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
                            <i className="fab fa-facebook" style={footerStyles.icon}></i> Facebook
                        </a>
                        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
                            <i className="fab fa-instagram" style={footerStyles.icon}></i> Instagram
                        </a>
                        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink}>
                            <i className="fab fa-twitter" style={footerStyles.icon}></i> Twitter
                        </a>
                    </div>
                </div>
            </div>
            <div style={footerStyles.copyright}>
                <p>&copy; {new Date().getFullYear()} Wheels - Aluguel de Bicicletas. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}

const footerStyles = {
    footer: {
        backgroundColor: layoutStyles.footerBgColor,
        color: layoutStyles.textColor,
        fontFamily: layoutStyles.fontFamily,
        padding: layoutStyles.sectionPadding,
        borderTop: `1px solid ${layoutStyles.secondaryColor}`,
    },
    footerContent: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '30px',
    },
    section: {
        flex: '1',
        minWidth: '200px',
        textAlign: 'left',
    },
    sectionTitle: {
        fontSize: '20px',
        marginBottom: '15px',
        color: layoutStyles.primaryColor,
        fontWeight: '600',
    },
    text: {
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '10px',
    },
    contactInfo: {
        fontSize: '14px',
        lineHeight: '1.5',
        marginTop: '15px',
        color: '#adb5bd',
    },
    navList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
    },
    navLink: {
        color: layoutStyles.textColor,
        textDecoration: 'none',
        fontSize: '15px',
        marginBottom: '8px',
        display: 'block',
        transition: 'color 0.3s ease',
    },
    socialIcons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    socialLink: {
        color: layoutStyles.textColor,
        textDecoration: 'none',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.3s ease',
    },
    icon: {
        marginRight: '8px',
        fontSize: '18px',
    },
    copyright: {
        textAlign: 'center',
        fontSize: '14px',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#adb5bd',
    },
};

export default Footer;