import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        if ((res.data.status = 'success')) {
            showAlert('sucess', 'Logged In Successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
        console.log(res);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
export const logout = async (req, res) => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:8000/api/v1/users/logout',
        });
        if ((res.data.status = 'success')) {
            location.reload(true);
        }
        console.log(res);
    } catch (err) {
        showAlert('error', 'Error Logging out, try Again');
    }
};