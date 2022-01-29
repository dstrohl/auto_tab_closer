import {dictGet} from "../scripts/common";
import {DelayFieldObj, EnabledFieldObj, NameFieldObj, SelectorFieldObj, URLFieldObj, TestModeFieldObj,
    AllTestModeFieldObj, AllEnabledFieldObj, ConfigFieldObj, $S} from "./fields";

"use strict";


class ATCUrlObj {
    name_field = new NameFieldObj()
    url_field = new URLFieldObj()
    selector_field = new SelectorFieldObj()
    delay_field = new DelayFieldObj()
    enabled_field = new EnabledFieldObj()
    test_mode_field = new TestModeFieldObj()

    fields = [
        this.name_field,
        this.url_field,
        this.selector_field,
        this.delay_field,
        this.enabled_field,
        this.test_mode_field,
    ]

    constructor(props) {
        if (props !== undefined) {
            this.update(props);
        }
    }

    get_page_val() {
        for (const f of this.fields) {
            f.get_page_val();
        }
    }

    set_page_val() {
        for (const f of this.fields) {
            f.set_page_val();
        }
    }

    clear() {
        for (const f of this.fields) {
            f.clear();
        }
    }

    clear_page_val() {
        for (const f of this.fields) {
            f.clear_page_val();
        }
    }


    update(props) {
        for (const f of this.fields) {
            f.get_val_from_obj(props);
        }
    }

    test_mode() {
        return this.test_mode_field.val || config.test_mode;
    }

    use_selector() {
        if (this.selector_field.val === '') {
            return false;
        } else {
            return true;
        }
    }

    delay_secs() {
        return this.delay_field.val + ' seconds';
    }

    msg_obj() {
        let msg_opt = {
            type: "basic",
            title: `Auto Close Tab${this.test_mode() ? " TEST": ""} `,
            message: `The ${this.name_field.val} tab${this.test_mode() ? "would": "will"} be closed`,
            iconUrl: '../icons/ATC_On_128.png'
        };

        if (this.delay_field.val) {
            msg_opt.message += 'in ' + this.delay_secs();
        }

        if (this.delay_field.allow_cancel) {
            msg_opt.buttons = [
                {title: 'Cancel'},
                {title: 'Close Now'}

            ];
        }
        return msg_opt;
    }

    short_info(id) {
        if (id === undefined) {
            id = '??';
        } else {
            id = id.toString();
        }
        let tmp_ret = `[${id}] ${this.name_field.val} --> `
        tmp_ret += this.url_field.is_regex ? "(R) ": "";
        tmp_ret += this.url_field.val;
        return tmp_ret
    }

    long_info() {
        let cfg_str = "<b>URL: " + this.url_field.val + "</b>";
        cfg_str += `${this.url_field.is_regex ? " (Regex)": ""}`;
        cfg_str += `${this.test_mode_field ? " [TEST MODE]": ""}`;

        if (this.use_selector()) {
            cfg_str += '</br>Validated with: "' + this.selector_field.val + '"';
        }
        if (this.delay_field.val) {
            cfg_str += '</br>Delay for ' + this.delay_secs() + ' before closing';
            cfg_str += `${this.delay_field.allow_cancel ? " and allow cancel": ""}`;
        }
        return cfg_str;
    }

    as_html(id) {
        id = id.toString();
        let ret =
            `<tr class="row_${id}" data-id="${id}">
                <td class="edit_cell">
                    <button type='button'
                        class='btn btn-default edit_btn'
                        data-id="${id}">
                        <i class="bi-pencil-square"></i>
                    </button>
                </td>
                <td class='name_cell'>${this.name_field.val}</td>
                <td class='config_cell'>${this.long_info()}</td>
                <td class='delete_cell'>
                    <button type='button'
                        class='btn btn-default delete_btn'
                        data-id="${id}">
                        <i class="bi-trash"></i>
                    </button>
                </td>
            </tr>
`
        return ret;
    }

