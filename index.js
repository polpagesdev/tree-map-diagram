// Global variable to store movie sales data
let movieSales;

// Constants for SVG dimensions and legend height
const WIDTH = 1200, HEIGHT = 615, LEGEND_HEIGHT = 100;

// Create SVG container and set its properties
const svg = d3.select('#treemap')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', `${0} ${0} ${WIDTH} ${HEIGHT}`)
  .append('g');

// Check if the data is cached in local storage
if (localStorage.getItem('movieSalesCache')) {
  movieSales = JSON.parse(localStorage.getItem('movieSalesCache'));
  drawMap();
} else {
  // URL for fetching the data
  const dataURL = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
  d3.json(dataURL).then(data => {
    movieSales = data;
    localStorage.setItem('movieSalesCache', JSON.stringify(data));
    drawMap();
  }).catch(() => {
    alert('Sorry, but needed data can\'t be fetched.');
  });
}

// Function to draw the tree map visualization
function drawMap() {
  // Define color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Define treemap layout
  const treemap = d3.treemap()
    .size([WIDTH, HEIGHT - LEGEND_HEIGHT])
    .paddingInner(1);

  // Process data to fit the treemap layout
  const root = d3.hierarchy(movieSales)
    .eachBefore(d => {
      d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
    })
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  // Apply treemap layout on data
  treemap(root);

  // Draw rectangles for each data item
  const cell = svg.selectAll('g')
    .data(root.leaves())
    .enter().append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  cell.append('rect')
    .attr('id', d => d.data.id)
    .attr('class', 'tile')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('fill', d => color(d.data.category))
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);

  // Add labels to the rectangles
  cell.append('text')
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)
    .attr('class', 'tile-text')
    .selectAll('tspan')
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter().append('tspan')
    .attr('font-size', '10px')
    .attr('fill', 'white')
    .attr('x', 2)
    .attr('y', (d, i) => 10 * (i + 1))
    .text(d => d);

  // Add legend for categories
  const legendGroup = svg.append('g').attr('id', 'legend');
  const legendPadding = { left: 300, top: 40 };

  legendGroup.append('rect')
    .attr('y', HEIGHT - LEGEND_HEIGHT)
    .attr('width', WIDTH)
    .attr('height', LEGEND_HEIGHT)
    .attr('fill', '#fff');

  // Add colored rectangles for legend
  legendGroup.selectAll('.legend-item')
    .data(movieSales.children)
    .enter().append('rect')
    .attr('class', 'legend-item')
    .attr('y', HEIGHT - LEGEND_HEIGHT + legendPadding.top)
    .attr('x', (d, i) => legendPadding.left + 6 * i * 15)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', d => color(d.name));

  // Add text labels for the legend
  legendGroup.selectAll('.legend-text')
    .data(movieSales.children)
    .enter().append('text')
    .attr('font-size', '12px')
    .attr('fill', '#555')
    .attr('y', HEIGHT - LEGEND_HEIGHT + legendPadding.top + 11)
    .attr('x', (d, i) => legendPadding.left + 20 + 6 * i * 15)
    .text(d => d.name);
}

// Mouse over event handler for displaying tooltips
function handleMouseOver(d) {
  d3.select('#tooltip')
    .attr('data-value', d.data.value)
    .style('top', `${d3.event.pageY + 10}px`)
    .style('left', `${d3.event.pageX + 10}px`)
    .html(`<p>Name: ${d.data.name}</p>` + `<p>Category: ${d.data.category}</p>` + `<p>Value: ${d.data.value}</p>`)
    .style('opacity', 0.8)
    .style('visibility', 'visible');
}

// Mouse out event handler for hiding tooltips
function handleMouseOut() {
  d3.select('#tooltip')
    .style('opacity', 0)
    .style('visibility', 'hidden');
}
