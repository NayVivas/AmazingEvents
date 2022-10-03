const { createApp } = Vue;

createApp({
  data() {
    return {
      eventos: [],
      message: "",
      checkedCategorias: [],
      checked: [],
      categoriasFiltradas: [],
      eventsPast: [],
      eventsFutures: [],
      idCards: "",
      cardsImport: "",
      resultFiltroCategories: [],
    };
  },
  created() {
    fetch("https://amazing-events.herokuapp.com/api/events")
      .then((respuesta) => respuesta.json())
      .then((data) => {
        this.eventos = data.events;
        this.eventsPast = this.eventos.filter(
          (eventoP) => eventoP.date < data.currentDate
        );
        this.eventsFutures = this.eventos.filter(
          (eventoF) => eventoF.date > data.currentDate
        );
        this.categoriasFiltradas = this.eventos;
        console.log(this.categoriasFiltradas);
        this.filtrarCategoriasCheck();

        if (document.title == "Events-Past Events") {
          this.eventos = this.eventsPast;
        }
        if (document.title == "Events-Upcoming Events") {
          this.eventos = this.eventsFutures;
        }
        if (document.title == "Events-Details") {
          this.idCards = location.search.split("?id=").join("");
          this.cardsImport = this.eventos.filter(
            (cards) => cards._id == this.idCards
          );
          console.log(this.idCards);
        }
        if (document.title == "Events-Stats") {
           this.mayorCapacidad(this.eventos);
           this.porcentajeAsistencia(this.eventos);
           this.revenuesPast(this.eventos);
           this.revenuesUpcoming(this.eventos);
        }
      });
  },
  mounted() {},
  methods: {
    filtrarBuscador(eventos) {
      this.categoriasFiltradas = eventos.filter((nombre) =>
        nombre.name.toLowerCase().includes(this.message.toLowerCase())
      );
    },
    filtrarCategoriasCheck() {
      this.checkedCategorias = this.categoriasFiltradas.map(
        (categoria) => categoria.category
      );
      this.checkedCategorias = new Set(this.checkedCategorias);
      console.log(this.checkedCategorias);
    },

    /* <---------- Funcion con mayor y menor porcentaje de asistencia------------>  */
      porcentajeAsistencia (capacityEvents) {
          let arrayAssistence = [];
          capacityEvents.forEach(function (arrayAsistencia) {
          arrayAssistence.push(arrayAsistencia.assistance * 100 / arrayAsistencia.capacity)
            });
          let arrayAssistanceFiltrado = arrayAssistence.filter(Number)
          arrayAssistanceFiltrado.sort(function(a, b) {
          return b - a
          });
          let mayor = arrayAssistanceFiltrado[0];
          let menor = arrayAssistanceFiltrado[arrayAssistanceFiltrado.length -1];
          let nameMayorA = capacityEvents.filter((arrayNombres) => (arrayNombres.assistance * 100 / arrayNombres.capacity) == mayor);
          let mayorPorcentaje = document.querySelector(".mayorPorcentaje");//Stats
          mayorPorcentaje.innerHTML = nameMayorA[0].name + " Percentage: " + mayor + "%";
          let nameMenorA = capacityEvents.filter((arrayNombres) => (arrayNombres.assistance * 100 / arrayNombres.capacity) == menor);
          let menorPorcentaje = document.querySelector(".menorPorcentaje"); //Stats
          menorPorcentaje.innerHTML = nameMenorA[0].name + " Percentage: " + menor + "%"
     },



     /* <---------- Funcion con mayor capacidad------------>  */
          mayorCapacidad (capacityEvents) {
            
            capacityEvents.sort(function (a, b) { return b.capacity - a.capacity;})
            let largerCapacity = document.querySelector(".largerCapacity"); //Stats
            largerCapacity.innerHTML = capacityEvents[0].name + " capacity:" + capacityEvents[0].capacity;
        },

 

          /* <---------- Funcion Revenues Past ------------>  */
 revenuesPast (arrays) {
  const resultFiltroCategories = arrays.reduce((acc, item) => {
    if (!acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, []);
console.log(resultFiltroCategories)

  let arrayPreciosPast = [];
  for (let i = 0; i < resultFiltroCategories.length; i++) {
    let acum = 0;
    let cont = 0;
    let cont2 = 0;
    for (let j = 0; j < arrays.length; j++) {
      if (arrays[j].category == resultFiltroCategories[i] && arrays[j].assistance) {
        let asistencia = (arrays[j].assistance * 100)/(arrays[j].capacity)
        acum += arrays[j].price * arrays[j].assistance;
        cont += asistencia;
        cont2 = cont2 + 1
      }
    }
    let promedio = cont/cont2
    console.log(promedio)

 let currency = function (acum) {
   return new Intl.NumberFormat("en-US", {
     style: "currency",
     currency: "USD",
   }).format(acum);
 };
 console.log(currency(acum));

    let objrevenuesPast = {};
    objrevenuesPast.category = resultFiltroCategories[i];
    objrevenuesPast.price = currency(acum);
    objrevenuesPast.percentage = promedio;
    arrayPreciosPast.push(objrevenuesPast);
  }
  console.log(arrayPreciosPast);




let tdrPrices = "";
 let tdcategories = "";
 let tdPercentage = "";
 let revenuesPastE = document.querySelector(".revenuesPast"); //Stats
 let categoriesTable = document.querySelector(".categoriesTable"); //Stats
 let percentagePast = document.querySelector(".percentagePast");//Stats
arrayPreciosPast.forEach((prices) => (tdrPrices += `<p>${prices.price}</p>`));
 revenuesPastE.innerHTML = tdrPrices;
arrayPreciosPast.forEach((categories) => (tdcategories += `<p>${categories.category}</p>`));
 categoriesTable.innerHTML = tdcategories; 
arrayPreciosPast.forEach((percentages) => (tdPercentage += `<p>${percentages.percentage + " %"}</p>`));
percentagePast.innerHTML = tdPercentage;
},

/* <---------- Funcion Revenues Up ------------>  */
revenuesUpcoming(arrays) {
  const resultFiltroCategories = arrays.reduce((acc, item) => {
    if (!acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, []);
  console.log(resultFiltroCategories);

  let arrayPreciosUp = [];
  for (let i = 0; i < resultFiltroCategories.length; i++) {
    let acum = 0;
    let cont = 0;
    let cont2 = 0;
    for (let j = 0; j < arrays.length; j++) {
      if (
        arrays[j].category == resultFiltroCategories[i] &&
        arrays[j].estimate
      ) {
        let asistencia = (arrays[j].estimate * 100) / arrays[j].capacity;
        acum += arrays[j].price * arrays[j].estimate;
        cont += asistencia;
        cont2 = cont2 + 1;
      }
    }
    let promedio = cont / cont2;
    console.log(promedio);
    let currency = function (acum) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(acum);
    };
    console.log(currency(acum));
    let objrevenuesUp = {};
    objrevenuesUp.category = resultFiltroCategories[i];
    objrevenuesUp.price = currency(acum);
    objrevenuesUp.percentage = promedio;
    arrayPreciosUp.push(objrevenuesUp);
  }
  console.log(arrayPreciosUp);

  let tdrPrices = "";
  let tdcategories = "";
  let tdPercentage = "";

 let categoriesTableUp = document.querySelector(".categoriesTableUp"); //Stats
let revenuesUp = document.querySelector(".revenuesUp"); //Stats
let percentageUp = document.querySelector(".percentageUp");//Stats
  arrayPreciosUp.forEach((prices) => (tdrPrices += `<p>${prices.price}</p>`));
  revenuesUp.innerHTML = tdrPrices;
  arrayPreciosUp.forEach(
    (categories) => (tdcategories += `<p>${categories.category}</p>`)
  );
  categoriesTableUp.innerHTML = tdcategories;
  arrayPreciosUp.forEach(
    (percentages) => (tdPercentage += `<p>${percentages.percentage + " %"}</p>`)
  );
  percentageUp.innerHTML = tdPercentage;
}




  },
  computed: {
    checkbox() {
      if (this.checked.length != 0) {
        this.categoriasFiltradas = this.eventos.filter((categoria) => {
          return this.checked.includes(categoria.category);
        });
      } else {
        this.categoriasFiltradas = this.eventos;
      }
      if (this.message != "") {
        this.filtrarBuscador(this.categoriasFiltradas);
      }
    },
  },
}).mount("#app");
