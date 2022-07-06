//VARIABLE CARRITO CON UNA FUNCION PARA QUE DETECTASE EN CASO DE EXISTIR VALORES ANTERIORES EN EL STORAGE
let carrito = cargarCarrito();
//VARIABLE PARA PODER TRABAJAR CON LA FUNCION "obtenerDatos"
let datosProductos = [];
//VARIABLE CANTIDAD PARA QUE NO SE PIERDAN LOS DATOS ALMACENADOS AL REFRESCAR LA VENTANA
let cantidadTotalCompra = carrito.length;


$(document).ready(function () {
  $("#cantidad-compra").text(cantidadTotalCompra);
  //CONFIGURACION ORDENADOR DE PRODUCTOS
  $("#seleccion option[value='pordefecto']").attr("selected", true);
  $("#seleccion").on("change", ordenarProductos);

  //RENDERIZADO
  $("#gastoTotal").html(`Total: $${calcularTotalCarrito()}`);
  obtenerDatos();
  renderizarProductos();
  mostrarEnTabla();

  //ALERTA CARRITO VACIO CON EVENTO Y SWEET ALERT
  $("#btn-continuar").on('click', function (e) {
    if (carrito.length === 0){
      Swal.fire({
        title:"Error",
        text:"Debe agregar algun producto antes de finalizar la compra.", 
        confirmButtonColor: '#2E9D70',
        icon:'error'
         
      });
    }
else {
    Swal.fire({
      title: '¿Desea finalizar la siguiente compra?',
      text: `Total a abonar: $${calcularTotalCarrito()}`,
      showCancelButton: true,
      confirmButtonColor: '#2E9D70',
      cancelButtonColor: '#A82F2F',
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Compra confirmada',
          'Gracias por confiar en Peters Hnos, ¡Que lo disfrutes!',
          'success'
        )
        vaciarCarrito();
      }
      else {}
       vaciarCarrito();
    })
    }
  });
});

//RENDERIZADO DE PRODUCTOS EN CARDS CON EL TOASTIFY PARA AVISAR CUANDO UN PRODUCTO FUE AGREGADO CON EXITO
function renderizarProductos() {
  for (const producto of datosProductos) {
    $("#section-productos").append(`<div class="card-product"> 
                                    <div class="img-fluid">
                                    <img src="${producto.foto}" alt="${producto.nombre}" class="img-product"/>
                                    </div>
                                    <div class="info-producto">
                                    <p class="font">${producto.nombre}</p>
                                    <p class="font">${producto.grado}</p>
                                    <strong class="font">$${producto.precio}</strong>
                                    <button class="btn btn-outline-dark" id="btn${producto.id}"> Agregar al carrito </button>
                                    </div>
                                    </div>`);

    $(`#btn${producto.id}`).on('click', function () {
      agregarAlCarrito(producto);
      
    });
    $(`#btn${producto.id}`).on('click', function () {
      Toastify({
        text: "Producto Agregado Con Exito!",
        gravity: 'bottom',
        position: 'left', 
        duration: 3000,
        style: {
          background: "linear-gradient(to right, #3B3B3B, #535353)",
        }
    }).showToast();
      
    })
    
  }
};

//FUNCION PARA OBTENER LOS DATOS DE LOS PRODUCTOS EN EL JSON
function obtenerDatos() {
  $.getJSON("../json/productos.json", function (respuesta, estado) {
    if (estado == "success") {
      datosProductos = respuesta;
      renderizarProductos();
    }
  });
}

//FUNCION PARA LOS ORDENADORES DE PRODUCTOS
function ordenarProductos() {
  let seleccion = $("#seleccion").val();
  if (seleccion == "menor") {
    datosProductos.sort(function (a, b) {
      return a.precio - b.precio
    });
  } else if (seleccion == "mayor") {
    datosProductos.sort(function (a, b) {
      return b.precio - a.precio
    });
  } else if (seleccion == "alfabetico") {
    datosProductos.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }

  $(".card-product").remove();
  renderizarProductos();
}

//CLASE PARA ALMACENAR LOS PRODUCTOS EN EL CARRITO
class ProductoCarrito {
  constructor(prod) {
    this.id = prod.id;
    this.foto = prod.foto;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.cantidad = 1;
  }
}


function agregarAlCarrito(productoAgregado) {
  let encontrado = carrito.find(p => p.id == productoAgregado.id);
  if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
 

    
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);

  } else {
    
    let posicion = carrito.findIndex(p => p.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
  }

  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarEnTabla();
}


function mostrarEnTabla() {
  $("#tablabody").empty();
  for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                            <td> ${prod.nombre}</td>
                            <td id='${prod.id}'> ${prod.cantidad}</td>
                            <td> ${prod.precio}</td>
                            <td><button class='btn btn-light' id="eliminar${prod.id}">🗑️</button></td>
                            </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
      let eliminado = carrito.findIndex(p => p.id == prod.id);
      carrito.splice(eliminado, 1);
      console.log(eliminado);
      $(`#fila${prod.id}`).remove();
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })
  }
};



//FUNCION PARA CALCULAR LA CANTIDAD Y EL MONTO TOTAL
function calcularTotalCarrito() {
  let total = 0;
  for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
  }
  $("#montoTotalCompra").text(total);
  $("#cantidad-compra").text(carrito.length);
  return total;
}

//FUNCION DEL VACIADO DEL CARRITO
function vaciarCarrito() {
  $("#gastoTotal").text("Total: $0");
  $("#cantidad-compra").text("0");
  $(".tabla-carrito").remove();
  localStorage.clear();
  carrito = [];
}

//FUNCION PARA QUE NO SE BORREN LOS DATOS UNA VEZ REFRESCADA LA PAGINA
function cargarCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (carrito == null) {
    return [];
  } else {
    return carrito;
  }
}