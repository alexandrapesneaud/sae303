import Chart from 'chart.js/auto'

//pourcentage des status

let results = data[2]['data']

const unsat = results.filter(tab => tab.status === "UNSAT").length;
const UNKNOWN = results.filter(tab => tab.status === "UNKNOWN").length;
const satCount = results.filter(solver => solver.status === "SAT").length;
const totalCount = results.length;
const satPercentage = (satCount / totalCount) * 100;
const unsatPercentage = (unsat / totalCount) * 100
const UNKNOWNPourcentage = (UNKNOWN / totalCount) * 100

const nomsUniques = new Set();

const nbrNomsUniques = results.filter(solvers => {
  const nomEnMinuscules = solvers.name;

  if (!nomsUniques.has(nomEnMinuscules)) {

    nomsUniques.add(nomEnMinuscules);
    return true;
  }

  return false;
}).length;
console.log("Pourcentage SAT:", satPercentage);
console.log("Pourcentage Non résolu:", unsatPercentage);
console.log("Pourcentage d'inconnu", UNKNOWNPourcentage);




const ctx = document.getElementById('camembertChart').getContext('2d');
const camembertChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Résolu', 'Non résolu', 'inconnu'],
    datasets: [{
      data: [satPercentage, unsatPercentage, UNKNOWNPourcentage],
      backgroundColor: ['#013a63', '#2a6f97', '#89c2d9'],
    }]
  },
  options: {
    title: {
      display: true,
      text: 'Pourcentage de solveurs avec le statut "SAT"',
    }
  }
});

//

let data2 = [];
for (let s of nomsUniques) {
  data2.push({
    name: s,
    SAT: results.filter(e => e.name === s && e.status === "SAT").length,
    UNKNOWN: results.filter(e => e.name === s && e.status === "UNKNOWN").length,
    UNSAT: results.filter(e => e.name === s && e.status === "UNSAT").length
  });
}

//Moyennes et total des problèmes résolus 

let data3 = [];
for (let v of nomsUniques) {
  const solverData = results.filter(e => e.name === v && e.status === "SAT");
  const totalTime = solverData.reduce((acc, solver) => acc + parseFloat(solver.time), 0);
  const averageTime = totalTime / solverData.length;

  data3.push({
    name: v,
    SAT: solverData.length,
    time: averageTime,
    nbSolved: solverData.length,
  });
}

// nombre de problème résolus ou non 

let ctx2 = document.getElementById('myChart').getContext('2d');
let myChart = new Chart(ctx2, {
  type: 'bar',
  data: {
    labels: data2.map(e => e.name),
    datasets: [
      { label: 'Résolus', data: data2.map(program => program.SAT), backgroundColor: '#013a63' },
      { label: 'Inconnu', data: data2.map(program => program.UNKNOWN), backgroundColor: '#2a6f97' },
      { label: 'Non-résolus', data: data2.map(program => program.UNSAT), backgroundColor: '#a9d6e5' }

    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
var ctx3 = document.getElementById('radarChart').getContext('2d');
var radarChart = new Chart(ctx3, {
  type: 'radar',
  data: {
    labels: data3.map(item => item.name),
    datasets: [{
      label: 'Temps moyen (en secondes)',
      data: data3.map(item => item.time),
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      fill: true,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    },
    {
      label: 'Nombre de problème',
      data: data3.map(item => item.nbSolved),
      borderColor: 'rgba(1,42,74, 1)',
      borderWidth: 2,
      fill: true,
      backgroundColor: 'rgba(1,42,74, 0.5)'
    }],
  },
  options: {
    scales: {
      r: {
        beginAtZero: true,
        max: Math.ceil(Math.max(...data3.map(item => item.time))),
      }
    }
  }
});


// problèmes par seconde

let satResults = results.filter(e => e.status === 'SAT');
let datasets = {};


let solverNames = [];

satResults.forEach(e => {
  let solverName = e.name;

  if (!datasets[solverName]) {
    datasets[solverName] = {
      label: solverName,
      data: [],
      borderColor: getRandomColor(),
      borderWidth: 2,
      fill: false,
    };

    solverNames.push(solverName);
  }

  datasets[solverName].data.push({
    x: parseFloat(e.time),
    y: solverName,
  });
});

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


//comparaison de deux programmes


let ctx4 = document.getElementById('myLineChart').getContext('2d');
let myLineChart = new Chart(ctx4, {
  type: 'line',
  data: {
    labels: solverNames,
    datasets: Object.values(datasets),
  },
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        beginAtZero: true,
        max: 2500,
        ticks: {
          stepSize: 100, 
        },
      },
      y: {
        type: 'category',

      },
    },
  },
});

async function fetchData() {
  return results;
}

document.getElementById('compareButton').addEventListener('click', async function () {
  const selectedResults = await fetchData();
  const select1 = document.getElementById('select1');
  const select2 = document.getElementById('select2');

  const value1 = select1.value;
  const value2 = select2.value;

  const program1 = data2.find(item => item.name === value1);
  const program2 = data2.find(item => item.name === value2);

  const totalProblems1 = program1.SAT + program1.UNKNOWN + program1.UNSAT;
  const totalProblems2 = program2.SAT + program2.UNKNOWN + program2.UNSAT;

  const successRate1 = (program1.SAT / totalProblems1) * 100;
  const successRate2 = (program2.SAT / totalProblems2) * 100;

  const ctx4 = document.getElementById('comparisonChart').getContext('2d');
  new Chart(ctx4, {
    type: 'bar',
    data: {
      labels: [value1, value2],
      datasets: [{
        label: 'Taux de réussite (en %)',
        data: [successRate1, successRate2],
        backgroundColor: ['rgba(1,42,74, 0.2)', 'rgba(169,214,229, 0.2)'],
        borderColor: ['rgba(1,42,74, 1)', 'rgba(169,214,229, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
});