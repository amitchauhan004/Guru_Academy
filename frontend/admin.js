// --- Auth & UI State ---
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

const API_BASE = 'https://guru-academy-xi.vercel.app/api'; // Production backend URL
let authToken = sessionStorage.getItem('adminToken') || '';

function showLogin() {
  loginSection.style.display = '';
  adminDashboard.style.display = 'none';
  loginError.style.display = 'none';
  // Clear login form fields
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}
function showDashboard() {
  loginSection.style.display = 'none';
  adminDashboard.style.display = '';
  history.pushState({}, '', '#dashboard');
}

// --- Login Logic ---
loginBtn.onclick = async () => {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  loginBtn.disabled = true;
  loginError.style.display = 'none';
  try {
    const res = await fetch(API_BASE + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      sessionStorage.setItem('adminToken', data.token);
      authToken = data.token;
      history.replaceState({}, '', location.pathname);
      showDashboard();
      loadAllTabs();
    } else {
      loginError.textContent = data.message || 'Login failed';
      loginError.style.display = '';
    }
  } catch (e) {
    loginError.textContent = 'Network error';
    loginError.style.display = '';
  }
  loginBtn.disabled = false;
};

logoutBtn.onclick = () => {
  sessionStorage.removeItem('adminToken');
  authToken = '';
  showLogin();
};

// --- Tab Switching ---
const tabs = document.querySelectorAll('.admin-tab');
const sections = document.querySelectorAll('.admin-section');
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('section-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'teachers') loadTeachers();
    if (tab.dataset.tab === 'courses') loadCourses();
    if (tab.dataset.tab === 'toppers') loadToppers();
    if (tab.dataset.tab === 'materials') loadMaterials();
  };
});

// --- API Helpers ---
async function apiGet(path) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  return res.json();
}
async function apiPost(path, data) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
    body: JSON.stringify(data)
  });
  return res.json();
}
async function apiPut(path, data) {
  const res = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
    body: JSON.stringify(data)
  });
  return res.json();
}
async function apiDelete(path) {
  const res = await fetch(API_BASE + path, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + authToken }
  });
  return res.json();
}

// --- Teachers CRUD ---
const teachersList = document.getElementById('teachersList');
const teacherForm = document.getElementById('teacherForm');
const cancelTeacherEdit = document.getElementById('cancelTeacherEdit');
function teacherRow(t) {
  return `<div class="data-row">
    <div class="data-cell teacher-info">
        <img src="${t.photo || 'assets/images/Logo.png'}" alt="photo">
        <div>
            <b>${t.name}</b>
            <span>${t.subject || ''}</span>
        </div>
    </div>
    <div class="data-cell">${t.experience || ''}</div>
    <div class="data-cell skills-cell">${(t.skills || []).join(', ')}</div>
    <div class="data-cell actions-cell">
        <button onclick="editTeacher('${t._id}')" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteTeacher('${t._id}')" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
    </div>
  </div>`;
}
window.editTeacher = async function(id) {
  const t = teachersData.find(x => x._id === id);
  document.getElementById('teacherId').value = t._id;
  document.getElementById('teacherName').value = t.name;
  document.getElementById('teacherSubject').value = t.subject||'';
  document.getElementById('teacherExperience').value = t.experience||'';
  document.getElementById('teacherSkills').value = (t.skills||[]).join(', ');
  document.getElementById('teacherPhoto').value = t.photo||'';
  cancelTeacherEdit.style.display = '';
};
window.deleteTeacher = async function(id) {
  if (!confirm('Delete this teacher?')) return;
  await apiDelete('/teachers/' + id);
  loadTeachers();
};
let teachersData = [];
async function loadTeachers() {
  teachersData = await apiGet('/teachers');
  teachersList.innerHTML = teachersData.map(teacherRow).join('');
  teacherForm.reset();
  document.getElementById('teacherId').value = '';
  cancelTeacherEdit.style.display = 'none';
}
teacherForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('teacherId').value;
  const data = {
    name: document.getElementById('teacherName').value,
    subject: document.getElementById('teacherSubject').value,
    experience: document.getElementById('teacherExperience').value,
    skills: document.getElementById('teacherSkills').value.split(',').map(s=>s.trim()).filter(Boolean),
    photo: document.getElementById('teacherPhoto').value
  };
  if (id) await apiPut('/teachers/' + id, data);
  else await apiPost('/teachers', data);
  loadTeachers();
};
cancelTeacherEdit.onclick = () => {
  teacherForm.reset();
  document.getElementById('teacherId').value = '';
  cancelTeacherEdit.style.display = 'none';
};

