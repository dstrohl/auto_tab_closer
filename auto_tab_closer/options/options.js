

const saved_options = [
    {
        name: "None",
        url: "",
        url_is_regex: false,
        url_test_mode: false,
        use_selector: false,
        jquery_selector: "",
        delay: 5,
        allow_cancel: true
    },
    {
        name: "Edge",
        url: "https://\\w*\\.vpn\\.f5\\.com/public/oauth_done.html",
        url_is_regex: true,
        url_test_mode: true,
        use_selector: false,
        jquery_selector: "",
        delay: 5,
        allow_cancel: true

    },
    {
        name: "Zoom",
        url: "https://\\.zoom.us/j/.*#success",
        url_is_regex: true,
        url_test_mode: true,
        use_selector: true,
        jquery_selector: "title:contains('Launch Meeting - Zoom')",
        delay: 5,
        allow_cancel: true

    }
]

const ATC_TEST_MODE = false;

const atc_test_data =[
    {
        name: "test1_is_regex",
        url: "test1",
        url_is_regex: false,
        url_test_mode: false,
        use_selector: false,
        jquery_selector: null,
        delay: 2,
        allow_cancel: true

    },
    {
        name: "test2_is_normal",
        url: "test2",
        url_is_regex: true,
        url_test_mode: false,
        use_selector: false,
        jquery_selector: "",
        delay: 3,
        allow_cancel: true,
    },
    {
        name: "test3_is_selector",
        url: "test3",
        url_is_regex: true,
        url_test_mode: false,
        use_selector: true,
        jquery_selector: "selector3",
        delay: 4,
        allow_cancel: true,

    },
    {
        name: "test4_is_delay_test_mode",
        url: "test4",
        url_is_regex: true,
        url_test_mode: true,
        use_selector: true,
        jquery_selector: "selector4",
        delay: 5,
        allow_cancel: true

    }
]

const config = {
    test_mode: false,
    enabled: true,
    urls: []
}


let url_regex = "^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$";
let current_item = -1;

function make_id(key, prefix) {
    let ret = 'atc'
    if (prefix === undefined) {
        ret = ret + prefix
    }
    ret = ret + key.toString();
    return ret
}

function make_id_class(key, prefix, other_classes) {
    let ret = 'class="' + make_id(key, prefix)
    if (other_classes !== undefined) {
        ret = ret + " " + other_classes
    }
    ret = ret + '"'
    return ret
}

let add_edit_box = $("#add_edit_box");

function atc_init() {
    console.log('Initializing ATC');
    console.log('setting onClicks');
    //add_edit_box = $("#add_edit_box");
    add_edit_box.hide();

    $('#updateButton').click(function() {
        update_item();
    });
    $('#add_saved').change(function() {
        edit_save();
    });
    $('#test_mode').change(function() {
        set_test_mode();
    });
    $('#btn_new_item').click(function() {
        add_edit_box.show();
    });

    console.log('Loading config information');
    load_config();
    console.log('Loading save dropdown');
    load_saves();
    console.log('ATC Initialized');
}

function set_test_mode() {
    config.test_mode = $('#test_mode').prop('checked');
    console.log('updating test mode to: ' + config.test_mode.toString());
    save_config();

}

function load_saves() {
    // load the select options for saved tab info.
    console.log('Loading the saves');
    let tmp_row = '';
    let load_save_options = $("#add_saved");
    saved_options.forEach(function(item, index) {
        console.log('Loading save number: '+ index.toString());
        tmp_row = '<option value="'+index.toString() +'">' + item.name + '</option>';
        console.log('    option text=' + tmp_row);
        load_save_options.append(tmp_row);
    });
}

function load_config() {
    // loading config from extensions data store
    if (ATC_TEST_MODE) {
        console.log("Loading dev config...");
        config.urls = atc_test_data;
        console.log("Loaded dev config");
        update_display();
    } else {
        console.log("Loading config...");
        chrome.storage.sync.get(config, function (result) {
            config.test_mode = result.test_mode;
            config.urls = result.urls;
            console.log("Loaded config (" + config.urls.length.toString() + " urls)");
            console.log(config);
            update_display();
        });

    }
}

function save_config() {
    // saving config to extensions data store
    if (ATC_TEST_MODE) {
        console.log("In dev mode, not saving config...");
    } else {
        console.log("Saving config...");
        chrome.storage.sync.set(config, function () {
            console.log("Saved config (" + config.urls.length.toString() + " urls)");
            console.log(config);
        });
    }
}

function update_item() {
    // clicking on the update button in the add/update box and saving to the table
    console.log('pushing record into table and saving it...')
    let url_error = $("#url_error");
    url_error.hide();
    let name_field = $("#item_name");
    let url_field = $("#item_url");
    let url_is_regex_field = $("#is_regex");
    let url_test_mode_field = $("#tab_test_mode");
    let jquery_selector_field = $("#item_selector");
    let delay_field = $("#delay_secs");
    let cancel_field = $("#delay_cancel");
    let tmp_rec = {
        name: name_field.val(),
        url: url_field.val(),
        url_is_regex: url_is_regex_field.prop('checked'),
        url_test_mode: url_test_mode_field.prop('checked'),
        use_selector: false,
        jquery_selector: jquery_selector_field.val(),
        delay: delay_field.val(),
        allow_cancel: cancel_field.prop('checked')
    };

    if (!tmp_rec.url_is_regex && !(url_regex.test(tmp_rec.url))) {
        url_field.show();
        return;
    }
    if (tmp_rec.jquery_selector !== "") {
        tmp_rec.use_selector = true;
    }

    if (current_item === -1) {
        config.urls.push(tmp_rec)
    } else {
        config.urls[current_item] = tmp_rec
    }
    current_item = -1;
    name_field.val("");
    url_field.val("");
    url_is_regex_field.prop('checked', false);
    url_test_mode_field.prop('checked', false);
    jquery_selector_field.val("");
    delay_field.val(5);
    cancel_field.prop('checked', true);
    add_edit_box.hide();
    update_display();
    save_config();
    $("#updateButton").text('Add');
    name_field.focus();
    console.log('Finished pushing rec');

}

