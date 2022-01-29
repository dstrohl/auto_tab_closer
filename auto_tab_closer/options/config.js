import {dictGet, split_str, url_regex} from "../scripts/common.js";
import {jqBoolFieldObj, jqBoxObj, jqFieldObj, jqIntFieldObj, jqModal} from "../scripts/jq_helper.js";
import {make_config_error_ul, url_as_html} from "./make_html.js";

"use strict"

const $emsp4 = '&emsp;&emsp;&emsp;&emsp;';



class ATCUrlObj {

    url_enabled = true
    url_test_mode = false

    name = ''
    name_error_text = ''

    url = ''
    url_is_regex = false
    url_re_obj = null
    url_error_text = ''

    good_url_test = ''
    good_url_test_list = []
    good_url_test_error_text = ''
    
    bad_url_test = ''
    bad_url_test_list = []
    bad_url_test_error_text = ''
    
    selector = ''
    selector_error_text = ''
    selector_test = ''

    delay = 5
    allow_cancel = true
    delay_error_text = ''

    has_error = false
    error_list = []
    has_selector = false
    url_has_test = false
    selector_has_test = false

    constructor(props) {
        if (props !== undefined) {
            this.from_obj(props);
        }
    }

    clear_errors() {
        this.has_error = false
        this.error_list = []
        this.name_error_text = ''
        this.url_error_text = ''
        this.bad_url_test_error_text = ''
        this.good_url_test_error_text = ''
        this.selector_error_text = ''
        this.delay_error_text = ''
    }

    error_text(indent, sep) {
        indent = indent === undefined ? '' : indent;
        let tmp_ret = []
        if (this.name_error_text) {
            tmp_ret.push(`${indent}${this.name_error_text}`);
        }
        if (this.url_error_text) {
            tmp_ret.push(`${indent}${this.url_error_text}`);
        }
        if (this.good_url_test_error_text) {
            tmp_ret.push(`${indent}${this.good_url_test_error_text}`);
        }
        if (this.bad_url_test_error_text) {
            tmp_ret.push(`${indent}${this.bad_url_test_error_text}`);
        }

        if (this.selector_error_text) {
            tmp_ret.push(`${indent}${this.selector_error_text}`);
        }
        if (this.delay_error_text) {
            tmp_ret.push(`${indent}${this.delay_error_text}`);
        }

        if (sep === undefined) {
            return tmp_ret
        }
        tmp_ret = tmp_ret.join(sep);
        return tmp_ret;
    }

    set_error(my_field, error_text) {
        console.error(`${this.name} found error in "${my_field}":  ${error_text}`)
        my_field += '_error_text'
        this[my_field] = error_text
        this.has_error = true
        this.error_list.push(error_text)
    }