// --- Courses CRUD ---
const coursesList = document.getElementById('coursesList');
const courseForm = document.getElementById('courseForm');
const cancelCourseEdit = document.getElementById('cancelCourseEdit');
function courseRow(c) {
  return `<div class="data-row">
    <div class="data-cell"><b>${c.title}</b></div>
    <div class="data-cell">${c.category || ''}</div>
    <div class="data-cell price-cell">₹${c.price || ''}</div>
    <div class="data-cell features-cell">${(c.features || []).join(', ')}</div>
    <div class="data-cell actions-cell">
        <button onclick="editCourse('${c._id}')" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteCourse('${c._id}')" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
    </div>
  </div>`;
}
window.editCourse = async function(id) {
  const c = coursesData.find(x => x._id === id);
  document.getElementById('courseId').value = c._id;
  document.getElementById('courseTitle').value = c.title;
  document.getElementById('courseDescription').value = c.description||'';
  document.getElementById('courseCategory').value = c.category||'';
  document.getElementById('courseFeatures').value = (c.features||[]).join(', ');
  document.getElementById('coursePrice').value = c.price||'';
  document.getElementById('courseOriginalPrice').value = c.originalPrice||'';
  cancelCourseEdit.style.display = '';
};
window.deleteCourse = async function(id) {
  if (!confirm('Delete this course?')) return;
  await apiDelete('/courses/' + id);
  loadCourses();
};
let coursesData = [];
async function loadCourses() {
  coursesData = await apiGet('/courses');
  coursesList.innerHTML = coursesData.map(courseRow).join('');
  courseForm.reset();
  document.getElementById('courseId').value = '';
  cancelCourseEdit.style.display = 'none';
}
courseForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('courseId').value;
  const data = {
    title: document.getElementById('courseTitle').value,
    description: document.getElementById('courseDescription').value,
    category: document.getElementById('courseCategory').value,
    features: document.getElementById('courseFeatures').value.split(',').map(s=>s.trim()).filter(Boolean),
    price: Number(document.getElementById('coursePrice').value),
    originalPrice: Number(document.getElementById('courseOriginalPrice').value)
  };
  if (id) await apiPut('/courses/' + id, data);
  else await apiPost('/courses', data);
  loadCourses();
};
cancelCourseEdit.onclick = () => {
  courseForm.reset();
  document.getElementById('courseId').value = '';
  cancelCourseEdit.style.display = 'none';
};