function update_edit_box(data) {
    $("#item_name").val(data.name);
    $("#item_url").val(data.url);
    $("#is_regex").prop('checked', data.url_is_regex);
    $("#tab_test_mode").prop('checked', data.url_test_mode);
    $("#item_selector").val(data.selector);
    $("#delay_secs").val(data.delay);
    $("#delay_cancel").prop('checked', data.allow_cancel);
}

function edit_item(key) {
    // clicking on the "edit" button on a row, move data into the add/update box.
    console.log('Editing item: ' + key.toString());
    $("#updateButton").text("Update");
    current_item = key;
    let data = config.urls[current_item];
    console.log(data);
    add_edit_box.show();
    update_edit_box(data);

    // Change Update Button Text

}

function edit_save() {
    // changing the add default entry option.
    let save_str = $("#add_saved").val()
    console.log('Adding saved str: ' + save_str);
    let save_idx = parseInt(save_str);
    console.log('adding saved item ' + save_idx.toString());
    let data = saved_options[save_idx];
    if (save_idx === 0) {
        console.log('skipping adding the None field.')
    } else {
        console.log('adding object');
        console.log(data)
        update_edit_box(data);
        $("#updateButton").text("Add");
    }
}

function delete_item(key) {
    // clicking on the "del" button on a row
    console.log("Removing item key: " + key.toString())
    let removed_item = config.urls.splice(key, 1)
    console.log('Removed item ' + removed_item.name)
    console.log('New Config')
    update_display();
    save_config();
}


function build_table_row(key) {
    // creates the html for a data row
    /*
    examples:

    URL: foobar.com (regex) (TEST MODE)
        validated with jquery selector: "xxxx"
        delay 4 seconds before closing and allow cancel
     */
    let data = config.urls[key]
    console.log(config)
    console.log('Creating table row for key: ' + key.toString());
    console.log(data);

    let cfg_str = "<b>URL: " + data.url + "</b>";
    if (data.url_is_regex) {
        cfg_str = cfg_str + " (Regex)";
    }
    if (data.url_test_mode) {
        cfg_str = cfg_str + " [TEST MODE]";
    }
    if (data.use_selector) {
        cfg_str = cfg_str + '</br>Validated with:' + data.jquery_selector;
    }
    if (data.delay) {
        cfg_str = cfg_str + '</br>Delay for ' + data.delay.toString() + ' seconds before closing';
        if (data.allow_cancel) {
            cfg_str = cfg_str + ' and allow cancel';
        }
    }

    let ret =
        '<tr ' + make_id_class(key, 'row') + ' data-id="' + key.toString() + '">' +
            '<td class="edit_cell">' +
                "<button type='button' " +
                    "class='btn btn-default edit_btn' " +
                    "data-id='" + key.toString() + "' >" +
                    "<span class='glyphicon glyphicon-edit' />" +
                "</button>" +
            "</td>" +
            "<td class='name_cell'>" + data.name + "</td>" +
            "<td class='config_cell'>" + cfg_str + "</td>" +
            "<td class='delete_cell'>" +
                "<button type='button' " +
                    "class='btn btn-default delete_btn' " +
                    "data-id='" + key.toString() + "'>" +
                    "<span class='glyphicon glyphicon-remove' />" +
                "</button>" +
            "</td>" +
        "</tr>"

    return ret;

}


function update_display() {
    // updates the table to display the contents of the data object.
    let no_data_table_row = $(".no_tab_entries");
    let data_table = $("#tabTable");
    let data_table_body = $('#tabTable tbody');
    console.log('Updating the display');
    $('#test_mode').prop('checked', config.test_mode);

    if (config.urls.length) {
        console.log('updating the table with content');
        if (data_table_body.length === 0) {
            data_table.append("<tbody></tbody>");
            data_table_body = $('#tabTable tbody');
            console.log('Adding tbody');
        } else {
            data_table_body.empty();
            console.log('Clearing out the table');
        }

        // Append product to table
        config.urls.forEach(async function (tmp_data, index) {
            console.log('adding record ' + index.toString() + ' to table');
            let tmp_row = build_table_row(index);
            data_table_body.append(tmp_row);
        });
        $(".delete_btn").click(function(){
            let key = parseInt($(this).data('id'));
            delete_item(key);
        });
        $(".edit_btn").click(function(){
            add_edit_box.show();
            let key = parseInt($(this).data('id'));
            edit_item(key);
        });
        console.log('Showing the table and hiding the no data msg.')
        data_table.show();
        no_data_table_row.hide();
    } else {
        console.log('No data to create table with, hiding data table and showing the no data msg.')
        data_table.hide();
        no_data_table_row.show();
    }
}


$(document).ready(function(){
    $('.copy-btn').on("click", function(){
        value = $(this).data('clipboard-text'); //Upto this I am getting value

        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(value).select();
        document.execCommand("copy");
        $temp.remove();
    })
})


$('document').ready(function(){
    atc_init();
});