    validate(skip_disable) {
        this.clear_errors()

        this.has_selector = this.selector !== ''
        this.selector_has_test = this.selector_test !== ''
        this.url_has_test = this.bad_url_test || this.good_url_test

        skip_disable = skip_disable === undefined ? false : skip_disable;

        // check name
        if (this.name === '') {
            this.set_error('name', 'Name is a required field.');
        }
        // check url + url tests
        if (this.url === '') {
            this.set_error('url', 'URL is a required field.')
        } else {
            let good_test_errors = []
            let bad_test_errors = []

            if (this.url_is_regex) {
                try {
                    this.url_re_obj = RegExp(this.url);
                } catch(e) {
                    this.set_error('url', 'Invalid regex pattern')
                }
            } else {
                this.url_re_obj = null;
                if (!(url_regex.test(this.url))) {
                    this.set_error('url', 'Invalid URL')
                }
            }
            
            if (!(this.url_error_text)) {
                if (this.good_url_test !== '') {
                    this.good_url_test_list = split_str(this.good_url_test);
                    for (const test_item of this.good_url_test_list) {
                        if (!(this.check_url(test_item))) {
                            if (this.url_error_text === '') {
                                this.set_error('url', 'One or more of the url test matches failed')
                            }
                            good_test_errors.push('url pattern did not match: ' + test_item);
                        }
                    }
                    if (good_test_errors.length) {
                        this.set_error('good_url_test', good_test_errors.join('</br>'));
                    }
                }

                if (this.bad_url_test !== '') {
                    this.bad_url_test_list = split_str(this.bad_url_test);
                    for (const test_item of this.bad_url_test_list) {
                        if (this.check_url(test_item)) {
                            if (this.url_error_text === '') {
                                this.set_error('url', 'One or more of the url test matches failed')
                            }
                            bad_test_errors.push('url pattern matched incorrectly: ' + test_item);
                        }
                    }
                    if (bad_test_errors.length) {
                        this.set_error('bad_url_test', bad_test_errors.join('</br>'));
                    }
                }


            }

        }

        // check selector
        if (this.selector_test !== '') {
            try {
                let test_ret = $('<div>' + this.selector_test + '</div>').find(this.selector);
                if (!(test_ret.length)) {
                    this.set_error('selector', 'Selector was not found in the test html')
                }
            } catch(e) {
                this.set_error('selector', 'Selector format error: ' + e.toString())
            }
        }


        // check delay
        if (this.delay === 0 && this.allow_cancel) {
            this.set_error('delay', 'Cannot allow cancel if delay is 0 seconds.')
        }
        if (this.has_error && !(skip_disable)) {
            this.url_enabled = false;
        }
        
    }
    
    
    from_obj(obj, skip_disable) {
        this.url_enabled = dictGet(obj, 'url_enabled', this.url_enabled);
        this.url_test_mode = dictGet(obj, 'url_test_mode', this.url_test_mode);
        this.name = dictGet(obj, 'name', this.name);
        this.url = dictGet(obj, 'url', this.url);
        this.url_is_regex = dictGet(obj, 'url_is_regex', this.url_is_regex);
        this.good_url_test = dictGet(obj, 'good_url_test', this.good_url_test);
        this.bad_url_test = dictGet(obj, 'bad_url_test', this.bad_url_test);
        this.selector = dictGet(obj, 'selector', this.selector);
        this.selector_test = dictGet(obj, 'selector_test', this.selector_test);
        this.delay = dictGet(obj, 'delay', this.delay);
        this.allow_cancel = dictGet(obj, 'allow_cancel', this.allow_cancel);

        this.validate(skip_disable);

    }

    delay_secs() {
        return this.delay.toString() + ' seconds';
    }

    short_info(id) {
        let tmp_ret = ''
        if (id !== undefined) {
            tmp_ret += `[${id.toString()}]`;
        }
        tmp_ret += ` ${this.name} --> `
        tmp_ret += this.url_is_regex ? "(R) ": "";
        tmp_ret += this.url;
        if (this.has_error) {
            tmp_ret += ' [!]'
        }
        if (!(this.url_enabled)) {
            tmp_ret += ' [*]'
        }
        return tmp_ret
    }

    as_obj() {
        return {
            "url_enabled": this.url_enabled,
            "name": this.name,
            "url": this.url,
            "good_url_test": this.good_url_test,
            "bad_url_test":this.bad_url_test,
            "selector_test": this.selector_test,
            "url_is_regex": this.url_is_regex,
            "url_test_mode": this.url_test_mode,
            "selector": this.selector,
            "delay": this.delay,
            "allow_cancel": this.allow_cancel
        };

    }

    check_url(url) {
        console.debug('Checking against ' + this.short_info());
        console.debug('URL to check: ' + url);
        if (this.url_is_regex) {
            return this.url_re_obj.test(url);
        } else {
            return this.url === url;
        }
    }
}

function load_defaults() {
}

function load_live(save_cfg) {
}


class ATCConfig {
    _enabled = true
    test_mode = false
    urls = []
    url_lookup = {}
    json_error = false
    json_error_text = ''
    loaded_default = false


