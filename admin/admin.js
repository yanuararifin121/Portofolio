/* ================================
   ADMIN PANEL - PORTFOLIO MANAGER
   ================================ */

// ===== KONFIGURASI STORAGE =====
const STORAGE_KEY = 'portfolio_projects';

// ===== STATE =====
let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentBase64 = null;

const DEFAULT_PLACEHOLDER =
  'https://via.placeholder.com/400x225/111/444?text=Tanpa+Gambar';

// ===== ELEMENT =====
const form = document.getElementById('uploadForm');
const projectList = document.getElementById('projectList');
const livePreview = document.getElementById('livePreview');
const fileInput = document.getElementById('projFile');
const dropZone = document.getElementById('dropZone');
const totalCount = document.getElementById('totalProjects');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// ===== HANDLE FILE UPLOAD =====
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Hanya file gambar yang diterima!', '#ef4444');
    return;
  }

  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast('Ukuran file terlalu besar! Maksimal 2MB', '#ef4444');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    // Compress image
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Resize ke maksimal 800x600
      let width = img.width;
      let height = img.height;
      const maxWidth = 800;
      const maxHeight = 600;
      
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress dengan quality 0.8
      currentBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      livePreview.innerHTML = `
        <img src="${currentBase64}"
             class="w-full h-full object-cover rounded-xl
                    scale-105 group-hover:scale-100
                    transition duration-500">
      `;
      dropZone.classList.add('border-purple-500/50');
      showToast('Gambar berhasil dikompresi!', '#22c55e');
    };
  };
  reader.readAsDataURL(file);
}

// ===== UPLOAD EVENTS =====
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) =>
  handleFile(e.target.files[0])
);

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () =>
  dropZone.classList.remove('drag-over')
);

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFile(e.dataTransfer.files[0]);
});

// ===== RENDER PROJECT LIST =====
function renderProjects() {
  projectList.innerHTML = '';

  projects.forEach((p) => {
    const displayImg = p.image || DEFAULT_PLACEHOLDER;

    projectList.innerHTML += `
      <tr class="group hover:bg-white/5 transition-colors">
        <td class="py-4">
          <div class="flex items-center gap-4">
            <img src="${displayImg}"
                 class="w-12 h-12 rounded-lg object-cover bg-white/10">
            <div>
              <div class="font-medium text-white">${p.title}</div>
              <div class="text-xs text-gray-500 line-clamp-1">
                ${p.desc}
              </div>
            </div>
          </div>
        </td>

        <td class="py-4">
          <span class="px-3 py-1 rounded-full text-[10px]
                       uppercase font-bold tracking-wider
                       bg-purple-500/10 text-purple-400
                       border border-purple-500/20">
            ${p.category}
          </span>
        </td>

        <td class="py-4 text-right">
          <button onclick="deleteProject(${p.id})"
                  class="p-2 text-gray-500 hover:text-red-400 transition">
            🗑
          </button>
        </td>
      </tr>
    `;
  });

  totalCount.innerText = projects.length;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ===== SUBMIT FORM =====
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('projTitle').value.trim();
  const category = document.getElementById('projCategory').value;
  const desc = document.getElementById('projDesc').value.trim();

  // Validasi input
  if (!title) {
    showToast('Nama project tidak boleh kosong!', '#ef4444');
    return;
  }
  if (!desc) {
    showToast('Deskripsi tidak boleh kosong!', '#ef4444');
    return;
  }

  const newProject = {
    id: Date.now(),
    title: title,
    category: category,
    image: currentBase64,
    desc: desc
  };

  // Check localStorage size
  const existingData = localStorage.getItem(STORAGE_KEY);
  const newData = JSON.stringify([...projects, newProject]);
  
  if (newData.length > 4 * 1024 * 1024) { // 4MB limit
    showToast('Storage penuh! Hapus beberapa project terlebih dahulu', '#ef4444');
    return;
  }

  projects.unshift(newProject);
  renderProjects();

  // RESET FORM
  form.reset();
  currentBase64 = null;
  livePreview.innerHTML = 'Belum ada gambar terpilih';
  dropZone.classList.remove('border-purple-500/50');

  showToast('Project berhasil disimpan! (' + projects.length + ' total)', '#22c55e');
});

// ===== DELETE PROJECT =====
window.deleteProject = (id) => {
  projects = projects.filter((p) => p.id !== id);
  renderProjects();
  showToast('Project dihapus!', '#ef4444');
};

// ===== TOAST =====
function showToast(message, color = '#22c55e') {
  toastMsg.innerText = message;
  toast.firstElementChild.style.backgroundColor = color;

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem('adminLoggedIn');
  window.location.href = 'login.html';
}

// Make logout global
window.logout = logout;

// ===== INIT =====
renderProjects();