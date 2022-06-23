function initUI(mapapi) {

    var editPt = null;
    var clickPt = null;

    //=============== TESTING ONLY
    $('#btn-load-points').click(function() { loadPoints(mapapi, 500); });
    $('#btn-load-rofs').click(function() { loadRoFs(mapapi, 100); });
    //=============== 

    $('#btn-parse-coord').click(function() {
        var coord = $('#input-parse-coord').val();
        var result = WFML.Location.parse(coord);
        var resultStr = 'Invalid';
        if (result) {
            resultStr = WFML.Location.format(result);
        }
        $('#parse-coord-result').text(resultStr);
    });

    $('#btn-map-redraw').click(function() {
        mapapi.map.redraw();
    });

    $('#btn-zoom-extent').click(function() {
        mapapi.navigation.zoom([-129, 49, -123, 51]);
    });

    $('#btn-tool-activate-select-point').click(function() {
        mapapi.tool.activate('selectPoint');
    });

    $('#btn-layer-show-none').click(function() {
        mapapi.layer.visible("*", false);
        layerTreeOff();
    });

    $('#btn-layer-show').click(function() {
        mapapi.layer.visible("landmark", true);
    });

    $('#btn-layer-hide').click(function() {
        mapapi.layer.visible("landmark", false);
    });
    $('#btn-layer-refresh').click(function() {
        mapapi.layer.redraw("landmark");
    });
    
    $('#btn-layer-show-incident').click(function() {
        mapapi.layer.visible('incident', true);
    });
    mapapi.layer.onChange('incident', function(lyr) {
        $('#layer-vis-incident').val( lyr.visible() );
    });



    //--------  Filtering  ------------
    $('.cb-filter').click(function() {
        var filters = [];
        $('.cb-filter').each(function(i, el) {
            if (el.id == 'cb-filter-centre' && el.checked) {
                filters.push({
                    name: "FIRE_CTR_ID",
                    values: toValues($('#text-filter-centre').val())
                });
            }
            if (el.id == 'cb-filter-zone' && el.checked) {
                filters.push({
                    name: "FIRE_ZONE_ID",
                    values: toValues($('#text-filter-zone').val())
                });
            }
            if (el.id == 'cb-filter-editable' && el.checked) {
                filters.push({
                    name: "EDITABLE_IND",
                    values: toValues($('#text-filter-editable').val())
                });
            }
            if (el.id == 'cb-filter-landmark-cat' && el.checked) {
                filters.push({
                    name: "LANDMARK_CATEGORY_CODE",
                    values: toValues($('#text-filter-landmark-cat').val())
                });
            }
            if (el.id == 'cb-filter-landmark-type' && el.checked) {
                filters.push({
                    name: "LANDMARK_TYPE_CODE",
                    values: toValues($('#text-filter-landmark-type').val())
                });
            }
            if (el.id == 'cb-filter-search' && el.checked) {
                filters.push({
                    name: "NAME,DESCRIPTION,LABEL",
                    like: $('#text-filter-search').val()
                });
            }

        });
        //mapapi.layer.filter( "landmark", filters);
        mapapi.primary.filter(filters);
    })
    $('#btn-layer-filter-ctr').click(function() {
        mapapi.layer.filter("landmark", [
            { name: "FIRE_CTR_ID", values: ["44", "7"] }
        ]);
    });
    $('#btn-layer-filter-ctr').click(function() {
        mapapi.layer.filter("landmark", [
            { name: "FIRE_CTR_ID", values: ["44", "7"] }
        ]);
    });
    $('#btn-layer-filter-clear').click(function() {
        mapapi.layer.filter("landmark");
    });

    //----------  Map Click handling & Hit detection
    $('#cb-click').click(function() {
        $('#click-loc').text('');
        $('#hover-loc').text('');
        if (this.checked) {
            mapapi.callback.click(onClick);
            mapapi.callback.hover(onHover, 500);
        } else {
            mapapi.callback.click();
            mapapi.callback.hover();
        }
    });

    function onClick(lonlat) {
        clickPt = lonlat;
        $('#click-loc').text(WFML.Location.format(lonlat));

        checkHit(lonlat);
    }
    function onHover(lonlat) {
        $('#hover-loc').text(WFML.Location.format(lonlat));
    }

    mapapi.callback.selectPoint( function ( point ) {
        $('#select-loc').text(WFML.Location.format(point));
    } );

    function checkHit(lonlat) {
        // test pixel distance API
        var distPix = "";
        if (lonlat && editPt) {
            distPix = mapapi.distance.pixels(lonlat, editPt);
        }
        var HIT_PIXELS = 5;
        var hitMsg = distPix < HIT_PIXELS ? "HIT!" : "";
        $('#click-dist').text(hitMsg + " " + Math.round(distPix) + " pixels");
    }

    // ----------------  Highlighting
    $('#edit-curr').hover(function() {
        mapapi.highlight.add(editPt);
    }, function() {
        mapapi.highlight.clear();
    });

    $('#click-loc').hover(function() {
        mapapi.highlight.add(clickPt);
    }, function() {
        mapapi.highlight.clear();
    });

    //---------  Editing  
    $('#btn-edit-new').click(function() {
        $("#edit-curr").text(" - , -");
        mapapi.edit.start(null, displayEdit);
    });
    $('#btn-edit-start').click(function() {
        if (!editPt) editPt = [-123.35, 48.45];
        displayEdit(editPt);
        mapapi.edit.start(editPt, displayEdit);
    });
    $('#btn-edit-stop').click(function() {
        mapapi.edit.stop();
        //editPt = null;
    });
    $('#btn-edit-zoom').click(function() {
        mapapi.navigation.zoom(editPt);
    });
    $('#input-location').on('input', function(e) {
        var s = $('#input-location').val();
        var result = WFML.Location.parse(s);
        var msg = "";
        if (s.length > 0 && !result) {
            msg = 'Invalid coordinate';
        }
        $('#location-msg').text(msg);
        displayEdit(result);
    });
}