    constructor(props) {
        if (props !== undefined) {
            this.from_obj(props);
        }
    }

    get enabled() {
        return this._enabled || this.urls.length;
    }

    get has_error() {
        if (this.json_error) {
            return true
        } else {
            for (const item of this.urls) {
                if (item.has_error) {
                    return true;
                }
            }
        }
        return false
    }

    error_text(sep) {
        sep = sep === undefined ? '</br>' : sep
        let tmp_ret = []
        if (this.json_error) {
            tmp_ret.push(this.json_error_text);
            let indent = $emsp4;
        } else {
            let indent = '';
        }
        for (const item of this.urls) {
            if (item.has_error()) {
                tmp_ret.push(item.error_text(indent, sep))
            }
        }

        tmp_ret = tmp_ret.join(sep);
        return tmp_ret;

    }

    dump() {
        // dumps the config to the log for troubleshooting
        console.log('ATC Config Dump');
        console.log(`Test Mode: ${this.test_mode}`);
        console.log(`Loaded Defaults: ${this.loaded_default}`);
        console.log(`Enabled: ${this.enabled}`);
        console.log(`${this.urls.length} URLS: `);
        for (const item of this.urls) {
            console.log(item)
            console.log(`   ${item.short_info()}`);
        }
        if (this.has_error) {
            console.log(this.error_text('\n'));
        }

    }

    as_obj() {
        let tmp_ret = {
            loaded_default: this.loaded_default,
            test_mode: this.test_mode,
            enabled: this._enabled,
            urls: [],
        }
        for (const u of this.urls) {
            tmp_ret.urls.push(u.as_obj());
        }
        return tmp_ret;

    }

    from_obj(obj, overwrite) {
        console.log('Loading from object');
        console.log(obj);
        overwrite = overwrite === undefined ? true : overwrite;
        this.loaded_default = dictGet(obj, 'loaded_default', this.loaded_default);
        this.test_mode = dictGet(obj, 'test_mode', this.test_mode);
        this._enabled = dictGet(obj, 'enabled', this._enabled);

        if (overwrite) {
            this.urls = [];
            this.url_lookup = {};
        }

        for (const u of obj.urls) {
            this.add_url(u);
        }
        this.rebuild_names();

    }

    save_config() {
        console.log("Saving config...");
        try {
            chrome.storage.sync.set(config.as_obj(), function () {
                console.log("Saved config (" + config.urls.length.toString() + " urls)");
                console.log(config);
            });

        } catch (e) {
            localStorage.setItem('config', config.as_json());
            console.log('Saved to local storage')
        }
    }

    load_defaults() {
        console.log('Loading defaults');
        fetch('../defaults.json')
            .then(response => {
                if (response.ok) {
                    console.log('Response OK: ' + response.statusText);
                    return response.json();
                } else {
                    console.log('Error reading data, file: ' + load_from)
                    console.log(response.status);
                    console.log(response.statusText);
                    throw new Error('Error reading file.');
                }
            }).then(response_json => {
                config.from_obj(response_json, false);
                config.loaded_default = true;
                console.log('loaded default config.')
                MainScreenHandler.update_display();
            });

    }
    post_load_config() {
        console.log('Loaded Config, checking for defaults load')
        if (this.loaded_default) {
            console.log('No defaults needed.')
            MainScreenHandler.update_display();
        } else {
            console.log('Need Defaults, trying now.,,')
            this.load_defaults();
        }

    }

    load_config() {

        console.log('Loading live data');
        let that = this
        try {
            console.log('trying sync')
            chrome.storage.sync.get(null, function (result) {
                console.log('loaded from sync')
                config.from_obj(result, true);
                config.post_load_config();
            });

        } catch (e) {
            console.log('trying local storage')
            let tmp_cfg = JSON.parse(localStorage.getItem('config'))
            config.from_obj(tmp_cfg, true);
            config.post_load_config();
        }

    }

