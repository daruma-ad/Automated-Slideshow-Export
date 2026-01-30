import { CSSProperties } from 'react';

export const subtitleStyles: Record<string, CSSProperties> = {
    simple: {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '10px 20px',
        borderRadius: '8px',
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        width: '80%',
    },
    center: {
        fontFamily: 'serif',
        fontSize: '80px',
        color: 'white',
        textShadow: '0 4px 6px rgba(0,0,0,0.5)',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        width: '100%',
        fontWeight: 'bold',
    },
    handwritten: {
        fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', // Fallback
        fontSize: '60px',
        color: '#FFD700', // Gold
        textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
        position: 'absolute',
        bottom: '100px',
        right: '50px',
        textAlign: 'right',
    },
    minimal: {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: 'white',
        backgroundColor: 'black',
        padding: '4px 8px',
        position: 'absolute',
        bottom: '30px',
        left: '30px',
    }
};
