$(document).ready(function () {

    // Evento para el botón Calcular Horas
    $('#calcularHoras').click(function () {
        calcularTotalHoras();
    });

    // Calcular automáticamente al cambiar cualquier campo de tiempo
    $('.tiempo, #tiempoAlmuerzo').change(function () {
        calcularTotalHoras();
    });

    // Actualizar día y mes automáticamente al cambiar la fecha
    $('#fecha').change(function () {
        const fecha = new Date($(this).val());
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        $('#mes').val(meses[fecha.getMonth()]);
        $('#dia').val(fecha.getDate());
    });

    // Función para calcular horas totales
    window.calcularTotalHoras = function () {
        const horaIngreso = $('#horaIngreso').val();
        const horaSalidaManana = $('#horaSalidaManana').val();
        const horaIngresoTarde = $('#horaIngresoTarde').val();
        const horaSalidaTarde = $('#horaSalidaTarde').val();
        const tiempoAlmuerzo = parseFloat($('#tiempoAlmuerzo').val()) || 0;

        if (!horaIngreso || !horaSalidaManana || !horaIngresoTarde || !horaSalidaTarde) {
            return null;
        }

        function calcularMinutos(horaInicio, horaFin) {
            const [h1, m1] = horaInicio.split(':').map(Number);
            const [h2, m2] = horaFin.split(':').map(Number);
            return (h2 * 60 + m2) - (h1 * 60 + m1);
        }

        const minutosManana = calcularMinutos(horaIngreso, horaSalidaManana);
        const minutosTarde = calcularMinutos(horaIngresoTarde, horaSalidaTarde);
        const tiempoTotalMinutos = minutosManana + minutosTarde - (tiempoAlmuerzo * 60);

        const horas = Math.floor(tiempoTotalMinutos / 60);
        const minutos = tiempoTotalMinutos % 60;
        const totalHorasStr = `${horas}h ${minutos}m`;

        $('#totalHoras').val(totalHorasStr);

        return { horas, minutos, tiempoTotalMinutos };
    };

    // Función para cargar registros
    function cargarRegistros() {
        const registrosGlobales = JSON.parse(localStorage.getItem('registrosAsistencia')) || [];
        const container = $('#registrosContainer');
        container.empty();

        if (registrosGlobales.length === 0) {
            container.html('<div class="col-12"><div class="alert alert-info">No hay registros guardados.</div></div>');
            return;
        }

        registrosGlobales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        registrosGlobales.forEach((registro, index) => {
            const card = `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card worker-card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="card-title">${registro.trabajador}</h6>
                            <span class="delete-btn" data-index="${index}"><i class="fas fa-trash-alt text-white"></i></span>
                        </div>
                        <div class="card-body">
                            <p class="mb-2"><strong>Fecha:</strong> ${registro.fecha} (${registro.mes}, día ${registro.dia})</p>
                            <p class="mb-2"><strong>Cliente:</strong> ${registro.cliente}</p>
                            <p class="mb-2"><strong>Proyecto:</strong> ${registro.proyecto}</p>
                            <p class="mb-2"><strong>Horario:</strong> ${registro.horaIngreso} - ${registro.horaSalidaManana}, ${registro.horaIngresoTarde} - ${registro.horaSalidaTarde}</p>
                            <p class="mb-2 time-summary"><strong>Total:</strong> ${registro.totalHoras}</p>
                            ${registro.observaciones ? `<p class="mb-0"><strong>Observaciones:</strong> ${registro.observaciones}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });

        $('.delete-btn').click(function () {
            const index = $(this).data('index');
            const registro = registrosGlobales[index];

            if (confirm(`¿Está seguro que desea eliminar el registro de ${registro.trabajador} del ${registro.fecha}?`)) {
                registrosGlobales.splice(index, 1);
                localStorage.setItem('registrosAsistencia', JSON.stringify(registrosGlobales));

                const registrosTrabajador = JSON.parse(localStorage.getItem(`registros_${registro.trabajador}`)) || [];
                const indexTrabajador = registrosTrabajador.findIndex(r =>
                    r.fecha === registro.fecha &&
                    r.horaIngreso === registro.horaIngreso
                );

                if (indexTrabajador !== -1) {
                    registrosTrabajador.splice(indexTrabajador, 1);
                    localStorage.setItem(`registros_${registro.trabajador}`, JSON.stringify(registrosTrabajador));
                }

                cargarRegistros();
            }
        });
    }

    cargarRegistros();

    $('#asistenciaForm').submit(function (e) {
        e.preventDefault();

        const form = $(this)[0];
        if (!form.checkValidity()) {
            e.stopPropagation();
            $(this).addClass('was-validated');
            return;
        }

        const totalHorasObj = calcularTotalHoras();
        if (!totalHorasObj) {
            alert("Por favor complete todos los campos de tiempo correctamente.");
            return;
        }

        const nuevoRegistro = {
            trabajador: $('#trabajador').val(),
            proyecto: $('#proyecto').val(),
            fecha: $('#fecha').val(),
            mes: $('#mes').val(),
            dia: $('#dia').val(),
            cliente: $('#cliente').val(),
            tiempoAlmuerzo: $('#tiempoAlmuerzo').val(),
            horaIngreso: $('#horaIngreso').val(),
            horaSalidaManana: $('#horaSalidaManana').val(),
            horaIngresoTarde: $('#horaIngresoTarde').val(),
            horaSalidaTarde: $('#horaSalidaTarde').val(),
            totalHoras: $('#totalHoras').val(),
            totalMinutos: totalHorasObj.tiempoTotalMinutos,
            observaciones: $('#observaciones').val()
        };

        const registrosGlobales = JSON.parse(localStorage.getItem('registrosAsistencia')) || [];
        registrosGlobales.push(nuevoRegistro);
        localStorage.setItem('registrosAsistencia', JSON.stringify(registrosGlobales));

        const trabajador = nuevoRegistro.trabajador;
        const registrosTrabajador = JSON.parse(localStorage.getItem(`registros_${trabajador}`)) || [];
        registrosTrabajador.push(nuevoRegistro);
        localStorage.setItem(`registros_${trabajador}`, JSON.stringify(registrosTrabajador));

        $('#asistenciaForm').removeClass('was-validated')[0].reset();
        $('#totalHoras').val('');

        alert('Registro guardado exitosamente.');

        cargarRegistros();
    });

    // Función para calcular recargos automáticamente
    function calcularRecargos() {
        const horaExtraDiurna = parseInt($('#horaExtraDiurna').val()) || 0;
        const horaExtraNocturna = parseInt($('#horaExtraNocturna').val()) || 0;
        const horaExtraDiurnaFestiva = parseInt($('#horaExtraDiurnaFestiva').val()) || 0;
        const horaExtraNocturnaFestiva = parseInt($('#horaExtraNocturnaFestiva').val()) || 0;

        const recargoNocturno = horaExtraNocturna * 1.35;
        const recargoNocturnoFestivo = horaExtraNocturnaFestiva * 1.75;
        const recargoDiurnoFestivo = horaExtraDiurnaFestiva * 1.50;

        $('#recargoNocturno').val(recargoNocturno.toFixed(2));
        $('#recargoNocturnoFestivo').val(recargoNocturnoFestivo.toFixed(2));
        $('#recargoDiurnoFestivo').val(recargoDiurnoFestivo.toFixed(2));
    }

    // Recalcular recargos al cambiar las horas extras
    $('#horaExtraDiurna, #horaExtraNocturna, #horaExtraDiurnaFestiva, #horaExtraNocturnaFestiva').change(function () {
        calcularRecargos();
    });

    // Inicializar valores al cargar
    calcularRecargos();

});