    as_json() {
        let tmp_obj = this.as_obj();
        return JSON.stringify(tmp_obj, null, 4);
    }

    from_json(config_str, overwrite) {
        this.json_error = false
        this.json_error_text = ''

        if (config_str === '') {
            this.json_error_text = 'You must provide a configuration json';
            this.json_error = true;
            return;
        }
        try {
            let config_obj = JSON.parse(config_str);
            this.from_obj(config_obj, overwrite);
        } catch(e) {
            this.json_error_text = 'Invalid JSON: ' + e.toString();
            this.json_error = true;
        }
    }

    add_url(obj) {
        let tmp_name = dictGet(obj, 'name', undefined);
        let tmp_url = null;
        if (tmp_name !== undefined && tmp_name in this.url_lookup) {
            console.log('Updating existing URL object')
            tmp_url = this.urls[this.url_lookup[tmp_name]];
            tmp_url.from_obj(obj);
        } else {
            console.log('Adding a new url')
            tmp_url = new ATCUrlObj(obj);
            console.log(tmp_url);
            this.urls.push(tmp_url);
        }
        return tmp_url;

    }
    rebuild_names() {
        this.url_lookup = {}
        for (let i = 0; i < this.urls.length; i++) {
            let item = this.urls[i]
            this.url_lookup[item.name] = i
        }

    }

    remove_url(index) {
        console.log("Removing item key: " + index.toString())
        let removed_item = config.urls.splice(index, 1)
        console.log('Removed item ' + removed_item.name)
        this.rebuild_names();
        this.save_config();
    }



}


const config = new ATCConfig();


const MainScreenHandler = {
    test_mode_field: new jqBoolFieldObj('test_mode'),
    enabled_field: new jqBoolFieldObj('enabled'),

    init: function() {
        this.test_mode_field.init();
        this.enabled_field.init();
        ConfigScreenHandler.init();
        EditScreenHandler.init();
    },

    set_enabled: function() {
        this.enabled = this.enabled_field.val
        config.save_config();
    },

    set_test_mode: function() {
        this.test_mode = this.test_mode_field.val
        config.save_config();
    },

    update_display: function() {
        this.test_mode_field.val = config.test_mode
        this.enabled_field.val = config._enabled

        let no_data_table_row = $(".no_tab_entries");
        let data_table = $("#tabTable");
        data_table.empty();
        console.log('Updating the display');

        if (config.urls.length) {
            console.log('updating the table with content');
            // Append product to table
            let tmp_ret = "<tbody>";
            let that = this;
            config.urls.forEach(function (tmp_data, index) {
                console.log('adding record ' + index.toString() + ' to table');
                tmp_ret += url_as_html(index, tmp_data);
            });
            tmp_ret += '</tbody>';

            data_table.append(tmp_ret)
            refresh_buttons();
            console.log('Showing the table and hiding the no data msg.')
            data_table.show();
            no_data_table_row.hide();
        } else {
            console.log('No data to create table with, hiding data table and showing the no data msg.')
            data_table.hide();
            no_data_table_row.show();
        }

    }

}


function refresh_buttons() {
    $(".delete_btn").click(function(){
        let key = parseInt($(this).data('id'));
        config.remove_url(key);
        MainScreenHandler.update_display();
    });
    $(".edit_btn").click(function(){
        let key = parseInt($(this).data('id'));
        let tmp_config = config.urls[key]
        EditScreenHandler.load_from_config(tmp_config, key);
    });
    $('[data-toggle="popover"]').popover()


}


