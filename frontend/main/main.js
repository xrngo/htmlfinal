const API = 'http://localhost:5000/api';

const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    location.replace('../reg.html');
    throw new Error('Redirecting...');
}

const gear = [
    { name: "G-Wolves Hati-S ACE",        price: 15990, img: "img/gwools.jpg", desc: "42 г • 8K поллинг • выбор s1mple" },
    { name: "Wooting 60HE+",             price: 22990, img: "img/wooting.jpg", desc: "Rapid Trigger • Hall-effect" },
    { name: "WLmouse Beast X 8K",        price: 21990, img: "img/wlmouse.webp", desc: "38 г • магний • выбор ZywOo" },
    { name: "Pwnage StormBreaker",       price: 19990, img: "img/pwnage.webp", desc: "51 г • магниевая рама" },
    { name: "Lamzu Atlantis",            price: 17990, img: "img/lamzu.webp",  desc: "54 г • отличный баланс" },
    { name: "Vaxee XE Wireless",         price: 18990, img: "img/vaxee.jpg",    desc: "классика от Vaxee" },
    { name: "Razer Viper V3 Pro",        price: 24990, img: "img/razer.webp",   desc: "56 г • 8K • Focus Pro 35K • выбор donk" },
    { name: "Logitech G Pro X Superlight 2", price: 23990, img: "img/logitech.webp", desc: "60 г • HERO 2 • выбор m0NESY" }
];

const pros = {
    s1mple: {mouse:"G-Wolves Hati-S ACE", kb:"Wooting 60HE", dpi:400, sens:2.5, team:"NAVI"},
    ZywOo:  {mouse:"WLmouse Beast X",     kb:"Custom",      dpi:400, sens:1.8, team:"Vitality"},
    TenZ:   {mouse:"Finalmouse",          kb:"Wooting Two HE", dpi:1600, sens:0.32, team:"Sentinels"}
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('name').textContent = user.name || user.email;

    document.getElementById('logout').onclick = () => {
        localStorage.clear();
        location.href = '../reg.html';
    };

    window.showPro = (name) => {
        const p = pros[name];
        document.getElementById('proInfo').innerHTML = `
            <h3>${name}</h3>
            <p><strong>Мышь:</strong> ${p.mouse}</p>
            <p><strong>Клавиатура:</strong> ${p.kb}</p>
            <p><strong>DPI:</strong> ${p.dpi} • <strong>Sens:</strong> ${p.sens}</p>
            <p><strong>Команда:</strong> ${p.team}</p>
        `;
        document.getElementById('proModal').classList.add('active');
    };

    window.showProduct = async (productId) => {
        try {
            const baseRes = await fetch(API + '/products');
            const baseJson = await baseRes.json();
            const product = baseJson.data.find(p => p.id === productId);
            if (!product) return alert('Товар не найден');

            const item = gear.find(g => g.name === product.name);

            const revRes = await fetch(`${API}/products/${productId}/reviews`);
            const revJson = await revRes.json();
            const reviews = (revJson.data || []).map(r => `
                <div class="review">
                    <strong>${r.user_name || 'Аноним'}</strong>: ${r.review}
                    <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
                </div>
            `).join('') || '<p style="color:#999">Отзывов пока нет</p>';

            document.getElementById('productInfo').innerHTML = `
                <img src="${item?.img || '../images/placeholder.png'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">${product.price.toLocaleString()} ₽</div>
                <p>${item?.desc || product.description || 'Описание скоро появится'}</p>
                <div class="reviews"><h4>Отзывы</h4>${reviews}</div>
                <button onclick="addReview(${productId})" class="review-btn">Оставить отзыв</button>
            `;
            document.getElementById('productModal').classList.add('active');
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки товара');
        }
    };

    window.addReview = async (productId) => {
        const text = prompt('Ваш отзыв:');
        if (!text?.trim()) return;
        const stars = parseInt(prompt('Оценка (1-5):', '5') || '5');
        if (stars < 1 || stars > 5) return alert('Оценка от 1 до 5');

        await fetch(`${API}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, product_id: productId, review: text.trim(), stars })
        });
        alert('Отзыв добавлен!');
        closeModal();
        loadProducts();
    };

    window.closeModal = () => {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    };

    async function loadProducts() {
        const res = await fetch(API + '/products');
        const json = await res.json();

        if (!json.data || json.data.length < gear.length) {
            document.querySelector('.loading').textContent = 'Добавляю/обновляю товары...';
            const startFrom = json.data ? json.data.length : 0;
            for (let i = startFrom; i < gear.length; i++) {
                await fetch(API + '/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: gear[i].name,
                        price: gear[i].price,
                        description: gear[i].desc,
                        image_url: gear[i].img
                    })
                });
            }
            location.reload();
            return;
        }

        document.getElementById('products').innerHTML = json.data.map(p => {
            const item = gear.find(g => g.name === p.name);
            return `
                <div class="card" onclick="showProduct(${p.id})">
                    <img src="${item?.img || '../images/placeholder.png'}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <div class="price">${p.price.toLocaleString()} ₽</div>
                </div>
            `;
        }).join('');

        document.querySelector('.loading')?.remove();
    }

    loadProducts();
});