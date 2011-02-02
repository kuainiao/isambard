function SelectionManager() {

    var selected = [];

    this.selected = function() {
        var toReturn = [];
        for (var i in selected) {
            toReturn.push(selected[i]);
        }
        return toReturn;
    }

    this.size = function() {
        return selected.length;
    }
    
    this.picked = function(path) {

        var alreadySelected = false;
        for (var i in selected) {
            if (selected[i] == path) {
                alreadySelected = true;
            } 
        }

        if (shiftPicking) {
            if (alreadySelected) {
                this.deselectPath(path);
            } else  {
                this.selectPath(path);
            }
        } else {
            this.selectOnly(path);
        }
    }

    this.selectPath = function(path) {
        selected.push(path);
        // TODO: Replace with observer
        SceneJS.withNode(path).set('baseColor', { r: 1.0, g: 1.0, b: 0.0 });
        this.notify({selected : [path]});
    }
    
    this.deselectPath = function(path) {
        selected.splice(selected.indexOf(path), 1);
        // TODO: Replace with observer
        SceneJS.withNode(path).set('baseColor', { r: 0.5, g: 1.0, b: 0.0 });
        this.notify({deselected : [path]});
    }

    this.selectOnly = function(path) {
        var deselected = [];
        var found = false;
        for (var i in selected) {
            if (selected[i] == path) {
                found = true;
            } else {
                deselected.push(selected[i]);
                // TODO: Replace with observer
                SceneJS.withNode(selected[i]).set('baseColor', { r: 0.5, g: 1.0, b: 0.0 });
            }
        }
        
        this.notify({deselected : deselected});
        if (!found) {
            // TODO: Replace with observer
            SceneJS.withNode(path).set('baseColor', { r: 1.0, g: 1.0, b: 0.0 });
            this.notify({selected : [path]});
        }
        selected = [path];
    }
    
    this.deselectAll = function() {
        if (selected.length > 0) {
            for (var i in selected) {
                // TODO: Replace with observer
                SceneJS.withNode(selected[i]).set('baseColor', { r: 0.5, g: 1.0, b: 0.0 });
            }
            this.notify({deselected : selected});
            selected = [];
        }
    }

}
var selectionManager = new SelectionManager();
Observable.makeObservable(selectionManager);

// TODO: Action Validation
/*Interaction.addListener(function() {
    
    if (Interaction.selected.length == 1) {
        $('#action_stl').unbind('click');
        var pattern = /^\/geom\/(.*)$/;
        var id = Interaction.selected[0].match(pattern)[1];
        $('#action_stl').attr('href', '/stl/' + id); 
    } else {
        $('#action_stl').click(function() {
            alert("select one object"); 
            return false;
        });
    }
});*/



function ScenePicker(_selectionManager) {

    var selectionManager = _selectionManager;
    var picking = false;
    var pickHit = false;
    var shiftPicking = false;
    var picker = this;

    SceneJS.withNode("the-scene").bind("post-rendered",
                                       function(event) {
                                           picker.afterPick()
                                       });

    this.addPickable = function(path) {
        SceneJS.withNode(path).bind("picked",
                                    function(event) {
                                        picker.picked(path);
                                    });
    }
    
    this.beforePick = function() {
        picking = true;
        pickHit = false;
    }

    this.afterPick = function() {
        if (picking && !pickHit && !shiftPicking) {
            selectionManager.deselectAll();
        }
        picking = false;
        shiftPicking = false;
    }

    this.beforePick = function() {
        picking = true;
        pickHit = false;
    }

    this.picked = function(path) {
        pickHit = true;
        selectionManager.picked(path);
    }

}

var picker = new ScenePicker(selectionManager);
