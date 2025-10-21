import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
projectsContainer.innerHTML = '';
if (Array.isArray(projects)) {
  projects.forEach(project => renderProjects(project, projectsContainer));
} else {
  console.error('Invalid projects data:', projects);
}