import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const bikeImages = [
        "https://cdn.awsli.com.br/2500x2500/1259/1259538/produto/254948534/krw-bikes---out-20220098-pqmhi8lvsi.jpg",
        "https://baskoniasport.com/818-thickbox_default/bicicleta.jpg",
        "https://decathlonpro.vtexassets.com/arquivos/ids/66233561/16954119599663.jpg?v=638333856052700000"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % bikeImages.length
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [bikeImages.length]);

    const handleViewAvailableBikes = () => {
        navigate('/bikes');
    };

    return (
        <div>
            <div style={homeStyles.imagemPrincipalContainer}>
                <img
                    src="/wheelshomeimage.png"
                    alt="Loja de Bicicletas Wheels"
                    style={homeStyles.imagemPrincipal}
                />
            </div>

            <div style={homeStyles.contentSection}>
                <>
                    <div style={homeStyles.secaoChatbot}>
                        <h1 style={homeStyles.tituloChatbot}>Encontre a bike perfeita, {user?.username}!</h1>
                        <div style={homeStyles.conteudoChatbot}>
                            <div style={homeStyles.imagemChatbotContainer}>
                                <img
                                    src="https://media.tacdn.com/media/attractions-splice-spp-674x446/07/18/e7/91.jpg"
                                    alt="Pessoas andando de bicicleta"
                                    style={homeStyles.imagemChatbot}
                                />
                            </div>
                            <div style={homeStyles.textoChatbotContainer}>
                                <p style={homeStyles.subtituloChatbot}>
                                    <strong>Teste nosso chatbot</strong>
                                </p>
                                <p style={homeStyles.descricaoChatbot}>
                                    Seja para desbravar trilhas desafiadoras, pedalar pela cidade com estilo ou buscar uma opção leve para lazer em família, nosso chatbot está pronto para te guiar. Diga adeus às dúvidas!
                                </p>
                                <p style={homeStyles.descricaoChatbot}>Descreva sua aventura ideal e receba recomendações personalizadas que combinam com seu estilo e necessidades. Encontrar a bike perfeita nunca foi tão fácil!</p>
                                <a
                                    href="http://localhost:8501/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={homeStyles.botaoChatbot}
                                >
                                    Converse com o Chatbot
                                </a>
                            </div>
                        </div>
                    </div>

                    <div style={homeStyles.hrContainer}>
                        <hr style={homeStyles.dividerHr} />
                    </div>

                    <div style={homeStyles.secaoDestaqueBikes}>
                        <h2 style={homeStyles.tituloDestaqueBikes}>Sua Aventura Começa Aqui!</h2>
                        <div style={homeStyles.conteudoDestaqueBikes}>
                            <div style={homeStyles.textoDestaqueContainer}>
                                <p style={homeStyles.subtituloDestaque}>
                                    Explore um mundo de possibilidades sobre duas rodas.
                                </p>
                                <p style={homeStyles.descricaoDestaque}>
                                    Na Wheels, oferecemos uma vasta gama de bicicletas para atender a todos os desejos e necessidades. Seja para trilhas radicais, longas jornadas no asfalto ou manobras urbanas, temos a bike perfeita para sua aventura.
                                </p>
                            </div>
                            <div style={homeStyles.imagemDestaqueContainer}>
                                <div key={currentImageIndex} style={homeStyles.currentImageWrapper}>
                                    <img
                                        src={bikeImages[currentImageIndex]}
                                        alt="Tipos de Bicicletas"
                                        style={homeStyles.imagemDestaque}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleViewAvailableBikes}
                            style={homeStyles.verBikesButton}
                        >
                            VER BIKES DISPONÍVEIS
                        </button>
                    </div>
                </>
            </div>
        </div>
    );
}

const homeStyles = {
    imagemPrincipalContainer: {
        width: '100%',
        overflow: 'hidden',
    },
    imagemPrincipal: {
        width: '100%',
        height: '550px',
        objectFit: 'cover',
        objectPosition: '50% 70%',
        display: 'block',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    },
    contentSection: {
        padding: '10px 20px 40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
    },
    tituloBoasVindas: {
        fontSize: '2em',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    secaoChatbot: {
        marginBottom: '60px',
        textAlign: 'center',
        padding: '20px 0',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    tituloChatbot: {
        textTransform: 'uppercase',
        fontSize: '35px',
        color: '#2c3e50',
        marginBottom: '45px',
        fontWeight: '700',
    },
    conteudoChatbot: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '30px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '30px',
        textAlign: 'left',
    },
    imagemChatbotContainer: {
        flexShrink: 0,
        width: 'auto',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagemChatbot: {
        width: '600px',
        height: 'auto',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
    },
    textoChatbotContainer: {
        flex: 1,
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    subtituloChatbot: {
        fontSize: '1.5em',
        color: '#007bff',
        marginBottom: '15px',
        fontWeight: 'bold',
    },
    descricaoChatbot: {
        fontSize: '1.1em',
        lineHeight: '1.6',
        color: '#555',
        marginBottom: '15px',
    },
    botaoChatbot: {
        textTransform: 'uppercase',
        textDecoration: 'none',
        padding: '15px 30px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.2em',
        fontWeight: '700',
        alignSelf: 'flex-start',
        marginTop: '20px',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
    hrContainer: {
        padding: '40px 0',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    dividerHr: {
        border: 'none',
        borderTop: '2px solid #d0d0d0',
        width: '100%',
        margin: '0 auto',
        height: '0px',
    },
    secaoDestaqueBikes: {
        padding: '60px 0',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    tituloDestaqueBikes: {
        textTransform: 'uppercase',
        fontSize: '2.2em',
        color: '#2c3e50',
        marginBottom: '40px',
        marginTop: '20px',
        fontWeight: '700',
    },
    conteudoDestaqueBikes: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '30px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '100%',
    },
    imagemDestaqueContainer: {
        flexShrink: 0,
        width: 'auto',
        height: '350px',
        maxWidth: '550px',
        overflow: 'hidden',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        position: 'relative',
    },
    currentImageWrapper: {
        width: '100%',
        height: '100%',
        transition: 'opacity 0.7s ease-in-out',
        opacity: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagemDestaque: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
    },
    textoDestaqueContainer: {
        flex: 1,
        textAlign: 'left',
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    subtituloDestaque: {
        fontSize: '1.6em',
        color: '#007bff',
        marginBottom: '20px',
        fontWeight: 'bold',
    },
    descricaoDestaque: {
        fontSize: '1.1em',
        lineHeight: '1.7',
        color: '#555',
        marginBottom: '15px',
    },
    verBikesButton: {
        padding: '15px 35px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.3em',
        fontWeight: '700',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        marginTop: '40px',
        marginBottom: '20px',
        alignSelf: 'center',
    },
    grupoBotoes: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxWidth: '300px',
        margin: '0 auto',
    },
    botaoAcao: {
        padding: '12px 25px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
};

export default Home;