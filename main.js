

/* ===============================
   CONFIG
================================ */
const API_URL = 'http://localhost:5000/api/projects';
const ITEMS_PER_PAGE = 3;

/* ===============================
   STATE
================================ */
let projects = [];
let currentFilter = 'all';
let currentPage = 1;

/* ===============================
   FETCH PROJECTS
================================ */
async function fetchProjects() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        projects = await response.json();

        // Keep the current filter if it was set
        document.querySelector(`[data-filter="${currentFilter}"]`)?.click();

        renderPortfolio();
    } catch (error) {
        console.error('Error fetching projects:', error);
        if (grid) grid.innerHTML = '<p class="text-white text-center w-full col-span-full">Gagal memuat portofolio</p>';
    }
}

/* ===============================
   ELEMENTS
================================ */
const grid = document.getElementById('portfolioGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const paginationEl = document.getElementById('pagination');

/* ===============================
   RENDER PORTFOLIO
================================ */
function renderPortfolio() {
    grid.innerHTML = '';

    // filter
    let filtered =
        currentFilter === 'all'
            ? projects
            : projects.filter(p => p.category === currentFilter);

    // pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    // render items
    paginatedItems.forEach(p => {
        const card = document.createElement('div');
        card.className =
            'portfolio-item group relative overflow-hidden rounded-3xl glass transition-all hover-card';

        card.innerHTML = `
            <div class="aspect-video overflow-hidden">
                <img src="${p.imageUrl || 'https://via.placeholder.com/400x225/111/444?text=No+Image'}"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>

            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="text-xl font-bold text-white mb-1">${p.title}</h4>
                        <p class="text-sm text-gray-500">${p.desc || ''}</p>
                    </div>
                    <span class="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 uppercase">
                        ${p.category}
                    </span>
                </div>

                <a href="#" class="inline-flex items-center text-sm font-bold text-white hover:text-purple-400">
                    View Case Study
                    <i class="fa-solid fa-chevron-right ml-2 text-xs"></i>
                </a>
            </div>
        `;

        grid.appendChild(card);
    });

    renderPagination(totalPages);
}

/* ===============================
   PAGINATION
================================ */
function renderPagination(totalPages) {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `
            px-4 py-2 rounded-lg text-sm transition
            ${i === currentPage
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'}
        `;
        btn.onclick = () => {
            currentPage = i;
            renderPortfolio();
        };
        paginationEl.appendChild(btn);
    }
}



/* ===============================
   FILTER HANDLER
================================ */
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('text-white'));
        btn.classList.add('text-white');

        currentFilter = btn.dataset.filter;
        currentPage = 1;
        renderPortfolio();
    });
});

/* ===============================
   INIT
================================ */
fetchProjects();

/* =====================================================
   EMAILJS + POPUP (VERSI ASLI KAMU, DIPERTAHANKAN)
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs === 'undefined') return;

    emailjs.init("vU3qJ8tVVJZC4YyEX");

    const form = document.getElementById('contactForm');
    const successPopup = document.getElementById('successPopup');
    const closePopup = document.getElementById('closePopup');

    if (closePopup) {
        closePopup.addEventListener('click', () => {
            successPopup.classList.add('hidden');
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            emailjs.sendForm(
                'service_7g00olg',
                'template_uyanim5',
                form
            ).then(() => {
                successPopup.classList.remove('hidden');
                form.reset();
            }).catch(err => {
                alert('Gagal mengirim pesan');
                console.error(err);
            });
        });
    }
});

// hover tombol project
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        // Reset semua button
        filterButtons.forEach(btn => {
            btn.classList.remove(
                'bg-purple-500/10',
                'border-purple-500/30',
                'text-white'
            );
            btn.classList.add(
                'border-white/10',
                'text-gray-400'
            );
        });

        // Active button
        button.classList.remove('border-white/10', 'text-gray-400');
        button.classList.add(
            'bg-purple-500/10',
            'border-purple-500/30',
            'text-white'
        );

        // Filter portfolio
        portfolioItems.forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

// Set default active = All Projects (only visually init first, render data from fetch)
const initialBtn = document.querySelector('[data-filter="all"]');
if (initialBtn && projects.length > 0) {
    initialBtn.click();
}

// require('dotenv').config();

/* ===============================
   SCROLL ANIMATIONS (Intersection Observer)
================================ */
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class
                entry.target.classList.add('visible');

                // Add stagger effect to children
                const children = entry.target.querySelectorAll('.glass, .portfolio-item, .skill-item, div > h1, div > h2, div > h3, div > p');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe all elements with scroll animation classes
    const scrollElements = document.querySelectorAll(
        '.scroll-fade-in, .scroll-scale-in, .scroll-slide-left, .scroll-slide-right, .scroll-slide-down, .scroll-slide-up'
    );
    scrollElements.forEach(element => {
        observer.observe(element);
    });

    // Observe all glass cards
    document.querySelectorAll('.glass').forEach(card => {
        observer.observe(card);
    });

    // Observe portfolio items
    document.querySelectorAll('.portfolio-item').forEach(item => {
        observer.observe(item);
    });
});

/* ===============================
   SMOOTH SCROLL & PARALLAX EFFECTS
================================ */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const blobs = document.querySelectorAll('.blob');

    blobs.forEach((blob, index) => {
        const rate = scrolled * (0.5 + index * 0.1);
        blob.style.transform = `translateY(${rate}px)`;
    });
});

/* ===============================
   PAGE LOAD ANIMATION
================================ */
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.opacity = '1';
    });
} else {
    document.body.style.opacity = '1';
}

