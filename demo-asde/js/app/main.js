/**
 * © 2026 Gonzalo J. Del Castello. Distribuido bajo licencia ISC.
 * Ver LICENSE en la raíz del repositorio.
 */
import { aPesos, compararPeriodo, inicializarCalculadora } from "./funciones.js";
/**
 * Arranque de la página: menú móvil, pestañas y comparador de inflación.
 * El formulario de cargos se inicializa desde funciones.ts.
 */
// Pestañas: calculadora y comparador de inflación
const tabCalculadora = document.getElementById("tab-calculadora");
const tabInflacion = document.getElementById("tab-inflacion");
const vistaCalculadora = document.getElementById("vista-calculadora");
const vistaInflacion = document.getElementById("vista-inflacion");
tabInflacion?.addEventListener("click", () => {
    vistaCalculadora?.classList.add("oculto");
    vistaInflacion?.classList.remove("oculto");
    tabCalculadora?.classList.remove("activo");
    tabInflacion?.classList.add("activo");
});
tabCalculadora?.addEventListener("click", () => {
    vistaInflacion?.classList.add("oculto");
    vistaCalculadora?.classList.remove("oculto");
    tabInflacion?.classList.remove("activo");
    tabCalculadora?.classList.add("activo");
});
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');
    // Formulario de cargos (varios a la vez)
    inicializarCalculadora();
    if (menuToggle && navegacion) {
        // Abre/cierra con el botón hamburguesa
        menuToggle.addEventListener('click', function (event) {
            event.stopPropagation(); // evita que se dispare el click global
            navegacion.classList.toggle('activo');
            if (navegacion.classList.contains('activo')) {
                menuToggle.classList.add('oculto');
            }
            else {
                menuToggle.classList.remove('oculto');
            }
        });
        // Cerrar al hacer click fuera
        document.addEventListener('click', function (event) {
            if (navegacion.classList.contains('activo') &&
                !navegacion.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                navegacion.classList.remove('activo');
                menuToggle.classList.remove('oculto');
            }
        });
        // Cerrar al hacer scroll
        window.addEventListener('scroll', function () {
            if (navegacion.classList.contains('activo')) {
                navegacion.classList.remove('activo');
                menuToggle.classList.remove('oculto');
            }
        });
    }
});
// Comparador de inflación
const btnComparar = document.getElementById("btnComparar");
const inputInicio = document.getElementById("mesInicio");
const inputFin = document.getElementById("mesFin");
btnComparar.addEventListener("click", () => {
    const inicio = inputInicio.value;
    const fin = inputFin.value;
    if (!inicio || !fin) {
        alert("Seleccioná ambos meses.");
        return;
    }
    const resultado = compararPeriodo(inicio, fin);
    if (resultado) {
        const divRes = document.getElementById("resultadoInflacion");
        const pTexto = document.getElementById("textoResultado");
        if (divRes && pTexto) {
            // Usamos tu función para formatear la plata
            const plataInicio = aPesos(resultado.basicoInicio);
            const plataFin = aPesos(resultado.basicoFin);
            // Armamos el texto
            // 1. Calculamos los Índices Reales (Base 1 + porcentaje)
            const indiceSalario = 1 + (resultado.variacionSalarial / 100);
            const indiceInflacion = 1 + (resultado.inflacionPorcentual / 100);
            // 2. Calculamos el Poder Adquisitivo Real y el Sueldo Ideal
            const proporcionReal = (indiceSalario / indiceInflacion) * 100;
            const diferenciaPoderCompra = 100 - proporcionReal;
            // Matemática para el ejemplo: Sueldo base * factor de inflación
            const sueldoIdealNominal = resultado.basicoInicio * indiceInflacion;
            const plataIdeal = aPesos(sueldoIdealNominal); // Lo formateamos a pesos
            // 3. Armamos el texto base
            pTexto.innerHTML = `
        El valor del básico por hora cátedra en <strong>${inicio}</strong> era de <strong>${plataInicio}</strong>.<br>
        El valor del básico por hora cátedra en <strong>${fin}</strong> es de <strong>${plataFin}</strong>.<br><br>
        En este periodo, la inflación acumulada fue del <strong>${resultado.inflacionPorcentual.toFixed(1)}%</strong>, 
        mientras que tu sueldo básico aumentó un <strong>${resultado.variacionSalarial.toFixed(1)}%</strong>.
      `;
            // 4. Elaboración de Textos Finales con el Ejemplo Práctico
            if (indiceSalario < indiceInflacion) {
                // Hubo pérdida
                // 1. Calculamos el multiplicador para el bolsillo del usuario
                const multiplicadorBolsillo = indiceInflacion / indiceSalario;
                pTexto.innerHTML += `
          <br><br>
          <div style="background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffeeba; border-radius: 4px; color: #856404;">
            <strong>⚠️ Pérdida de Poder Adquisitivo: ${diferenciaPoderCompra.toFixed(1)}%</strong><br>
            A pesar de los aumentos nominales, el salario actual equivale solo al <strong>${proporcionReal.toFixed(1)}%</strong> de lo que debería ser para igualar el costo de vida.<br><br>
            
            <strong>💡 En resumen:</strong> La hora cátedra que en <strong>${inicio}</strong> valía <strong>${plataInicio}</strong>, si hubiese aumentado al ritmo de la inflación hoy debería valer <strong>${plataIdeal}</strong>, pero actualmente vale solo <strong>${plataFin}</strong>.<br><br>

            <hr style="border: 0; border-top: 1px solid #ffeeba; margin: 12px 0;">
            
            <strong>🧮 Calculá tu sueldo de bolsillo ideal:</strong><br>
            Como los aumentos impactan de forma proporcional, podés hacer tu propio cálculo. Multiplicá tu sueldo de bolsillo del mes ${fin} por <strong>${multiplicadorBolsillo.toFixed(2)}</strong> para saber cuánto deberías haber cobrado en este periodo si tu salario hubiera empatado a la inflación.
          </div>
        `;
            }
            else if (indiceSalario > indiceInflacion) {
                // Hubo ganancia
                const gananciaReal = proporcionReal - 100;
                pTexto.innerHTML += `
          <br><br>
          <div style="background-color: #d4edda; padding: 15px; border-left: 5px solid #c3e6cb; border-radius: 4px; color: #155724;">
            <strong>✅ Recuperación Salarial: ${gananciaReal.toFixed(1)}%</strong><br>
            El salario superó a la inflación del período.<br><br>
            <strong>💡 En resumen:</strong> La hora cátedra que en <strong>${inicio}</strong> valía <strong>${plataInicio}</strong>, para empatar la inflación hoy debería valer <strong>${plataIdeal}</strong>. Como actualmente vale <strong>${plataFin}</strong>, tuviste un incremento real en tu poder de compra.
          </div>
        `;
            }
            else {
                // Empate
                pTexto.innerHTML += `<br><br><span style="color:var(--secundarioOscuro);"><strong>⚖️ El salario empató exactamente con la inflación en este período.</strong><br>La hora cátedra que valía ${plataInicio} hoy vale ${plataFin}, lo que representa un empate exacto con la inflación (${plataIdeal}).</span>`;
            }
            divRes.classList.remove("oculto");
        }
    }
});
//# sourceMappingURL=main.js.map