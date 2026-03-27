// Load articles from external JSON file
let ARTICLES = [];

fetch('articles.json')
    .then(response => response.json())
    .then(data => {
        ARTICLES = data;
        render();
    })
    .catch(error => console.error('Error loading articles:', error));

let currentFilter = 'all';
let currentSearch = '';

function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${ }()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(escaped, 'gi'), m => `<mark>${m}</mark>`);
}

function render() {
    const grid = document.getElementById('grid');
    const query = currentSearch.toLowerCase();

    const filtered = ARTICLES.filter(a => {
        const matchesSearch = !query ||
            a.rule.toLowerCase().includes(query) ||
            String(a.number).includes(query) ||
            a.details.toLowerCase().includes(query);

        const matchesFilter = currentFilter === 'all' ||
            (currentFilter === 'short' && !a.details) ||
            (currentFilter === 'detailed' && a.details);

        return matchesSearch && matchesFilter;
    });

    document.getElementById('count').textContent = `${filtered.length} article${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-results">No Articles Found<span>Even the Bro Code has limits, Bro.</span></div>`;
        return;
    }

    grid.innerHTML = filtered.map((a, i) => `
    <div class="card" onclick="openModal(${a.number})" style="animation-delay: ${Math.min(i * 0.02, 0.5)}s">
        <div class="card-num">${a.number}</div>
        <div class="card-label">Article ${a.number}</div>
        <div class="card-rule">${highlight(a.rule, currentSearch)}</div>
        ${a.details ? `<div class="card-has-details">+ Read more</div>` : ''}
    </div>
    `).join('');
}

function openModal(num) {
    const a = ARTICLES.find(x => x.number === num);
    if (!a) return;
    document.getElementById('modal-label').textContent = `Article ${a.number}`;
    document.getElementById('modal-num').textContent = a.number;
    document.getElementById('modal-rule').innerHTML = a.rule;
    document.getElementById('modal-details').innerHTML = a.details
        ? a.details.replace(/NOTE:/g, '<strong style="color:var(--gold)">NOTE:</strong>').replace(/COROLLARY:/g, '<strong style="color:var(--gold)">COROLLARY:</strong>')
        : '<em style="opacity:0.4">No additional commentary. The rule speaks for itself, Bro.</em>';
    document.getElementById('overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('overlay').classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('closeBtn').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('search').addEventListener('input', e => {
    currentSearch = e.target.value;
    render();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

render();

// Bro Chant Toggle
const broChant = document.getElementById('bro-chant');
const toggleBtn = document.getElementById('bro-chant-toggle');
