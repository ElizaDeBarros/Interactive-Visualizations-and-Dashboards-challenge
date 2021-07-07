function init() {
    // Use D3 to select the dropdown menu
    var dropdownMenu = d3.select("#selDataset");
    // 1. Use the D3 library to read in `samples.json`.
    d3.json("samples.json").then(function(data) {
        dataNames = data.names;   
        //console.log(data);
        
        // add the options to the button
        dropdownMenu.selectAll("option")
            .data(dataNames)
            .enter()
            .append("option")
            .text(a => a)
            .attr('value', a => a);

        // individual zero is the default individual on the page
        var FirstIndividual = dataNames[0];

        CreatePlots(FirstIndividual);
        individualDemographic(FirstIndividual);
        gauge(FirstIndividual);
    });
};

// On change to the dropdown menu

d3.selectAll("#selDataset").on("change", getNewData);

// Function called by DOM changes
function getNewData() {
    var dropdownMenu = d3.select("#selDataset");
    // Assign the value of the dropdown menu option to a variable
    var newID = dropdownMenu.property("value");
    // Initialize an empty array for the country's data
    CreatePlots(newID);
    individualDemographic(newID);
    gauge(newID);
};

// 2. Create a horizontal bar chart with a dropdown menu to display the top 10 OTUs found in that individual.
function CreatePlots(id) {  
    d3.json("samples.json").then(function(data) {
        var dataArray = data.samples;

        // individual zero is the default individual on the page
        // var FirstIndividual = dataArray[0];
        // filter per individual ID
        var IDfiltered = dataArray.filter(sample => sample.id === id);
        IDfiltered = IDfiltered[0];
        //console.log(IDfiltered);
        
        var individualArray = [];
            
            for (i=0; i < IDfiltered.sample_values.length; i++){
                individualArray.push({
                    id: `OTU ${IDfiltered.otu_ids[i]}`,
                    idNoLabel: IDfiltered.otu_ids[i],
                    value: IDfiltered.sample_values[i],
                    label: IDfiltered.otu_labels[i]
                });
            };
                //sort value in ascending order
                individualArray.sort(function compareFunction(a,b) {
                    return b.value - a.value;
                });
                // select top 10 results
                var top10 = individualArray.slice(0,10);
                
                // reverse to display from top to bottom in descending order
                var top10Reversed = top10.sort(function sortFunction(a,b){
                    return a.value - b.value;
                })
                var trace1 = {
                    // * Use `sample_values` as the values for the bar chart.
                    x: top10Reversed.map(row => row.value),
                    // * Use `otu_ids` as the labels for the bar chart.
                    y: top10Reversed.map(row => row.id),
                    // * Use `otu_labels` as the hovertext for the chart.
                    text: top10Reversed.map(row => row.label),
                    type: "bar",
                    orientation: "h"
                };

                var data1 = [trace1];
                var layout1 = {
                    title: `<span style='font-size:1rem;'><b>Top 10 OTUs for individual ${id} <b></span>`,
                    xaxis: {autorange: true, title: 'Sample values'},
                    yaxis: {autorange: true},
                };
                Plotly.newPlot("bar", data1, layout1);

                // 3. Create a bubble chart that displays each sample.
                
                var trace2 = {
                    // * Use `otu_ids` for the x values.
                    x: individualArray.map(row => row.idNoLabel),
                     // * Use `sample_values` for the y values.
                    y: individualArray.map(row => row.value),
                    type: "bubble",
                    mode: 'markers',
                    marker: {
                        // * Use `sample_values` for the marker size.
                        size:individualArray.map(row => row.value),
                        // * Use `otu_ids` for the marker colors.
                        color: individualArray.map(row => row.idNoLabel),
                       //sizemode: 'area',  // if uncommented, the bubles will be smaller, but this fixes some plots with large bubles (individual 958 for example)
                        colorscale: 'Earth'
                    },
                    // * Use `otu_labels` for the text values.
                    text: individualArray.map(row => row.label)
                };
                var data2 = [trace2];
                var layout2 = {
                    title: `<span style='font-size:1rem;'><b> OTUs for individual ${id} <b></span>`,
                    xaxis: {autorange: true, title: 'OTU ID'},
                    yaxis: {autorange: true},
                };
                Plotly.newPlot("bubble", data2, layout2);
    });
};
//4. Display the sample metadata, i.e., an individual's demographic information.
function individualDemographic(id) {  
    d3.json("samples.json").then(function(data) {
        var dataMetadata = data.metadata;
        //console.log(dataMetadata);
        
        
        for (row=0; row<dataMetadata.length; row++) {
            if (dataMetadata[row].id == id) {
                var index= row; 
                //console.log(index);
            };  
        };
        //console.log(dataMetadata[index]);

        var IDfiltered = dataMetadata[index];
        var selection = d3.select("#sample-metadata");
        selection.html("");
        Object.entries(IDfiltered).forEach(([key, value]) => {
            selection.append("h5").text(`${key}: ${value}`);
        });
    });  
};
       

// * Adapt the Gauge Chart from <https://plot.ly/javascript/gauge-charts/> to plot the weekly washing frequency of the individual.

// * You will need to modify the example gauge code to account for values ranging from 0 through 9.

// * Update the chart whenever a new sample is selected.

function gauge(id) {  
    d3.json("samples.json").then(function(data) {
        var dataMetadata = data.metadata;

        for (row=0; row<dataMetadata.length; row++) {
            if (dataMetadata[row].id == id) {
                var washf= dataMetadata[row].wfreq;
            };
        };
        //console.log(washf);
        
        var data = [
            {
                domain: { x: [0, 9], y: [0, 9] },
                value: washf,
                title: {text: `<span style='font-weight: bold;'><b>Belly Button Washing Frequency<b></span><br><span style='font-weight: normal;'>Scrubs per week</span>`},
                type: "indicator",
                mode: "gauge",
                gauge: {
                    axis: {range: [null, 9]},
                    bar: { color: "green" },
                    steps: [
                        {range: [0,1], color: '#D6EAE2'},
                        {range: [1,2], color: '#C4E2D6'},
                        {range: [2,3], color: '#A5D3C0'},
                        {range: [3,4], color: '#93C9B3'},
                        {range: [4,5], color: '#73B99D'},
                        {range: [5,6], color: '#5BAD8C'},
                        {range: [6,7], color: '#4E9C7C'},
                        {range: [7,8], color: '#44886C'},
                        {range: [8,9], color: '#2F5F4C'},  
                    ],
                    threshold: {
                        line: { color: "purple", width: 6 },
                        thickness: 0.75,
                        value: 2
                      }
                }
            }
        ];
        var layout = { width: 600, height: 500, margin: { t: 0, b: 0 } };
        Plotly.newPlot('gauge', data, layout);
    });
};
init();