    as_obj() {
        let obj = {};
        for (const f of this.fields) {
            obj = f.set_val_in_obj(obj);
        }
        return obj;
    }

    check_url(url) {
        console.debug('Checking against ' + this.short_info());
        console.debug('URL to check: ' + url);
        return this.url_field.check_url(url);
    }
}





const config = {
    current_index: -1,
    current_item: null,
    test_mode_field: new AllTestModeFieldObj(),
    enabled_field: new EnabledFieldObj(),
    loaded_default: false,
    urls: [],
    url_lookup: {},


    enabled: function() {
        return this.urls.length && this.enabled_field.val;
    },

    load_config: function() {
        // loads the config from the extension config data

    },

    save_config: function() {
        // saves the config to the extension config data

    },

    dump_config: function() {
        // dumps the config to the log for troubleshooting
        console.log('ATC Config Dump');
        console.log(`Test Mode: ${this.test_mode_field.val}`);
        console.log(`Loaded Defaults: ${this.loaded_default}`);
        console.log(`Enabled: ${this.enabled()}`);
        console.log(`${this.urls.length} URLS: `);
        for (const item of this.urls) {
            console.log(item)
            console.log(`   ${item.short_info()}`);
        }

    },

    as_obj: function() {
        let tmp_ret = {
            loaded_default: this.loaded_default,
            test_mode: this.test_mode_field.val,
            enabled: this.enabled_field.val,
            urls: [],
        }
        for (const u of this.urls) {
            tmp_ret.urls.push(u.as_obj());
        }
        return tmp_ret;
    },

    from_obj: function(obj, overwrite) {

        this.loaded_default = dictGet(obj, 'loaded_default', this.loaded_default);
        this.test_mode_field.get_val_from_obj(obj);
        this.enabled_field.get_val_from_obj(obj);

        if (overwrite) {
            this.urls.clear()
        } else {
            for (const u of obj.urls) {

                this.add_url(u);
            }

        }
        this.rebuild_names();



        $S.config_field.clear_error();
        let config_str = $S.config_field.val();
        if (config_str === '') {
            $S.config_field.set_error(false, 'You must provide a configuration json');
        }
        let config_obj = null
        try {
            config_obj = JSON.parse(config_str);
        } catch(e) {
            $S.config_field.set_error(false, 'Invalid JSON: ' + e.toString());
            return;
        }

        let validation = validate_urls(config_obj);

        if (validation.valid) {
            config.set_config(config_obj, overwrite);
            $S.config_box.hide();
            update_display();
            config.save();
        } else {
            $S.config_field.set_error(validation.error, validation.message);
        }




    },

    add_url: function(obj, overwrite) {
        overwrite = overwrite === undefined ? false : overwrite;
        let tmp_name = dictGet(obj, 'name', undefined);
        if (overwrite &&  tmp_name !== undefined && tmp_name in this.url_lookup) {
            console.log('Updating existing URL object')
            let tmp_url = this.urls[this.url_lookup[tmp_name]];
            tmp_url.update(obj);
        } else {
            console.log('Adding a new url')
            let tmp_url = new ATCUrlObj(obj);
            console.log(tmp_url);
            this.urls.push(tmp_url);
        }
        return tmp_url;
    },

    delete_item: function(index) {
        console.log("Removing item key: " + index.toString())
        let removed_item = config.urls.splice(index, 1)
        console.log('Removed item ' + removed_item.name)
        console.log('New Config')
        this.rebuild_names();
        this.save_config();
    },

    rebuild_names: function() {
        this.url_lookup = {}
        for (let i = 0; i < this.urls.length; i++) {
            let item = this.urls[i]
            this.url_lookup[item.name_field.val] = i
        }
    },

    // PAGE CONTROL METHODS

    // EDIT SECTION CONTROL METHODS

    get_data_from_page: function() {
        // sets the current object data from what is on the page
        // will create a new object if the current object is not set
        if (this.current_index === -1) {
            console.log('Adding a new url')
            let tmp_url = new ATCUrlObj({});
            tmp_url.get_page_val();
            console.log(tmp_url);
            this.urls.push(tmp_url);
            this.current_item = tmp_url;
            this.current_index = this.urls.length - 1;
            this.url_lookup[tmp_url.name_field.val] = this.current_index

        } else {
            this.current_item.get_page_val();

        }

    },

    set_data_on_page: function(index) {
        // sets the current object from the index.
        // sets the page values from the current object
        this.clear_page_data();
        this.current_index = index
        this.current_item = this.urls[index]
        this.current_item.set_page_val();
    },

    clear_page_data: function() {
        // clears the current page data without saving it.
        this.current_item.clear_page_val();
        this.current_item = null;
        this.current_index = -1
    },



    // EDIT CONFIG CONTROL METHODS

    get_config_from_page: function(overwrite) {
        this.config_field.get_page_val();
        if (!(this.config_field.has_error)) {
            this.from_obj(this.config_field.cfg_obj, overwrite);
            this.rebuild_names();
            this.save_config();
        }

    },

    set_config_on_page: function() {
        let tmp_ret = this.as_obj();
        this.config_field.set_config(tmp_ret);
        this.config_field.set_page_val();
    },

    clear_page_config: function() {
        this.config_field.clear_page_val();
    },


    // REFRESH URL_LIST AND OPTIONS

    change_test_mode: function() {
        this.test_mode_field.get_page_val();
        this.save_config();
    },

    change_enabled: function() {
        this.enabled_field.get_page_val();
        this.save_config();
    },

    as_html: function(){
        let tmp_ret = "<tbody>";
        this.urls.forEach(function (tmp_data, index) {
            console.log('adding record ' + index.toString() + ' to table');
            tmp_ret += tmp_data.as_html(index);
        });
        tmp_ret += '</tbody>';
        return tmp_ret;

    },

    refresh_page: function() {
        this.test_mode_field.set_page_val();
        this.enabled_field.set_page_val();

        let no_data_table_row = $(".no_tab_entries");
        let data_table = $("#tabTable");
        data_table.empty();
        console.log('Updating the display');

        if (config.urls.length) {
            console.log('updating the table with content');
            // Append product to table
            data_table.append(config.as_html())

            $(".delete_btn").click(function(){
                let key = parseInt($(this).data('id'));
                delete_item(key);
            });
            $(".edit_btn").click(function(){
                $S.add_edit_box.show();
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







    add_urls: function(urls) {
        console.log('Adding URLS')
        for (const item of urls) {
            this.add_url(item);
        }
    },
    set_cfg_item(obj, prop, my_prop) {
        my_prop = my_prop === undefined ? prop : my_prop;
        let tmp_val = obj[my_prop];
        tmp_val = tmp_val === undefined ? this[my_prop] : tmp_val;
        return tmp_val
    },
    set_config: function(cfg, clear_first) {
        clear_first = clear_first === undefined ? false : clear_first;
        if (clear_first) {
            console.log('Clearing Configuration before setting new config')
            this.urls = []
        }
        console.log('setting new config')
        console.log(cfg)
        this.test_mode = this.set_cfg_item(cfg, 'test_mode');
        this._enabled = this.set_cfg_item(cfg, 'enabled', '_enabled');
        this.loaded_default = this.set_cfg_item(cfg, 'loaded_default');
        if (cfg.urls !== undefined) {
            this.add_urls(cfg.urls);
        }
        console.log('Config set.')
        this.dump_config();
    },

    load: function(callback) {




        let loadButton = document.createElement('button');
        loadButton.innerText = 'Load images';
        loadButton.addEventListener('click', handleLoadRequest);

        document.querySelector('body').append(loadButton);

        function handleLoadRequest() {
            for (let id of imageIds) {
                let element = document.getElementById(id);
                element.src = chrome.runtime.getURL(`${id}.png`);
            }
        }









        if (ATC_TEST_MODE) {
            console.log("Loading dev config...");
            this.add_urls(atc_test_data);
            console.log("Loaded dev config");
        } else {
            console.log("Loading config...");

            let that = this;
            chrome.storage.sync.get(null, function (result) {
                that.set_config(result);
                if (!(that.loaded_default)) {
                    console.log('Loading config defaults');
                    that.set_config(default_options);
                    that.loaded_default = true;
                } else {
                    console.log('Config defaults already loaded');
                }

                if (callback !== undefined) {
                    callback();
                }
            });

        }
    },


    save: function() {
        if (ATC_TEST_MODE) {
            console.log("In dev mode, not saving config...");
        } else {
            console.log("Saving config...");
            const config = this.as_obj();
            chrome.storage.sync.set(config, function () {
                console.log("Saved config (" + config.urls.length.toString() + " urls)");
                console.log(config);
            });
        }

    },


}


/*

function validate_url_data(props) {
    // name must exist
    // url must exist
    // if url type is regex, make regex obj
    // else, url must match url regex
    // if test_url, check against regex
    // if selector, check to make sure it works.
    // if cancel, check for delay
    // returns object like
    // {
    //  valid: false,
    //  name: {valid: false, message: 'this is a bad name'},
    //  ...
    // }

    let tmp_ret = {
        valid: true,
        name: {valid: true, message: ''},
        url: {valid: true, message: ''},
        jquery_selector: {valid: true, message: ''},
        url_is_regex: {valid: true, message: ''},
        delay: {valid: true, message: ''}
    }
    let name = dictGet(props, 'name', "");
    let url_is_regex = dictGet(props, 'url_is_regex', false);
    let url_regex_test_url = dictGet(props, 'url_regex_test_url', "");
    let url = dictGet(props, 'url', "");
    let jquery_selector = dictGet(props, 'jquery_selector', "");
    let delay = dictGet(props, 'delay', 5);
    let allow_cancel = dictGet(props, 'allow_cancel', true);

    if (name === "") {
        tmp_ret.valid = false;
        tmp_ret.name.valid = false;
        tmp_ret.name.message = 'Name is a required field.';
    }

    if (url === "") {
        tmp_ret.valid = false;
        tmp_ret.url.valid = false;
        tmp_ret.url.message = 'URL is a required field.';
    } else {
        if (url_is_regex) {
            let url_re_error = false;
            let url_re = ''
            try {
                url_re = RegExp(url);
            } catch(e) {
                url_re_error = true;
                tmp_ret.valid = false;
                tmp_ret.url.valid = false;
                tmp_ret.url.message = 'Invalid regex pattern.'
            }
            if (!(url_re_error) && url_regex_test_url !== '') {
                if (!(url_re.test(url_regex_test_url))) {
                    tmp_ret.valid = false;
                    tmp_ret.url.valid = false;
                    tmp_ret.url.message = 'URL regex does not match test string';
                }
            }
        } else {
            if (!(url_regex.test(url))) {
                tmp_ret.valid = false;
                tmp_ret.url.valid = false;
                tmp_ret.url.message = 'URL does not look like a valid url';
            }

        }
    }

    if (jquery_selector !== '') {
        try {
            let test_element = $(jquery_selector);
        } catch(e) {
            tmp_ret.valid = false;
            tmp_ret.jquery_selector.valid = false;
            tmp_ret.jquery_selector.message = 'Selector does not appear to work: ' + e.toString();
        }
    }

    if (delay === 0 && allow_cancel) {
        tmp_ret.valid = false;
        tmp_ret.delay.valid = false;
        tmp_ret.delay.message = 'Delay must be larger than 0 to allow cancel.';

    }

    return tmp_ret;


}

*/

function atc_init() {
    console.log('Initializing ATC');
    console.log('setting onClicks');
    $S.init_all();

    $S.add_edit_box.hide();
    $S.config_box.hide();

    $('#updateButton').click(function() {
        update_item();
    });

    $('#btn_show_config').click(function() {
        $S.add_edit_box.hide();
        show_config();
    });
    $('#test_mode').change(function() {
        set_test_mode();
    });
    $('#btn_new_item').click(function() {
        $S.config_box.hide();
        $S.add_edit_box.show();
    });

    $('#save_config').click(function() {
        save_new_config();
    });

    $('#append_config').click(function() {
        save_update_config();
    });

    $('#copy_to_clipboard').click(function() {
        copy_config_to_clipboard();
    });

    $('#cancel_config').click(function() {
        $S.config_field.clear();
        $S.config_box.hide();
    });

    $('#cancel_add').click(function() {
        clear_info(true);
        $S.add_edit_box.hide();
    });


    console.log('Loading config information');
    config.load(update_display);
    console.log('ATC Initialized');
}

function set_test_mode() {
    // on click of test mode checkbox, change the config.test_mode value
    config.test_mode = $('#test_mode').prop('checked');
    console.log('updating test mode to: ' + config.test_mode.toString());
    config.save();

}

/*

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
*/
/*

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
*/

function clear_info(clear_data) {

    $('.invalid-feedback').text('');
    $('.form-control').removeClass('is-invalid');

    if (clear_data) {
        current_item = -1;
        $S.name_field.clear_val();
        $S.url_field.clear_val();
        $S.is_regex_field.clear_val();
        $S.tab_test_mode_field.clear_val();
        $S.delay_sec_field.clear_val();
        $S.delay_cancel_field.clear_val();
        $S.item_selector_field.clear_val();
        $S.item_url_test_url_field.clear_val();
    }


}

/*
const ATC_selectors = {
    name_field: 'item_name',
    url_field: 'item_url',

}

const ATC_jq = {}


function $S(sel, clear) {
    if (clear !== undefined && clear) {
        ATC_jq.delete(sel);
    }
    if (sel in ATC_jq) {
        return ATC_jq[sel];
    }
    if (sel in ATC_selectors) {
        sel = ATC_selectors[sel];
    }
    if (!(sel.startsWith('.') || sel.startsWith('#'))) {
        sel = "#" + sel;
    }
    let tmp_sel = $(sel);
    if (tmp_sel.length) {
        ATC_jq[sel] = tmp_sel;
    }
    return tmp_sel
}
*/


function update_item() {
    // clicking on the update button in the add/update box and saving to the table
    console.log('pushing record into table and saving it...')
    clear_info(false);
    //let name_field = $("#item_name");
    // let url_field = $("#item_url");
    //let url_is_regex_field = $("#is_regex");
    //let url_test_mode_field = $("#tab_test_mode");
    //let jquery_selector_field = $("#item_selector");
    //let delay_field = $("#delay_secs");
    //let cancel_field = $("#delay_cancel");
    //let url_regex_test_url_field = $("#item_url_test_url")
    let tmp_rec = {
        name: $S.name_field.val(),
        url: $S.url_field.val(),
        url_is_regex: $S.is_regex_field.val(),
        url_test_mode: $S.tab_test_mode_field.val(),
        jquery_selector: $S.item_selector_field.val(),
        delay: $S.delay_sec_field.val(),
        allow_cancel: $S.delay_cancel_field.val(),
        url_regex_test_url: $S.item_url_test_url_field.val()
    };

    let validation = validate_url_data(tmp_rec)

    if (!(validation.valid)) {
        console.error('Invalid URL data');
        console.error(validation);
        $S.name_field.set_error(validation.name.valid, validation.name.message);
        $S.url_field.set_error(validation.url.valid, validation.url.message);
        $S.item_selector_field.set_error(validation.jquery_selector.valid, validation.jquery_selector.message);
        $S.delay_sec_field.set_error(validation.delay.valid, validation.delay.message);

    } else {
        config.add_url(tmp_rec, current_item)

        current_item = -1;
        clear_info(true);
        $S.add_edit_box.hide();
        update_display();
        config.save();
        $("#updateButton").text('Add');
        $S.name_field.obj.focus();
        console.log('Finished pushing rec');

    }


}

function update_edit_box(data) {
    // update the onscreen edit box with data values.
    $S.name_field.val(data.name);
    $S.url_field.val(data.url);
    $S.is_regex_field.val(data.url_is_regex);
    $S.tab_test_mode_field.val(data.url_test_mode);
    $S.delay_sec_field.val(data.delay);
    $S.delay_cancel_field.val(data.allow_cancel);
    $S.item_selector_field.val(data.selector);
    $S.item_url_test_url_field.val(data.url_regex_test_url);
}

function edit_item(key) {
    // clicking on the "edit" button on a row, move data into the add/update box.
    console.log('Editing item: ' + key.toString());
    $("#updateButton").text("Update");
    current_item = key;
    let data = config.urls[current_item];
    console.log(data);
    $S.add_edit_box.show();
    update_edit_box(data);

    // Change Update Button Text

}
/*

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
*/

function delete_item(key) {
    // clicking on the "del" button on a row
    console.log("Removing item key: " + key.toString())
    let removed_item = config.urls.splice(key, 1)
    console.log('Removed item ' + removed_item.name)
    console.log('New Config')
    update_display();
    config.save();
}

/*

function build_table_row(key) {
    // creates the html for a data row
    /!*
    examples:

    URL: foobar.com (regex) (TEST MODE)
        validated with jquery selector: "xxxx"
        delay 4 seconds before closing and allow cancel
     *!/
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

*/
/*

function update_display() {
    // updates the table to display the contents of the data object.
    let no_data_table_row = $(".no_tab_entries");
    let data_table = $("#tabTable");
    data_table.empty();
    console.log('Updating the display');
    $('#test_mode').prop('checked', config.test_mode);

    if (config.urls.length) {
        console.log('updating the table with content');
        // Append product to table
        data_table.append(config.as_html())

        $(".delete_btn").click(function(){
            let key = parseInt($(this).data('id'));
            delete_item(key);
        });
        $(".edit_btn").click(function(){
            $S.add_edit_box.show();
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

*/

function show_config() {
    $S.config_field.clear();
    $S.config_field.val(config.as_json());
    $S.config_box.show();
}


function save_new_config() {
    save_json_to_config(true);
}

function save_update_config() {
    save_json_to_config(false);
}

function validate_urls(data) {
    let tmp_ret = {
        valid: true,
        message: ''
    }
    if ('urls' in data) {
        console.log('validating url list');
        let tmp_validate = null;
        data.urls.forEach(function (tmp_data, index) {
            console.log('checking record ' + index.toString());
            tmp_validate = validate_url_data(tmp_data);
            if (tmp_validate.valid) {
                console.log(`rec #${index} is valid`);
            } else {
                tmp_ret.valid = false;
                tmp_ret.message += `URL ${index} is invalid:`;
                for (const [key, value] of Object.entries(tmp_validate)) {
                    if (key !== 'valid' && !(value.valid)) {
                        tmp_ret.message += `</br>&emsp;&emsp;${key} error: ${value.message}`
                    }
                }

            }
        });

    }
    return tmp_ret;
}

function save_json_to_config(overwrite) {
    overwrite = overwrite === undefined ? false : overwrite;
    $S.config_field.clear_error();
    let config_str = $S.config_field.val();
    if (config_str === '') {
        $S.config_field.set_error(false, 'You must provide a configuration json');
    }
    let config_obj = null
    try {
        config_obj = JSON.parse(config_str);
    } catch(e) {
        $S.config_field.set_error(false, 'Invalid JSON: ' + e.toString());
        return;
    }

    let validation = validate_urls(config_obj);

    if (validation.valid) {
        config.set_config(config_obj, overwrite);
        $S.config_box.hide();
        update_display();
        config.save();
    } else {
        $S.config_field.set_error(validation.error, validation.message);
    }
}

function copy_config_to_clipboard() {
    let copyText = document.getElementById("config_field");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);

}


$('document').ready(function(){
    atc_init();
    //$('#enter_test_data').on('shown.bs.modal', function () {
    //    $('#myInput').trigger('focus')
    //})
});


