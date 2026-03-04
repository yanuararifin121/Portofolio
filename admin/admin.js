/* ================================
   ADMIN PANEL - PORTFOLIO MANAGER
   ================================ */

const API_URL = '/api/projects';

// Check Auth
const token = localStorage.getItem('adminToken');
if (!token) {
  window.location.href = 'login.html';
}

// ===== STATE =====
let projects = [];
let currentFile = null;
let currentBase64 = null; // Still needed for preview only

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

// ===== FETCH PROJECTS JARINGAN =====
async function fetchProjects() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Gagal mengambil data');
    projects = await response.json();
    renderProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
    showToast('Gagal memuat data dari server', '#ef4444');
  }
}

// ===== HANDLE FILE UPLOAD =====
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Hanya file gambar yang diterima!', '#ef4444');
    return;
  }

  // Check file size (max 5MB for Cloudinary)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran file terlalu besar! Maksimal 5MB', '#ef4444');
    return;
  }

  currentFile = file;

  // Preview local image
  const reader = new FileReader();
  reader.onload = (e) => {
    currentBase64 = e.target.result;
    livePreview.innerHTML = `
      <img src="${currentBase64}"
           class="w-full h-full object-cover rounded-xl
                  scale-105 group-hover:scale-100
                  transition duration-500">
    `;
    dropZone.classList.add('border-purple-500/50');
    showToast('Gambar dipilih!', '#22c55e');
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
    const displayImg = p.imageUrl || DEFAULT_PLACEHOLDER;

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
}

// ===== SUBMIT FORM =====
form.addEventListener('submit', async (e) => {
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

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('desc', desc);

  if (currentFile) {
    formData.append('image', currentFile);
  }

  // Show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Menyimpan...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData,
    });

    if (response.status === 401 || response.status === 403) {
      alert('Sesi habis, silakan login kembali');
      logout();
      return;
    }

    if (!response.ok) {
      throw new Error('Gagal menyimpan project');
    }

    const newProject = await response.json();
    projects.unshift(newProject);
    renderProjects();

    // RESET FORM
    form.reset();
    currentFile = null;
    currentBase64 = null;
    livePreview.innerHTML = 'Belum ada gambar terpilih';
    dropZone.classList.remove('border-purple-500/50');

    showToast('Project berhasil disimpan!', '#22c55e');

  } catch (error) {
    console.error('Error submitting project:', error);
    showToast('Gagal menyimpan ke server!', '#ef4444');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
});

// ===== DELETE PROJECT =====
window.deleteProject = async (id) => {
  if (!confirm('Apakah anda yakin ingin menghapus project ini?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      alert('Sesi habis, silakan login kembali');
      logout();
      return;
    }

    if (!response.ok) throw new Error('Gagal menghapus project');

    projects = projects.filter((p) => p.id !== id);
    renderProjects();
    showToast('Project dihapus!', '#22c55e');
  } catch (error) {
    console.error('Error deleting project:', error);
    showToast('Gagal menghapus dari server!', '#ef4444');
  }
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
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}

// Make logout global
window.logout = logout;

// ===== INIT =====
fetchProjects();