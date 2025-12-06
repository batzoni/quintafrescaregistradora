// script.js

// Función para obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaActual() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

// Función para cargar datos desde localStorage
function cargarDatos() {
  const datos = localStorage.getItem("registroVentasGastos");
  return datos ? JSON.parse(datos) : {};
}

// Función para guardar datos en localStorage
function guardarDatos(datos) {
  localStorage.setItem("registroVentasGastos", JSON.stringify(datos));
}

// Función para agregar una venta
function agregarVenta(tipo) {
  const input = document.getElementById(tipo);
  const monto = parseFloat(input.value);
  if (isNaN(monto) || monto <= 0) {
    alert("Por favor, ingresa un monto válido.");
    return;
  }

  const fecha = obtenerFechaActual();
  const datos = cargarDatos();
  if (!datos[fecha]) {
    datos[fecha] = {
      ventas: {
        efectivo: [],
        debito: [],
        mercadoPago: [],
        cuentaDni: [],
        otros: [],
      },
      gastos: [],
    };
  }
  datos[fecha].ventas[tipo].push(monto);
  guardarDatos(datos);
  input.value = "";
  actualizarTotales(fecha);
}

// Función para agregar un gasto
function agregarGasto() {
  const descripcion = document.getElementById("descripcionGasto").value.trim();
  const inputMonto = document.getElementById("gasto");
  const monto = parseFloat(inputMonto.value);
  if (!descripcion || isNaN(monto) || monto <= 0) {
    alert("Por favor, ingresa una descripción y un monto válido.");
    return;
  }

  const fecha = obtenerFechaActual();
  const datos = cargarDatos();
  if (!datos[fecha]) {
    datos[fecha] = {
      ventas: {
        efectivo: [],
        debito: [],
        mercadoPago: [],
        cuentaDni: [],
        otros: [],
      },
      gastos: [],
    };
  }
  datos[fecha].gastos.push({ descripcion, monto });
  guardarDatos(datos);
  document.getElementById("descripcionGasto").value = "";
  inputMonto.value = "";
  actualizarTotales(fecha);
}

// Función para calcular totales de un día
function calcularTotales(fecha) {
  const datos = cargarDatos();
  const dia = datos[fecha] || {
    ventas: {
      efectivo: [],
      debito: [],
      mercadoPago: [],
      cuentaDni: [],
      otros: [],
    },
    gastos: [],
  };

  const totalEfectivo = dia.ventas.efectivo.reduce((sum, v) => sum + v, 0);
  const totalDebito = dia.ventas.debito.reduce((sum, v) => sum + v, 0);
  const totalMercadoPago = dia.ventas.mercadoPago.reduce(
    (sum, v) => sum + v,
    0
  );
  const totalCuentaDni = dia.ventas.cuentaDni.reduce((sum, v) => sum + v, 0);
  const totalOtros = dia.ventas.otros.reduce((sum, v) => sum + v, 0);
  const totalVentas =
    totalEfectivo +
    totalDebito +
    totalMercadoPago +
    totalCuentaDni +
    totalOtros;
  const totalCantidadVentas =
    dia.ventas.efectivo.length +
    dia.ventas.debito.length +
    dia.ventas.mercadoPago.length +
    dia.ventas.cuentaDni.length +
    dia.ventas.otros.length;
  const totalGastos = dia.gastos.reduce((sum, g) => sum + g.monto, 0);
  const balance = totalVentas - totalGastos;

  return {
    totalEfectivo,
    totalDebito,
    totalMercadoPago,
    totalCuentaDni,
    totalOtros,
    totalVentas,
    totalCantidadVentas,
    totalGastos,
    balance,
    ventas: dia.ventas,
    gastos: dia.gastos,
  };
}

