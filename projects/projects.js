import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');
const colors = d3.scaleOrdinal(d3.schemeTableau10);
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;

renderProjects(projects, projectsContainer, 'h2');
projectsTitle.textContent = projects.length;

function renderPieChart(projectsGiven) {
  const newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  const newData = newRolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  const newSliceGenerator = d3.pie().value((d) => d.value);
  const newArcData = newSliceGenerator(newData);
  const newArcs = newArcData.map((d) => arcGenerator(d));

  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('*').remove();

  newArcs.forEach((arc, idx) => {
    newSVG
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        newSVG
          .selectAll('path')
          .attr('class', (_, idx) => (
            idx === selectedIndex ? 'selected' : ''
          ));
        legend
          .selectAll('li')
          .attr('class', (_, idx) => (
            `legend-item${idx === selectedIndex ? ' selected' : ''}`
          ));
          if (selectedIndex === -1) {
            renderProjects(projects, projectsContainer, 'h2');
            projectsTitle.textContent = projects.length;
          } else {
            const selectedYear = newData[selectedIndex].label;
            const filteredByYear = projects.filter(p => p.year === selectedYear);
            renderProjects(filteredByYear, projectsContainer, 'h2');
            projectsTitle.textContent = filteredByYear.length;
          }
      });
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const filteredProjects = projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  projectsTitle.textContent = filteredProjects.length;
  renderPieChart(filteredProjects);
});
