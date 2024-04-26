let menu = [];

let pedido = localStorage.getItem('pedido') ? JSON.parse(localStorage.getItem('pedido')) : [];

function guardarPedido() {
    localStorage.setItem('pedido', JSON.stringify(pedido));
}


function generarPlatoHTML(plato) {
    const cantidad = pedido.find(item => item.id === plato.id)?.cantidad || 0;
    return `
        <div class="col-12 col-lg-6">
            <div class="menu-item">
                <div class="menu">
                    <img src="${plato.img}" alt="${plato.titulo}" class="img-fluid">
                    <h3>${plato.titulo}</h3>
                    <p>$${plato.precio}</p>
                    <div>
                        <input type="number" min="0" value="${cantidad}" id="${plato.id}-cantidad" onchange="actualizarCantidad('${plato.id}', this.value)" style="width: 60px;">
                    </div>
                    <button class="agregar-al-pedido btn btn-primary" onclick="agregarAlPedido('${plato.id}', '${plato.titulo}', ${plato.precio})">Agregar al Pedido</button>
                </div>
            </div>
        </div>
    `;
}



fetch('menu.json')
    .then(response => response.json())
    .then(data => {
        menu = data;
        mostrarPlatos();
        mostrarPedido(); // Mostrar pedido al cargar la página
    })
    .catch(error => console.error('Error cargando el menú:', error));

function mostrarPlatos() {
    const menuDiv = document.querySelector('.menu');
    menuDiv.innerHTML = "";
    const row = document.createElement('div');
    row.classList.add('row');
    menuDiv.appendChild(row);
    menu.forEach(plato => {
        const platoDiv = document.createElement('div');
        platoDiv.classList.add('col-md-6', 'col-lg-6');
        platoDiv.innerHTML = generarPlatoHTML(plato);
        row.appendChild(platoDiv);

        // Agregar evento mouseleave a la imagen
        platoDiv.querySelector('img').addEventListener('mouseleave', () => {
            setTimeout(() => {
                platoDiv.querySelector('img').style.transform = 'scale(1)';
            }, 3000); // 3000 milisegundos (3 segundos)
        });

    });
}

function mostrarPedido() {
    const pedidoTabla = document.getElementById('pedidoTabla');
    const totalPedido = document.getElementById('totalPedido');
    pedidoTabla.innerHTML = `
        <tr>
            <th>Plato</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Acciones</th>
        </tr>`;
    let total = 0;
    pedido.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.titulo}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio}</td>
            <td>$${subtotal}</td>
            <td>
                <button class="boton-mas" onclick="agregarAlPedido('${item.id}', '${item.titulo}', ${item.precio})">+</button>
                <button class="boton-menos" onclick="quitarDelPedido('${item.id}')">-</button>
            </td>`;
        pedidoTabla.appendChild(row);
    });
    totalPedido.textContent = `Total: $${total}`;
    document.getElementById('pedidoPopup').style.display = 'block';
}

function cerrarPedido() {
    document.getElementById('pedidoPopup').style.display = 'none';
}

function confirmarPedido() {
    if (pedido.length > 0) {
        Swal.fire({
            icon: 'success', // Icono de éxito
            title: '¡Pedido confirmado!',
            showConfirmButton: false, // No mostrar botón de confirmación
            timer: 1500 // Tiempo en milisegundos antes de cerrar automáticamente
        });
        finalizar();
    }
}

function finalizar() {

    pedido.forEach(item => {
        item.cantidad = 0;
        const inputCantidad = document.getElementById(`${item.id}-cantidad`);
        if (inputCantidad) {
            inputCantidad.value = 0;
        }
    });
    localStorage.setItem('pedido', JSON.stringify(pedido));


    pedido = [];
    const pedidoTabla = document.getElementById('pedidoTabla');
    pedidoTabla.innerHTML = `<tr><th>Plato</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr>`;
    const totalPedido = document.getElementById('totalPedido');
    totalPedido.textContent = `Total: $0`;


    mostrarPedido();

}

function limpiarOrden() {
    if (pedido.length > 0) {
        Swal.fire({
            title: '¿Está seguro?',
            text: "¿Desea limpiar el pedido actual?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, limpiar pedido',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                pedido.forEach(item => {
                    item.cantidad = 0;
                    const inputCantidad = document.getElementById(`${item.id}-cantidad`);
                    if (inputCantidad) {
                        inputCantidad.value = 0;
                    }
                });
                localStorage.setItem('pedido', JSON.stringify(pedido));


                pedido = [];
                const pedidoTabla = document.getElementById('pedidoTabla');
                pedidoTabla.innerHTML = `<tr><th>Plato</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr>`;
                const totalPedido = document.getElementById('totalPedido');
                totalPedido.textContent = `Total: $0`;
                Swal.fire(
                    'Pedido limpiado',
                    'Esperamos que siga con nosotros, le recomendamos el plato del día :)',
                    'success'
                );



                mostrarPedido();
            }
        });
    }
}

function quitarDelPedido(id) {
    const index = pedido.findIndex(item => item.id === id);
    if (index !== -1) {
        if (pedido[index].cantidad === 1) {
            pedido.splice(index, 1);
        } else {
            pedido[index].cantidad--;
        }
        guardarPedido();
    }
    mostrarPedido();
}


function agregarAlPedido(id, titulo, precio) {
    const index = pedido.findIndex(item => item.id === id);
    if (index !== -1) {
        pedido[index].cantidad++;
        document.getElementById(`${id}-cantidad`).value = pedido[index].cantidad;
    } else {
        pedido.push({ id, titulo, precio, cantidad: 1 });
        document.getElementById(`${id}-cantidad`).value = 1;
    }
    document.getElementById('pedidoPopup').style.display = 'none';
    mostrarPedido();

    // Mostrar mensaje de toast
    Toastify({
        text: `Agregado al carrito: ${titulo}`,
        duration: 3000, // Duración del toast en milisegundos
        gravity: 'top', // Posición del toast ('top', 'bottom', 'center')
        position: 'right', // Lado de la pantalla donde se muestra ('left', 'right', 'center')
        backgroundColor: '#007bff', // Color de fondo del toast
        stopOnFocus: true, // Detener el toast cuando el usuario hace foco en la página
    }).showToast();
}


function actualizarCantidad(id, nuevaCantidad) {
    const index = pedido.findIndex(item => item.id === id);
    if (index !== -1) {
        pedido[index].cantidad = parseInt(nuevaCantidad);
        guardarPedido();
    }
}

// Resto del código para búsqueda y mostrar platos filtrados

document.getElementById('inputBusqueda').addEventListener('input', function() {
    const filtro = this.value.toLowerCase();
    const platosFiltrados = menu.filter(plato => plato.titulo.toLowerCase().includes(filtro));
    mostrarPlatosFiltrados(platosFiltrados);
});

function mostrarPlatosFiltrados(platos) {
    const menuDiv = document.querySelector('.menu');
    menuDiv.innerHTML = "";
    platos.forEach(plato => {
        const platoDiv = document.createElement('div');
        platoDiv.classList.add('col-md-4');
        platoDiv.innerHTML = generarPlatoHTML(plato);
        menuDiv.appendChild(platoDiv);
    });
}


mostrarPlatos();
