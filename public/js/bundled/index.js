require('@babel/polyfill');
var e = require('axios');
function t(e) {
    return e && e.__esModule ? e.default : e;
}
const o = () => {
        const e = document.querySelector('.alert');
        e && e.parentElement.removeChild(e);
    },
    a = (e, t) => {
        o();
        const a = `<div class="alert alert--${e}">${t}</div`;
        document.querySelector('body').insertAdjacentHTML('afterbegin', a),
            window.setTimeout(o, 5e3);
    },
    s = async (o, s) => {
        try {
            const n = await t(e)({
                method: 'POST',
                url: '/api/v1/users/login',
                data: { email: o, password: s },
            });
            (n.data.status = 'success'),
                a('sucess', 'Logged In Successfully'),
                window.setTimeout(() => {
                    location.assign('/');
                }, 1500),
                console.log(n);
        } catch (e) {
            a('error', e.response.data.message);
        }
    },
    n = (e) => {
        var t = L.map('map', { zoomControl: !1 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(t);
        const o = [];
        e.forEach((e) => {
            o.push([e.coordinates[1], e.coordinates[0]]),
                L.marker([e.coordinates[1], e.coordinates[0]])
                    .addTo(t)
                    .bindPopup(`<p>Day ${e.day}: ${e.description}</p>`, {
                        autoClose: !1,
                    })
                    .openPopup();
        });
        const a = L.latLngBounds(o).pad(0.5);
        t.fitBounds(a), t.scrollWheelZoom.disable();
    },
    r = async (o, s) => {
        try {
            const n =
                    'password' === s
                        ? '/api/v1/users/updateMyPassword'
                        : '/api/v1/users/updateMe',
                r = await t(e)({ method: 'PATCH', url: n, data: o });
            (r.data.status = 'success'),
                a('success', `${s.toUpperCase()} Updated Succesfully`),
                location.reload(!0),
                console.log(r);
        } catch (e) {
            a('error', e.response.data.message);
        }
    },
    d = async (o) => {
        try {
            const a = Stripe(
                    'pk_test_51LcbSDImiZICFQHAutkboq45V5tGFHpTZlLtD7cbdXZjkcDsSSiCs5bShHVZ2ciXaN7ECmjhN6fsNPlfRIKVdJTb008AwvKmLG'
                ),
                s = await t(e)(`/api/v1/bookings/checkout-session/${o}`);
            console.log(s),
                await a.redirectToCheckout({ sessionId: s.data.session.id });
        } catch (e) {
            console.log(e), a('error', e);
        }
    },
    c = document.getElementById('map'),
    u = document.querySelector('.form--login'),
    l = document.querySelector('.nav__el--logout'),
    i = document.querySelector('.form-user-data'),
    m = document.querySelector('.form-user-password'),
    p = document.getElementById('book-tour');
if (c) {
    n(JSON.parse(c.dataset.locations));
}
u &&
    u.addEventListener('submit', (e) => {
        e.preventDefault();
        const t = document.getElementById('email').value,
            o = document.getElementById('password').value;
        s(t, o);
    }),
    l &&
        l.addEventListener('click', async (o, s) => {
            try {
                ((
                    await t(e)({ method: 'GET', url: '/api/v1/users/logout' })
                ).data.status = 'success'),
                    location.reload(!0);
            } catch (e) {
                console.log(e), a('error', 'Error Logging out, try Again');
            }
        }),
    i &&
        i.addEventListener('submit', (e) => {
            e.preventDefault();
            const t = new FormData();
            t.append('name', document.getElementById('name').value),
                t.append('email', document.getElementById('email').value),
                t.append('photo', document.getElementById('photo').files[0]),
                r(t, 'data');
        }),
    m &&
        m.addEventListener('submit', async (e) => {
            e.preventDefault(),
                (document.querySelector('.btn--save-password').textContent =
                    'Updating Password');
            const t = document.getElementById('password-current').value,
                o = document.getElementById('password').value,
                a = document.getElementById('password-confirm').value;
            await r(
                { passwordCurrent: t, password: o, confirmPassword: a },
                'password'
            ),
                (document.querySelector('.btn--save-password').textContent =
                    'Save Password'),
                (document.getElementById('password-current').value = ''),
                (document.getElementById('password-confirm').value = ''),
                (document.getElementById('password-confirm').value = '');
        }),
    p &&
        p.addEventListener('click', (e) => {
            e.target.textContent = 'Processing...';
            const { tourId: t } = e.target.dataset;
            d(t);
        });
//# sourceMappingURL=index.js.map
