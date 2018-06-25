var width = 960,
    size = 230,
    padding = 20;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);

var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv("flowers.csv", function(error, data) {
    if (error) throw error;

    var filtered_data = data.map(function(d) { return d; });

    var domainByTrait = {},
        traits = d3.keys(data[0]).filter(function(d) { return d !== "species"; }),
        n = traits.length;

    traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var svg = d3.select("#chart").append("svg")
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]);
            d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]);
            d3.select(this).call(yAxis); });

    update();

    d3.selectAll('.target').on("change", function() {
        var type = this.value;
        if (this.checked) {
            // console.log(type + " checked");
            var new_targets = data.filter(function(d) { return d.species == type; });
            filtered_data = filtered_data.concat(new_targets);
            // console.log(filtered_data);
        } else {
            // console.log(type + " unchecked");
            filtered_data = filtered_data.filter(function(d) { return d.species != type; });
            // console.log(filtered_data);
        }
        update();
    });

    function update() {

        svg.selectAll(".cell").remove();

        var cell = svg.selectAll(".cell").data(cross(traits, traits));

        cell.enter().append("g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
            .each(plot);

        svg.selectAll(".cell").data(cross(traits, traits)).filter(function(d) { return d.i === d.j; }).append("text")
            .attr("x", padding)
            .attr("y", padding)
            .attr("dy", ".71em")
            .text(function(d) { return d.x; });
    }

    function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        var dot = cell.selectAll('.dot').data(filtered_data);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        dot.enter().append("circle").attr("class", "dot")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 4)
            .style("fill", function(d) { return color(d.species); });

        dot.exit().remove()
    }
});

function cross(a, b) {
    var c = [],
        n = a.length,
        m = b.length,
        i, j;
    for (i = -1; ++i < n;)
        for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
    return c;
}