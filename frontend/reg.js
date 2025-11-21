const API = 'http://localhost:5000/api';
let isLogin = true;

document.addEventListener('DOMContentLoaded', () => {

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const nameInput = document.getElementById('name');
  const submitBtn = document.getElementById('submitBtn');
  const messageEl = document.getElementById('message');
  const errorEl = document.getElementById('error');

  tabLogin.onclick = () => switchMode(true);
  tabRegister.onclick = () => switchMode(false);

  function switchMode(login) {
    isLogin = login;

    tabLogin.classList.toggle('active', login);
    tabRegister.classList.toggle('active', !login);

    nameInput.classList.toggle('hidden', login);
    submitBtn.textContent = login ? 'Войти' : 'Зарегистрироваться';

    messageEl.textContent = '';
    errorEl.textContent = '';
  }

  submitBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const name = nameInput.value.trim();

    if (!email || !password || (!isLogin && !name)) {
      showError('Заполните все поля');
      return;
    }

    const endpoint = isLogin ? '/login' : '/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        showMessage(isLogin ? 'Вход успешен!' : 'Регистрация успешна!');
        setTimeout(() => location.href = 'main/main.html', 1000);
      } else {
        showError(data.error || 'Ошибка сервера');
      }
    } catch (e) {
      showError('Нет связи с сервером');
    }
  };

  function showMessage(text) {
    messageEl.textContent = text;
    errorEl.textContent = '';
  }

  function showError(text) {
    errorEl.textContent = text;
    messageEl.textContent = '';
  }
});