import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './leaflet';
import { updateSettins } from './updateSettings';

// DOM Elements
const leaflet = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (leaflet) {
    const locations = JSON.parse(leaflet.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettins(form, 'data');
    });
}
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent =
            'Updating Password';
        const passwordCurrent =
            document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const confirmPassword =
            document.getElementById('password-confirm').value;
        await updateSettins(
            { passwordCurrent, password, confirmPassword },
            'password'
        );
        document.querySelector('.btn--save-password').textContent =
            'Save Password';
        document.getElementById('password-current').value = '';
        document.getElementById('password-confirm').value = '';
        document.getElementById('password-confirm').value = '';
    });
}