function primarySet(key) {
    mapapi.primary.set(key);
    layerHideUED();
}

function layerHideUED() {
    mapapi.layer.visible('landmark', false);
    mapapi.layer.visible('aircheck', false);
    mapapi.layer.visible('rcmpradio', false);
    mapapi.layer.visible('surfacecheck', false);
}

function primaryClear() {
    mapapi.primary.set();
}

function primaryRedraw() {
    mapapi.primary.redraw();
}

function toValues(s) {
    return s.split(',');
}

function displayEdit(lonlat) {
    editPt = lonlat;
    $("#edit-curr").text(WFML.Location.format(lonlat));
}

function layerListUI(cwmMap) {
    var lyrs = cwmMap.layerMgr.listView();
    var $list = $("#layer-list");
    for (var i = 0; i < lyrs.length; i++) {
        layerItem(lyrs[i]).appendTo($list);
    }

    function layerItem(lyr) {
        var $div = $('<div>')
            .append($('<span>').text(lyr.title));
        var $cb = $('<input type=checkbox>')
            .prop('checked', lyr.isVisible())
            .click(function() {
                lyr.isVisible(this.checked);
            })
            .appendTo($div);
        return $div;
    }

}


function layerTreeUI(mapapi) {
    var tree = mapapi.layer.treeView();
    var $root = $("#layer-list");

    // skip root group for now
    createLayerGroup(tree, $root, 0);

    function createLayerGroup(grp, $parent, level) {
        var $top = $parent;
        if (grp.title) {
            $top = createItem(grp, level);
            $parent.append($top);
        }

        if (grp.child) {
            var $grp = $('<div>')
            for (var i = 0; i < grp.child.length; i++) {
                var $entry = createLayerGroup(grp.child[i], $grp, level + 1);
                //$top.append( $entry );
            }
            $parent.append($grp);
        }
    }

    function createItem(lyr, level) {
        var isFolder = lyr.isFolder();
        var $item = $('<div>')
            .addClass(isFolder ? "layer-folder" : "layer");
        if (isFolder) {
            $item.css('padding-left', (level - 1) * 20);
        }
        var $name = $('<span>').text(lyr.title);
        var $cb_border = $('<span>')
            .addClass("layer-cb");
        var $cb = $('<input type=checkbox>')
            .addClass("layer-cb-input")
            .click(function() {
                lyr.visible(this.checked);
            })
            .appendTo($cb_border);
        if (isFolder) {
            $item.append($cb_border).append($name);
        } else {
            var $info = $('<span class="layer-info-btn">').text("i")
                .click(function() {
                    $('#layer-list .layer-info-selected').removeClass('layer-info-selected');
                    $(this).addClass('layer-info-selected');
                    mapapi.layer.infoPopup(lyr.layer().getId());
                });
            $item.append($info)
                .append($cb_border)
                .append($name);
        }
        setItemState(lyr, $name, $cb_border, $cb);

        lyr.onChange(function() {
            setItemState(lyr, $name, $cb_border, $cb);
        })
        return $item;
    }

    function setItemState(lyr, $name, $border, $cb) {
        $cb.prop('checked', lyr.visible());
        if (lyr.isMixed()) {
            $border.addClass("layer-cb-mixed");
        } else {
            $border.removeClass("layer-cb-mixed");
        }

    }
}

function layerTreeOff() {
    $('.layer-cb').removeClass("layer-cb-mixed");
    $('.layer-cb-input').prop('checked', false);
}