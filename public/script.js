function loadTheme() {
    const themeCookie = document.cookie.split('; ').find(row => row.startsWith('theme='));

    if (themeCookie) {
        const theme = themeCookie.split('=')[1];
        document.documentElement.setAttribute('data-theme', theme);
    }
}

async function updateData() {
    const response = await fetch('api/data');
    const data = await response.json();

    document.getElementById('data-container').innerHTML = `
    <h3>Данные API</h3>
    <p><strong>Источник:</strong> ${data.source}</p>
    <p><strong>Время генерации:</strong> ${new Date(data.timestamp).toLocaleTimeString()}</p>
    <pre>${JSON.stringify(data.items, null, 2)}</pre>
    `;
}

document.getElementById('toggle-theme').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);

    fetch('/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
    });
});


document.getElementById('refresh-data').addEventListener('click', updateData);

loadTheme();
updateData();

setInterval(updateData, 5000);