// Función para actualizar la interfaz con totales
function actualizarTotales(fecha) {
  const totales = calcularTotales(fecha);
  document.getElementById("totalEfectivo").textContent =
    totales.totalEfectivo.toFixed(2);
  document.getElementById("totalDebito").textContent =
    totales.totalDebito.toFixed(2);
  document.getElementById("totalMercadoPago").textContent =
    totales.totalMercadoPago.toFixed(2);
  document.getElementById("totalCuentaDni").textContent =
    totales.totalCuentaDni.toFixed(2);
  document.getElementById("totalOtros").textContent =
    totales.totalOtros.toFixed(2);
  document.getElementById("totalVentas").textContent =
    totales.totalVentas.toFixed(2);
  document.getElementById("totalCantidadVentas").textContent =
    totales.totalCantidadVentas;
  document.getElementById("totalGastos").textContent =
    totales.totalGastos.toFixed(2);
  document.getElementById("balance").textContent = totales.balance.toFixed(2);

  // Actualizar historial de ventas
  const historialVentas = document.getElementById("historialVentas");
  historialVentas.innerHTML = "";
  ["efectivo", "debito", "mercadoPago", "cuentaDni", "otros"].forEach(
    (tipo) => {
      totales.ventas[tipo].forEach((monto) => {
        const li = document.createElement("li");
        li.textContent = `${
          tipo.charAt(0).toUpperCase() + tipo.slice(1)
        }: $${monto.toFixed(2)}`;
        historialVentas.appendChild(li);
      });
    }
  );

  // Actualizar historial de gastos
  const historialGastos = document.getElementById("historialGastos");
  historialGastos.innerHTML = "";
  totales.gastos.forEach((gasto) => {
    const li = document.createElement("li");
    li.textContent = `${gasto.descripcion}: $${gasto.monto.toFixed(2)}`;
    historialGastos.appendChild(li);
  });
}

// Función para mostrar balance por día seleccionado
function mostrarBalancePorDia() {
  const fechaInput = document.getElementById("fecha");
  const fecha = fechaInput.value;
  if (!fecha) {
    alert("Por favor, selecciona una fecha.");
    return;
  }
  actualizarTotales(fecha);
}

// Función para realizar cierre de caja
function realizarCierreCaja() {
  const fechaInput = document.getElementById("fecha");
  const fecha = fechaInput.value || obtenerFechaActual();
  const totales = calcularTotales(fecha);
  const resumen = `
    Fecha: ${fecha}
    Total Ventas Efectivo: $${totales.totalEfectivo.toFixed(2)}
    Total Ventas Débito: $${totales.totalDebito.toFixed(2)}
    Total Ventas Mercado Pago: $${totales.totalMercadoPago.toFixed(2)}
    Total Ventas Cuenta DNI: $${totales.totalCuentaDni.toFixed(2)}
    Total Ventas Pedidos: $${totales.totalOtros.toFixed(2)}
    Total Ventas: $${totales.totalVentas.toFixed(2)}
    Total de Ventas (Cantidad): ${totales.totalCantidadVentas}
    Total Gastos: $${totales.totalGastos.toFixed(2)}
    Balance: $${totales.balance.toFixed(2)}
  `;
  document.getElementById("resumenTexto").textContent = resumen;
  document.getElementById("cierreResumen").style.display = "block";
  // Aquí podrías agregar lógica para imprimir o guardar el resumen
}

// Función para reiniciar datos del día
function reiniciarDatosDia() {
  const fechaInput = document.getElementById("fecha");
  const fecha = fechaInput.value;
  if (!fecha) {
    alert("Por favor, selecciona una fecha.");
    return;
  }
  if (
    confirm(
      `¿Estás seguro de que quieres reiniciar los datos del día ${fecha}?`
    )
  ) {
    const datos = cargarDatos();
    delete datos[fecha];
    guardarDatos(datos);
    actualizarTotales(fecha);
  }
}

// Inicializar con la fecha actual
document.addEventListener("DOMContentLoaded", () => {
  const fechaActual = obtenerFechaActual();
  document.getElementById("fecha").value = fechaActual;
  actualizarTotales(fechaActual);
});
