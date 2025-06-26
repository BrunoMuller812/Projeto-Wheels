

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);


const theme = {
    primary: '#4a69bd', 
    success: '#28a745', 
    error: '#e74c3c',   
    warning: '#f39c12', 
    info: '#3498db',
};


export const showSuccess = (title, text) => {
    MySwal.fire({
        title: `<strong>${title}</strong>`,
        html: `<i>${text}</i>`,
        icon: 'success',
        confirmButtonColor: theme.success,
        timer: 2500,
        timerProgressBar: true,
    });
};


export const showError = (title, text) => {
    MySwal.fire({
        title: `<strong>${title}</strong>`,
        html: `<i>${text}</i>`,
        icon: 'error',
        confirmButtonColor: theme.error,
    });
};


export const showConfirmation = (title, text) => {
    return MySwal.fire({
        title: `<strong>${title}</strong>`,
        html: `<i>${text}</i>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, confirmar!',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: theme.primary,
        cancelButtonColor: theme.error,
        reverseButtons: true
    });
};