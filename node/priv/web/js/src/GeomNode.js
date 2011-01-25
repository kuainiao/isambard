function create_geom_command(parameters) {
    var doFn = function() {
        $.ajax({
            type: "POST",
            url: "/geom/",
            contentType: "application/json",
            data: JSON.stringify(parameters),
            success: function(nodeData){
                var path = nodeData.path;
                $.ajax({
                    type: "GET",
                    url: path,
                    success: function(nodeData) {
                        /* FIXME: The picking doesn't seem to work unless there is an 
                           extra node above the geometry node? */
                        nodeData['type'] = 'geometry';
                        SceneJS.withNode("geom").add("node", {type: "material",
                                                              id: path,
                                                              emit: 0,
                                                              baseColor:      { r: 0.5, g: 1.0, b: 0.0 },
                                                              specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                                              specular:       0.9,
                                                              shine:          100.0,
                                                              nodes: [nodeData]});

                        Interaction.pickable(path);
                    }
                });
            }
        });
    };
    var undoFn = function() {
        
    };
    var cmd = new Command(doFn, undoFn);
}


function GeomNode() {

    if (!arguments[0].type) {
        throw new Error("type is not defined");
    }

    this.type = arguments[0].type;
    this.parameters = arguments[0].parameters;
    this.parent = undefined;

    this.children = [];
    for (var i = 1; i < arguments.length; ++i) {
        arguments[i].parent = this;
        this.children.push(arguments[i]);
    }
    
    this.json = function() {
        // No need to do somethign special with parameters if they are not 
        // defined, as JSON.stringigy simply ignores those fields
        return JSON.stringify({type: this.type,
                               parameters: this.parameters});
    }
    
}