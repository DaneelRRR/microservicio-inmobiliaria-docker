const API_URL = 'http://localhost:3000/api';
const BASE_URL = 'http://localhost:3000';
let globalData = [];

// --- INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

async function cargarDatos() {
    const container = document.getElementById('content-area');
    try {
        const res = await fetch(`${API_URL}/bienes`);
        if(!res.ok) throw new Error("Error API");
        
        globalData = await res.json();
        renderDashboard(globalData);
        
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="text-center text-red-500 mt-10">Error de conexión con el servidor.<br>Asegúrate que Docker esté corriendo.</div>`;
    }
}

// --- RENDERIZADO DEL DASHBOARD ---
function renderDashboard(data) {
    const container = document.getElementById('content-area');
    document.getElementById('page-title').innerText = 'Dashboard General';
    document.getElementById('page-subtitle').innerText = `${data.length} inmuebles registrados en el sistema.`;
    
    container.innerHTML = '';

    if(data.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 mt-20 italic">No hay archivos. Usa el botón "Subir archivos".</div>`;
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

    data.forEach(bien => {
        const fotos = bien.fotos_editadas || [];
        const isPublicado = fotos.length > 0;
        
        // ESTILOS SEGUN ESTADO
        const statusColor = isPublicado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
        const statusText = isPublicado ? 'Publicado' : 'En Proceso';
        const iconBg = isPublicado ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-500';
        const icon = isPublicado ? 'ph-check-circle' : 'ph-clock';

        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-3xl shadow-sm border border-transparent hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group';
        card.onclick = () => verDetalleCarpeta(bien.CodigoBien);

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    <i class="ph ${icon}"></i>
                </div>
                <div class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}">
                    ${statusText}
                </div>
            </div>
            
            <h3 class="text-lg font-bold text-gray-800 mb-1">${bien.CodigoBien}</h3>
            <p class="text-sm text-gray-500 line-clamp-2 h-10">${bien.Descripcion}</p>
            
            <div class="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                <span class="text-gray-400 font-medium">Archivos</span>
                <span class="font-bold text-gray-700">${isPublicado ? fotos.length + ' fotos' : 'Pendiente'}</span>
            </div>
        `;
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// --- VISTA FOTOS ---
function verDetalleCarpeta(codigo) {
    const bien = globalData.find(b => b.CodigoBien === codigo);
    if(!bien) return;

    const container = document.getElementById('content-area');
    document.getElementById('page-title').innerText = `Bien: ${codigo}`;
    document.getElementById('page-subtitle').innerText = bien.Descripcion;

    const fotos = bien.fotos_editadas || [];

    let html = `
        <button onclick="renderDashboard(globalData)" class="mb-6 flex items-center text-gray-500 hover:text-blue-600 transition font-medium">
            <i class="ph ph-arrow-left mr-2"></i> Volver al Dashboard
        </button>
    `;

    if(fotos.length === 0) {
        html += `
            <div class="bg-white rounded-3xl p-10 text-center shadow-sm">
                <div class="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    <i class="ph ph-clock-countdown"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800">Esperando al Grafista</h3>
                <p class="text-gray-500 mt-2">El fotógrafo ya subió los originales, pero aún no se ha subido la edición final.</p>
            </div>
        `;
    } else {
        html += `<h3 class="text-lg font-bold text-gray-800 mb-4">Fotos Editadas (${fotos.length})</h3>`;
        html += `<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">`;
        fotos.forEach(foto => {
            html += `
                <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                    <div class="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 relative group">
                        <img src="${BASE_URL}${foto.url}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" loading="lazy">
                        <a href="${BASE_URL}${foto.url}" target="_blank" class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                            <i class="ph ph-eye text-2xl"></i>
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 truncate text-center">${foto.nombre}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

function filtrarBusqueda() {
    const texto = document.getElementById('search-input').value.toLowerCase();
    const filtrados = globalData.filter(item => 
        item.CodigoBien.toLowerCase().includes(texto) || 
        item.Descripcion.toLowerCase().includes(texto)
    );
    renderDashboard(filtrados);
}

function filtrarPorEstado(estado) {
    let filtrados = [];
    if(estado === 'pendiente') {
        filtrados = globalData.filter(b => (!b.fotos_editadas || b.fotos_editadas.length === 0));
    } else {
        filtrados = globalData.filter(b => (b.fotos_editadas && b.fotos_editadas.length > 0));
    }
    renderDashboard(filtrados);
}

// --- MODAL y LOGICA de SUBIDA ---
const modal = document.getElementById('upload-modal');
const btnFoto = document.getElementById('btn-foto');
const btnGraf = document.getElementById('btn-graf');
const rolInput = document.getElementById('rol-seleccionado');

function abrirModalUpload() { modal.classList.remove('hidden'); modal.classList.add('flex'); }
function cerrarModalUpload() { modal.classList.add('hidden'); modal.classList.remove('flex'); }

function setRol(rol) {
    rolInput.value = rol;
    if(rol === 'fotografo') {
        btnFoto.className = "flex-1 py-2 rounded-lg text-sm font-semibold shadow-sm bg-white text-gray-800 transition-all border border-gray-100";
        btnGraf.className = "flex-1 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all";
        document.getElementById('desc-container').style.display = 'block'; // Fotografo pone descripcion
    } else {
        btnGraf.className = "flex-1 py-2 rounded-lg text-sm font-semibold shadow-sm bg-white text-gray-800 transition-all border border-gray-100";
        btnFoto.className = "flex-1 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all";
        document.getElementById('desc-container').style.display = 'none'; // Grafista NO
    }
}

function mostrarNombreArchivo() {
    const file = document.getElementById('file-input').files[0];
    if(file) document.getElementById('file-name-display').innerText = `${file.name}`;
}

async function procesarSubida(e) {
    e.preventDefault();
    const rol = rolInput.value;
    const url = `${API_URL}/${rol}/upload`;
    
    const formData = new FormData();
    formData.append('codigo_bien', document.getElementById('codigo-input').value);
    formData.append('tipo', rol === 'fotografo' ? 'original' : 'editada');
    formData.append('archivo', document.getElementById('file-input').files[0]);
    
    if(rol === 'fotografo') {
        formData.append('descripcion', document.getElementById('desc-input').value);
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerText;
    btn.innerText = "Subiendo...";
    btn.disabled = true;

    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const data = await res.json();
        
        if(res.ok) {
            alert("Archivo subido correctamente.");
            cerrarModalUpload();
            document.getElementById('upload-form').reset();
            document.getElementById('file-name-display').innerText = "ZIP, RAR o Imagenes";
            cargarDatos();
        } else {
            alert("Error: " + (data.error || "Fallo en el servidor"));
        }
    } catch (error) {
        alert("Error de conexion");
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

function cargarVistaDashboard() {
    renderDashboard(globalData);
}

// --- LOGICA DE DRAG & DROP ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// Prevenir comportamiento por defecto (descarga) en todo el modal
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Efecto visual cuando arrastras encima
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('bg-blue-50', 'border-blue-400'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('bg-blue-50', 'border-blue-400'), false);
});

// Capturar el archivo al soltar
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        fileInput.files = files; // Asignamos el archivo al input invisible
        mostrarNombreArchivo();
    }
}