const EditScreenHandler = {
    current_item: null,
    current_index: -1,


    my_box: new jqModal('add_edit_modal'),
    error_popup: new jqBoxObj('edit_error_notice'),

    url_field: new jqFieldObj('url'),
    name_field: new jqFieldObj("name"),
    is_regex_field: new jqBoolFieldObj('url_is_regex'),
    tab_test_mode_field: new jqBoolFieldObj('url_test_mode'),
    delay_sec_field: new jqIntFieldObj('delay'),
    delay_cancel_field: new jqBoolFieldObj('allow_cancel'),
    item_selector_field: new jqFieldObj('selector'),
    tab_enabled_field: new jqBoolFieldObj('url_enabled', true),

    good_url_test: new jqFieldObj('good_url_test'),
    bad_url_test: new jqFieldObj('bad_url_test'),
    selector_test: new jqFieldObj('selector_test'),

    init: function() {
        this.fields = [
            this.url_field,
            this.name_field,
            this.is_regex_field,
            this.tab_test_mode_field,
            this.delay_sec_field,
            this.delay_cancel_field,
            this.item_selector_field,
            this.tab_enabled_field,
            this.good_url_test,
            this.bad_url_test,
            this.selector_test
        ]
        this.my_box.init();
        this.error_popup.init();
        for (const f of this.fields) {
            f.init();
        }
        this.clear()
    },
    show_empty: function() {
        this.clear();
        this.my_box.show();

    },

    load_from_config: function(obj, index) {
        this.current_item = obj;
        this.current_index = index;
        this.refresh_from_obj(obj);
        this.my_box.show();

    },

    refresh_from_obj: function(obj) {
        obj = obj === undefined ? this.current_item: obj;

        for (const f of this.fields) {
            f.get_val_from_obj(obj);
        }

        if (obj.url_has_test) {
            $("#url_check_box").collapse('show');
            $('#url_test_box_button').hide();

        } else {
            $("#url_check_box").collapse('hide');
            $('#url_test_box_button').show();
        }

        if (obj.selector_has_test) {
            $("#selector_test_box").collapse('show');
            $('#selector_test_box_button').hide();

        } else {
            $("#selector_test_box").collapse('hide');
            $('#selector_test_box_button').show();

        }
        if (obj.has_error) {
            this.error_popup.show();
        }

    },

    make_obj: function() {
        let tmp_ret = {}
        for (const f of this.fields) {
            tmp_ret = f.set_val_in_obj(tmp_ret);
        }
        return tmp_ret;
    },
    
    force_save: function() {    
        let tmp_obj = this.make_obj();
        if (this.current_index === -1) {
            config.add_url(tmp_obj);
        } else {
            this.current_item.from_obj(tmp_obj)
        }
        this.close();
        config.save_config();
        MainScreenHandler.update_display();
    },
    
    try_save_to_config: function() {
        let tmp_obj = this.make_obj();
        let tmp_url = new ATCUrlObj(tmp_obj);
        if (tmp_url.has_error) {
            this.refresh_from_obj(tmp_url);
            this.error_popup.html('There are errors in this configuration, to save anyway, click Force Save, or fix the errors and try saving again.')
            this.error_popup.show();
        } else if (!(tmp_url.url_enabled)) {
            this.refresh_from_obj(tmp_url);
            this.error_popup.html('This configuration is disabled, this could be due to errors detected, to save anyway, click Force Save, or enable, fix the errors and try saving again.')
            this.error_popup.show();
        } else {
            this.force_save();
        }

    },

    clear: function() {
        this.current_item = null;
        this.current_index = -1;
        this.error_popup.hide();

        for (const f of this.fields) {
            f.clear();
        }

    },

    close: function() {
        this.clear();
        this.my_box.hide();
    },
    
}

