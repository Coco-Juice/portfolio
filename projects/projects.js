import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

projectsContainer.innerHTML = '';
if (Array.isArray(projects)) {
  projects.forEach(project => renderProjects(project, projectsContainer));
  projectsTitle.textContent = projects.length;
} else {
  console.error('Invalid projects data:', projects);
  projectsTitle.textContent = '0';
}