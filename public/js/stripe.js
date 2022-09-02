/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
    try {
        const stripe = Stripe(
            'pk_test_51LcbSDImiZICFQHAutkboq45V5tGFHpTZlLtD7cbdXZjkcDsSSiCs5bShHVZ2ciXaN7ECmjhN6fsNPlfRIKVdJTb008AwvKmLG'
        );
        // 1) Get checkout session from API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

        // 2) Create checkout form + chanre credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