// --- Toppers CRUD ---
const toppersList = document.getElementById('toppersList');
const topperForm = document.getElementById('topperForm');
const cancelTopperEdit = document.getElementById('cancelTopperEdit');
function topperRow(t) {
  return `<div class="data-row">
    <div class="data-cell"><b>${t.name}</b></div>
    <div class="data-cell">${t.subject || ''}</div>
    <div class="data-cell">${t.rollNo || ''}</div>
    <div class="data-cell marks-cell">${t.marks || ''}</div>
    <div class="data-cell actions-cell">
        <button onclick="editTopper('${t._id}')" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteTopper('${t._id}')" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
    </div>
  </div>`;
}
window.editTopper = async function(id) {
  const t = toppersData.find(x => x._id === id);
  document.getElementById('topperId').value = t._id;
  document.getElementById('topperName').value = t.name;
  document.getElementById('topperRollNo').value = t.rollNo||'';
  document.getElementById('topperMarks').value = t.marks||'';
  document.getElementById('topperPhoto').value = t.photo||'';
  document.getElementById('topperSubject').value = t.subject||'science';
  cancelTopperEdit.style.display = '';
};
window.deleteTopper = async function(id) {
  if (!confirm('Delete this topper?')) return;
  await apiDelete('/toppers/' + id);
  loadToppers();
};
let toppersData = [];
async function loadToppers() {
  toppersData = await apiGet('/toppers');
  toppersList.innerHTML = toppersData.map(topperRow).join('');
  topperForm.reset();
  document.getElementById('topperId').value = '';
  cancelTopperEdit.style.display = 'none';
}
topperForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('topperId').value;
  const data = {
    name: document.getElementById('topperName').value,
    rollNo: document.getElementById('topperRollNo').value,
    marks: Number(document.getElementById('topperMarks').value),
    photo: document.getElementById('topperPhoto').value,
    subject: document.getElementById('topperSubject').value
  };
  if (id) await apiPut('/toppers/' + id, data);
  else await apiPost('/toppers', data);
  loadToppers();
};
cancelTopperEdit.onclick = () => {
  topperForm.reset();
  document.getElementById('topperId').value = '';
  cancelTopperEdit.style.display = 'none';
};

// --- Materials CRUD ---
const materialsList = document.getElementById('materialsList');
const materialForm = document.getElementById('materialForm');
const cancelMaterialEdit = document.getElementById('cancelMaterialEdit');
function materialRow(m) {
  return `<div class="data-row">
    <div class="data-cell"><b>${m.title}</b></div>
    <div class="data-cell price-cell">₹${m.price || ''}</div>
    <div class="data-cell features-cell">${(m.features || []).join(', ')}</div>
    <div class.data-cell actions-cell">
        <button onclick="editMaterial('${m._id}')" class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteMaterial('${m._id}')" class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
    </div>
  </div>`;
}
window.editMaterial = async function(id) {
  const m = materialsData.find(x => x._id === id);
  document.getElementById('materialId').value = m._id;
  document.getElementById('materialTitle').value = m.title;
  document.getElementById('materialDescription').value = m.description||'';
  document.getElementById('materialFeatures').value = (m.features||[]).join(', ');
  document.getElementById('materialPrice').value = m.price||'';
  document.getElementById('materialIcon').value = m.icon||'';
  cancelMaterialEdit.style.display = '';
};
window.deleteMaterial = async function(id) {
  if (!confirm('Delete this material?')) return;
  await apiDelete('/materials/' + id);
  loadMaterials();
};
let materialsData = [];
async function loadMaterials() {
  materialsData = await apiGet('/materials');
  materialsList.innerHTML = materialsData.map(materialRow).join('');
  materialForm.reset();
  document.getElementById('materialId').value = '';
  cancelMaterialEdit.style.display = 'none';
}
materialForm.onsubmit = async e => {
  e.preventDefault();
  const id = document.getElementById('materialId').value;
  const data = {
    title: document.getElementById('materialTitle').value,
    description: document.getElementById('materialDescription').value,
    features: document.getElementById('materialFeatures').value.split(',').map(s=>s.trim()).filter(Boolean),
    price: Number(document.getElementById('materialPrice').value),
    icon: document.getElementById('materialIcon').value
  };
  if (id) await apiPut('/materials/' + id, data);
  else await apiPost('/materials', data);
  loadMaterials();
};
cancelMaterialEdit.onclick = () => {
  materialForm.reset();
  document.getElementById('materialId').value = '';
  cancelMaterialEdit.style.display = 'none';
};

// --- Load all tabs on login ---
function loadAllTabs() {
  loadTeachers();
  loadCourses();
  loadToppers();
  loadMaterials();
}

// --- On page load: check auth ---
(function init() {
  if (authToken) {
    showDashboard();
    loadAllTabs();
  } else {
    showLogin();
  }
})();

// Auto logout on browser back from dashboard
window.onpopstate = function() {
  logoutBtn.onclick();
};