import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

renderProjects(projects, projectsContainer, 'h2');
projectsTitle.textContent = projects.length;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});
let total = 0;

for (let d of data) {
  total += d;
}

let angle = 0;
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));

for (let d of data) {
  let endAngle = angle - (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .attr('class', 'legend-item')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
});

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value)
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  // TODO: clear up paths and legends
  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  // update paths and legends, refer to steps 1.4 and 2.2
  newArcs.forEach((arc, idx) => {
    newSVG.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));
  })
}

// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  let filteredProjects = setQuery(event.target.value);
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});