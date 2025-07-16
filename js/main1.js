document.addEventListener("DOMContentLoaded", function () {
  const selectCargo = document.getElementById("cargo");
  const formSecundario = document.getElementById("formSecundario");
  const formPreceptor = document.getElementById("formPreceptor");
  selectCargo.addEventListener("change", function () {
    const cargo = parseInt(this.value);
    // Ocultar todos
    formSecundario.classList.add("oculto");
    formPreceptor.classList.add("oculto");

    // Mostrar según selección
    if (cargo === 1) {
      formSecundario.classList.remove("oculto");
    } else if (cargo === 2) {
      formPreceptor.classList.remove("oculto");
    }
  });
  inicializar();
});
function inicializar() {
  const cargoInput = document.getElementById("cargo");
  const cargo = parseInt(cargoInput.value);
  console.log(cargo);
  switch (cargo) {
    case 1:
      //console.log("Cargo de hs");
      break;
    case 2:
      console.log("Cargo preceptor");
      break;
  }
  console.log("Salí del cargo");
}
