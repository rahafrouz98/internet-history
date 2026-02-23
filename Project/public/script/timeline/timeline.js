//https://visjs.github.io/vis-timeline/docs/timeline/
//https://github.com/visjs/vis-timeline
//https://app.unpkg.com/vis-timeline@8.5.0/files/README.md

function createTimeline()
{
    let container = document.getElementById("visualization");

    let items = new vis.DataSet([
    { id: 1, content: "item 1", start: "2014-04-20", title:"Internet adoption in Canada", group:2 },
    { id: 2, content: "item 2", start: "2014-04-14" , group:1 },
    { id: 3, content: "item 3", start: "2014-04-18" , group:2 },
    { id: 4, content: "item 4", start: "2014-04-16", end: "2014-04-19", group:3  },
    { id: 5, content: "item 5", start: "2014-04-25" , group:1 },
    { id: 6, content: "item 6", start: "2014-04-27", type: "point", group:3 },
    ]);

    let options = {
        width: '100%',
        height: '400px',
        margin: {
            item: 50
        }
    };
    let groups = [
        {id: 1, content: "group 1"},
        {id: 2, content: "group 2"},
        {id: 3, content: "group 3"},
    ]

    let timeline = new vis.Timeline(container, items, groups, options);
}

export {createTimeline}
