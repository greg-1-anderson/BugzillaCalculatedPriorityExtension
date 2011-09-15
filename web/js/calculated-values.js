
// This is loosly based on the bugzilla js function showValueWhen from js/field.js
function showValueForCaculatedField(controlled_field_id, decisionMatrix_ids, controlled_value_ids, controller_row, controller_col )
{
    var controller_field_row = document.getElementById(controller_row);
    var controller_field_col = document.getElementById(controller_col);
    // We are called twice, once for each controller element; we will add the listener for
    // both controllers once both of them are defined.
    if (controller_field_row && controller_field_col) {
	// Note that we don't get an object for the controlled field here, 
	// because it might not yet exist in the DOM. We just pass along its id.
	YAHOO.util.Event.addListener(controller_field_row, 'change',
            handleCalculatedValControllerChange, [controlled_field_id, decisionMatrix_ids, controlled_value_ids, controller_row, controller_col ]);
	YAHOO.util.Event.addListener(controller_field_col, 'change',
            handleCalculatedValControllerChange, [controlled_field_id, decisionMatrix_ids, controlled_value_ids, controller_row, controller_col ]);
	// We should put this at the end of the page, in case the controlled field does not exist in the DOM yet
	bz_fireEvent(controller_field_col, 'change');
    }
}

// This is loosly based on the bugzilla js function showValueWhen from js/field.js
function showValueForProductField(controlled_field_id, decisionLimitList, controlled_value_ids, f1, f2, f3 )
{
    var field_f1 = document.getElementById(f1);
    var field_f2 = document.getElementById(f2);
    var field_f3 = document.getElementById(f3);
    // We are called once for each controller element; we will add the listener for
    // all controllers once all of them are defined.
    if (field_f1 && field_f2 && field_f3) {
	// Note that we don't get an object for the controlled field here,
	// because it might not yet exist in the DOM. We just pass along its id.
	YAHOO.util.Event.addListener(field_f1, 'change',
            handleProductValControllerChange, [controlled_field_id, decisionLimitList, controlled_value_ids, f1, f2, f3 ]);
	YAHOO.util.Event.addListener(field_f2, 'change',
            handleProductValControllerChange, [controlled_field_id, decisionLimitList, controlled_value_ids, f1, f2, f3 ]);
	YAHOO.util.Event.addListener(field_f3, 'change',
            handleProductValControllerChange, [controlled_field_id, decisionLimitList, controlled_value_ids, f1, f2, f3 ]);
	// We should put this at the end of the page, in case the controlled field does not exist in the DOM yet
	bz_fireEvent(field_f3, 'change');
    }
}

// Return the value of the SELECT controller as an integer.  If the values of
// the control is not a number, then we will use the selectedIndex instead.
// Exception: the non-deletable value --- will always return Number.NaN.
function getControllerNumericInputValue(controller) {
    var value = parseInt(controller.value);
    if ((isNaN(value)) && (controller.value != '---')) {
        value = controller.selectedIndex;
    }
    return value;
}

// This is loosely based on the bugzilla js function handleValControllerChange from js/field.js
function handleCalculatedValControllerChange(e, args) {
    var controlled_name = args[0];
    var controlled_field = document.getElementById(controlled_name);
    var decisionMatrix = args[1];
    var controlled_value_ids = args[2];
    var controller_row = document.getElementById(args[3]);
    var controller_col = document.getElementById(args[4]);

    var decisionValue = Number.NaN;
    var row = getControllerNumericInputValue(controller_row);
    var col = getControllerNumericInputValue(controller_col);
    if ((!isNaN(row)) && (!isNaN(col))) {
        decisionValue = decisionMatrix[row][col];
    }
     
    showHideCalculatedValField(controlled_field, controlled_value_ids, decisionValue);
}

// This is loosely based on the bugzilla js function handleValControllerChange from js/field.js
function handleProductValControllerChange(e, args) {
    var controlled_name = args[0];
    var controlled_field = document.getElementById(controlled_name);
    var decisionLimitList = args[1];
    var controlled_value_ids = args[2];
    
    var productResult = 1;
    var calculatable = true;
    
    for (var i = 3; i < args.length; ++i ) {
	var input_item = document.getElementById(args[i]);
	var value = getControllerNumericInputValue(input_item);
	if (isNaN(value)) {
            calculatable = false;
	}
	else {
            productResult = productResult * value;
	}
    }

    var decisionValue = Number.NaN;
    if (calculatable) {
	for (var i = 0; i < decisionLimitList.length; ++i) {
            if ((isNaN(decisionValue)) && (decisionLimitList[i] >= productResult)) {
	        decisionValue = i + 1;
	    }
	}
    }

    showHideCalculatedValField(controlled_field, controlled_value_ids, decisionValue);
}

function showHideCalculatedValField(controlled_field, controlled_value_ids, decisionValue) {
    var unselected = false;
    var changed = false;
    for (var i = 0; i < controlled_field.length; i++) {
        id = controlled_field.options[i].id;
        optionId = controlled_value_ids[i];
        if (id != 0) {
	    show = isNaN(decisionValue) || (decisionValue == (i+1));
	    var item = getPossiblyHiddenOption(controlled_field,
                                               optionId);
            if (!item.disabled && !show) {
        	YAHOO.util.Dom.addClass(item, 'bz_hidden_option');
        	if (item.selected) {
                    item.selected = false;
                    unselected = true;
                    changed = true;
        	}
        	item.disabled = true;
        	hideOptionInIE(item, controlled_field);
            }
        }
    }
    for (var i = 0; i < controlled_field.length; i++) {
        id = controlled_field.options[i].id;
        optionId = controlled_value_ids[i];
        if (id != 0) {
	    show = isNaN(decisionValue) || (decisionValue == (i+1));
	    var item = getPossiblyHiddenOption(controlled_field,
                                               optionId);
            if (item.disabled && show) {
        	item = showOptionInIE(item, controlled_field);
        	YAHOO.util.Dom.removeClass(item, 'bz_hidden_option');
        	item.disabled = false;
            }
            if (!item.disabled && unselected) {
                item.selected = true;
                unselected = false;
            }
        }
    }
    if (changed) {
        bz_fireEvent(controlled_field, 'change');
    }
}

