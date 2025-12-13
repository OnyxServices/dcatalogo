// Configuración de Supabase
const SUPABASE_URL = "https://dsvracququvtxofpnuar.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdnJhY3F1cXV2dHhvZnBudWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTU5NDMsImV4cCI6MjA4MTEzMTk0M30.cMnyd_6oIgZt7zdxjAteZs7ay5nWrHpE-v6V-CVm2aY";

// Inicializa correctamente desde el objeto global del CDN
const { createClient } = supabase; 
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const $mensajes = document.getElementById('mensajes');

function mostrarMensaje(msg, tipo = 'info') {
  $mensajes.innerText = msg;
  if (tipo === 'error') $mensajes.classList.add('error');
  else $mensajes.classList.remove('error');
}

// Función para crear el efecto de zoom
function crearZoom(imgElement) {
  // Crear contenedor de zoom
  const zoomContainer = document.createElement('div');
  zoomContainer.className = 'imagen-zoom';
  
  // Crear imagen en zoom
  const zoomImg = document.createElement('img');
  zoomImg.src = imgElement.src;
  zoomImg.alt = imgElement.alt;
  
  // Agregar imagen al contenedor
  zoomContainer.appendChild(zoomImg);
  
  // Agregar al body
  document.body.appendChild(zoomContainer);
  
  // Configurar timeout para quitar el zoom automáticamente en 5 segundos
  const zoomTimeout = setTimeout(() => {
    quitarZoom(zoomContainer);
  }, 5000);
  
  // También permitir quitar el zoom haciendo clic
  zoomContainer.addEventListener('click', function(e) {
    if (e.target === zoomContainer || e.target === zoomImg) {
      clearTimeout(zoomTimeout);
      quitarZoom(zoomContainer);
    }
  });
  
  // Permitir quitar el zoom con la tecla Escape
  const handleEscape = function(e) {
    if (e.key === 'Escape') {
      clearTimeout(zoomTimeout);
      quitarZoom(zoomContainer);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Limpiar evento cuando se quite el zoom
  zoomContainer.addEventListener('animationend', function(e) {
    if (e.animationName === 'fadeOutZoom') {
      if (document.body.contains(zoomContainer)) {
        document.body.removeChild(zoomContainer);
      }
    }
  });
}

// Efecto 3D mejorado para tarjetas
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = ((x - centerX) / centerX) * 3; // Reducido para un efecto más sutil
      const rotateX = ((centerY - y) / centerY) * 3;
      
      this.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateY(-12px) 
        translateZ(20px)
      `;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = `
        perspective(1000px) 
        rotateX(5deg) 
        rotateY(0deg) 
        translateY(-12px) 
        translateZ(20px)
      `;
      
      // Volver a la posición inicial después de un tiempo
      setTimeout(() => {
        this.style.transform = `
          perspective(1000px) 
          rotateX(0deg) 
          rotateY(0deg) 
          translateY(0) 
          translateZ(0)
        `;
      }, 150);
    });
  });
});

// Función para quitar el zoom con animación
function quitarZoom(zoomContainer) {
  if (zoomContainer && document.body.contains(zoomContainer)) {
    zoomContainer.classList.add('saliendo');
  }
}

async function cargarCategorias() {
  mostrarMensaje('Cargando categorías...');
  try {
    const res = await supabaseClient.from('categorias').select('id, nombre, imagen').order('id');
    console.log('Respuesta categorías raw:', res);
    const { data, error, status } = res;
    if (error) {
      console.error('Error al consultar categorias:', error);
      mostrarMensaje('Error cargando categorías. Mira la consola.', 'error');
      return;
    }
    if (!data || data.length === 0) {
      mostrarMensaje('No hay categorías en la base de datos.');
      document.getElementById('categorias').innerHTML = '<p>No hay categorías</p>';
      return;
    }

    mostrarMensaje(`Se han cargado ${data.length} categorías.`);
    const cont = document.getElementById('categorias');
    cont.innerHTML = '';
    data.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cursor = 'pointer';
      
      const imgContainer = document.createElement('div');
      imgContainer.style.position = 'relative';
      
      if (cat.imagen) {
        const img = document.createElement('img');
        img.src = cat.imagen;
        img.alt = cat.nombre;
        img.style.cursor = 'pointer';
        
        // Agregar evento de zoom
        img.addEventListener('click', function(e) {
          e.stopPropagation();
          crearZoom(this);
        });
        
        imgContainer.appendChild(img);
      } else {
        const noImgDiv = document.createElement('div');
        noImgDiv.style.height = '90px';
        noImgDiv.style.background = '#f0f0f0';
        noImgDiv.style.marginBottom = '8px';
        noImgDiv.style.display = 'flex';
        noImgDiv.style.alignItems = 'center';
        noImgDiv.style.justifyContent = 'center';
        noImgDiv.textContent = 'Sin imagen';
        imgContainer.appendChild(noImgDiv);
      }
      
      const strong = document.createElement('strong');
      strong.textContent = cat.nombre;
      
      card.appendChild(imgContainer);
      card.appendChild(strong);
      card.onclick = () => cargarProductos(cat.id, cat.nombre);
      cont.appendChild(card);
    });
  } catch (err) {
    console.error('Exception cargando categorias:', err);
    mostrarMensaje('Excepción al cargar categorías. Mira la consola.', 'error');
  }
}

async function cargarProductos(categoriaId, nombreCategoria = '') {
  mostrarMensaje(`Cargando productos de: ${nombreCategoria || categoriaId}...`);
  try {
    const res = await supabaseClient.from('productos')
      .select('id, nombre, precio, imagen, categoria_id')
      .eq('categoria_id', categoriaId)
      .order('id');
    console.log('Respuesta productos raw:', res);
    const { data, error } = res;
    if (error) {
      console.error('Error al consultar productos:', error);
      mostrarMensaje('Error cargando productos. Mira la consola.', 'error');
      return;
    }
    if (!data || data.length === 0) {
      mostrarMensaje('No hay productos para esta categoría.');
      document.getElementById('lista-productos').innerHTML = '<p>No hay productos</p>';
    } else {
      mostrarMensaje(`Se han cargado ${data.length} productos.`);
      const cont = document.getElementById('lista-productos');
      cont.innerHTML = '';
      data.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Crear contenedor de imagen
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        
        if (prod.imagen) {
          const img = document.createElement('img');
          img.src = prod.imagen;
          img.alt = prod.nombre;
          img.style.cursor = 'zoom-in';
          
          // Agregar evento de zoom
          img.addEventListener('click', function(e) {
            e.stopPropagation();
            crearZoom(this);
          });
          
          imgContainer.appendChild(img);
        } else {
          const noImgDiv = document.createElement('div');
          noImgDiv.style.height = '90px';
          noImgDiv.style.background = '#f0f0f0';
          noImgDiv.style.marginBottom = '8px';
          noImgDiv.style.display = 'flex';
          noImgDiv.style.alignItems = 'center';
          noImgDiv.style.justifyContent = 'center';
          noImgDiv.textContent = 'Sin imagen';
          imgContainer.appendChild(noImgDiv);
        }
        
        const strong = document.createElement('strong');
        strong.textContent = prod.nombre;
        
        const divPrecio = document.createElement('div');
        divPrecio.textContent = `Precio: $${prod.precio}`;
        
        card.appendChild(imgContainer);
        card.appendChild(strong);
        card.appendChild(divPrecio);
        
        cont.appendChild(card);
      });
    }
    // UI
    document.getElementById('categorias').style.display = 'none';
    document.getElementById('productos').style.display = 'block';
    document.getElementById('titulo-categoria').innerText = nombreCategoria ? `Productos: ${nombreCategoria}` : 'Productos';
  } catch (err) {
    console.error('Exception cargando productos:', err);
    mostrarMensaje('Excepción al cargar productos. Mira la consola.', 'error');
  }
}

document.getElementById('volver').onclick = () => {
  document.getElementById('productos').style.display = 'none';
  document.getElementById('categorias').style.display = 'flex';
  document.querySelector('.subtitulo-pagina').textContent = "Selecciona una categoría para explorar productos";
  mostrarMensaje('');
};

// Arranque
cargarCategorias();