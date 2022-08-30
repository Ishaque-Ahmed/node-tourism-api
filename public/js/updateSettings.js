import axios from 'axios';
import { showAlert } from './alerts';

// type is either password or data
// data => data object
export const updateSettins = async (data, type) => {
    try {
        const url =
            type === 'password'
                ? 'http://localhost:8000/api/v1/users/updateMyPassword'
                : 'http://localhost:8000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data,
        });
        if ((res.data.status = 'success')) {
            showAlert('success', `${type.toUpperCase()} Updated Succesfully`);
            location.reload(true);
        }
        console.log(res);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