let ConfigScreenHandler = {
    my_box: new jqModal('config_edit_modal'),
    error_popup: new jqBoxObj('config_error_notice'),
    error_popup_text: new jqBoxObj('config_error_notice_text'),
    json_error_popup: new jqBoxObj('config_json_error_notice'),
    config_field: new jqFieldObj('config'),
    last_save_type: false,
    cfg_obj: null,

    init: function() {
        this.file_input = document.querySelector('#upload_input')
        this.my_box.init();
        this.error_popup.init();
        this.error_popup_text.init()
        this.json_error_popup.init();
        this.config_field.init();
        this.clear();
    },

    load_from_config: function(cfg) {
        cfg = cfg === undefined ? config : cfg;
        let tmp_obj = cfg.as_obj();
        tmp_obj = JSON.stringify(tmp_obj, null, 4);
        this.config_field.val = tmp_obj;
        if (cfg.has_error) {
            this.error_popup_text.html(make_config_error_ul(cfg, 'Errors detected in config, fix the errors and re-save, or click "Force Save" to save anyway'))
            this.error_popup.show();
        }
        this.my_box.show();

    },

    clear_error: function() {
        this.error_popup.hide();
        this.error_popup_text.html('')
        this.json_error_popup.html('')
        this.json_error_popup.hide();
    },

    clear: function() {
        this.config_field.clear();
        this.cfg_obj = null;
        this.clear_error();
    },

    force_save: function() {
        console.log('force saving config')
        config.from_obj(this.cfg_obj, this.last_save_type)
        config.save_config()
        this.close();
        this.clear();
        MainScreenHandler.update_display();
    },

    validate_str(config_str) {
        config_str = config_str === undefined ? this.config_field.val : config_str
        this.clear_error()
        if (config_str === '') {
            console.log('No configuration json, returning.')
            this.json_error_popup.html('You must provide a configuration json');
            this.json_error_popup.show();
            return false;
        }

        try {
            this.cfg_obj = JSON.parse(config_str);
            console.log('Valid json object')
            console.log(this.cfg_obj)
        } catch(e) {
            console.log('invalid json: ' + e.toString())
            this.json_error_popup.html('Invalid JSON: ' + e.toString());
            this.json_error_popup.show();
            return false;
        }

        console.log('Loading temp config to scan for errors')
        let tmp_config = new ATCConfig(this.cfg_obj);
        if (tmp_config.has_error) {
            console.log('Errors found, re-loading config with errors showing')
            this.load_from_config(tmp_config)
            return false;
        } else {
            this.load_from_config(tmp_config)
            console.log('No errors detected, saving now.')
        }
        return true;

    },

    try_save_to_config: function(overwrite) {
        overwrite = overwrite === undefined ? true: overwrite;
        this.last_save_type = overwrite
        if (this.validate_str()) {
            this.force_save();
        }
    },

    close: function() {
        this.clear();
        this.my_box.hide();
    },

    download_config: function() {
        console.log('Download config');
        const cfg = config.as_obj();
        const str = JSON.stringify(cfg, null, 4);
        const a = document.createElement("a");
        const file = new Blob([str], { type: 'text/json' });
        a.href = URL.createObjectURL(file);
        a.download = 'atc_config.json';
        a.click();
        console.log("downloaded config");

    },

    upload_config: function(event) {
        console.log('Upload config');
        // Stop the form from reloading the page
        event.preventDefault();

        // If there's no file, do nothing

        // if (!this.file_input.value.length) return;
        if (!this.file_input.files.length) return;

        let reader = new FileReader();
        let that = this
        reader.onload = function(e) {
            let str = e.target.result;
            let json = JSON.parse(str);
            console.log('string', str);
            console.log('json', json);
            that.validate_str(str);
            that.file_input.value = '';
        };
        reader.readAsText(this.file_input.files[0]);

        // this seemed to actually download a file.
        /*

        to upload a file:
        // Get the form and file field


        https://gomakethings.com/how-to-upload-and-process-a-json-file-with-vanilla-js/


        let form = document.querySelector('#upload');
        let file = document.querySelector('#file');

        // Listen for submit events
        form.addEventListener('submit', handleSubmit);


         * Handle submit events
         * @param  {Event} event The event object

        function handleSubmit (event) {


        }


        */

    },

    copy_config_to_clipboard: function() {
        console.log('Copy config to clipboard');
        let copyText = document.getElementById("config_field");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(copyText.value);
    }
}

export {ATCUrlObj, ATCConfig, EditScreenHandler, config, ConfigScreenHandler, MainScreenHandler}


