"use strict";

import {default_options} from "../defaults";

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

function dictGet(obj, prop, def) {
    let tmp_ret = obj[prop];
    if (tmp_ret === undefined) {
        return def;
    } else {
        return tmp_ret;
    }
}

export const ATC_TEST_MODE = false;

export const ATCConfig = {
    test_mode: false,
    _enabled: true,
    loaded_default: false,
    urls: [],

    enabled: function() {
        return this.urls.length && this._enabled
    },

    add_url: function(item, index) {
        if (index === undefined) {
            let tmp_url = new ATCUrlObj(item);
            urls.append(tmp_url);
        } else {
            let tmp_url = this.urls[index];
            tmp_url.update(item);
        }
    },

    add_urls: function(urls) {
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
    set_config: function(cfg) {
        this.test_mode = this.set_cfg_item(cfg, 'test_mode');
        this._enabled = this.set_cfg_item(cfg, 'enabled', '_enabled');
        this.loaded_default = this.set_cfg_item(cfg, 'loaded_default');
        if (cfg.urls !== undefined) {
            this.add_urls(cfg.urls);
        }
    },

    load: function() {
        if (ATC_TEST_MODE) {
            console.log("Loading dev config...");
            this.add_urls(atc_test_data);
            console.log("Loaded dev config");
        } else {
            console.log("Loading config...");

            if (!(this.loaded_default)) {
                this.set_config(default_options)
                this.loaded_default = true;
            }
            let that = this;
            chrome.storage.sync.get(null, function (result) {
                that.set_config(result);
            });

        }
        },

    as_obj: function() {
        let tmp_ret = {
            test_mode: this.test_mode,
            enabled: this.enabled,
            loaded_default: this.loaded_default,
            urls: [],
        }
        for (const item of this.urls) {
            tmp_ret.urls.append(item.as_obj());
        }
        return tmp_ret;
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

        }

}





class ATCUrlObj {
    constructor(props) {
        this.name = dictGet(props, 'name', "None");
        this._url_is_regex = dictGet(props, 'url_is_regex', false);
        this.url = dictGet(props, 'url', "");
        this.url_test_mode = dictGet(props, 'url_test_mode', false);
        this.jquery_selector = dictGet(props, 'jquery_selector', "");
        this.delay = dictGet(props, 'delay', 5);
        this.allow_cancel = dictGet(props, 'allow_cancel', true);
    }

    set url_is_regex(uir) {
        if (uir !== this.url_is_regex) {
            if (uir) {
                this._url = new RegExp((this._url));

            } else {
                this._url = this._url.toLocaleString();
            }
        }
        this._url_is_regex = uir;
    }
    get url_is_regex() {
        return this._url_is_regex;
    }
    set url(url_in) {
        if (this.url_is_regex) {
            this._url = new RegExp(url_in);
        } else {
            this._url = url_in;
        }
    }
    get url() {
        return this._url;
    }

    test_mode() {
        return this.url_test_mode || ATCConfig.test_mode;
    }

    use_selector() {
        return !!this.jquery_selector;
    }

    delay_secs() {
        return this.delay + ' seconds';
    }

    msg_obj() {
        let msg_opt = {
            type: "basic",
            title: `Auto Close Tab${this.test_mode() ? " TEST": ""} `,
            message: `The ${this.name} tab${this.test_mode() ? "would": "will"} be closed`,
            iconUrl: '../icons/ATC_On_128.png'
        };

        if (this.delay) {
            msg_opt.message += 'in ' + this.delay_secs();
        }

        if (this.allow_cancel) {
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
        let tmp_ret = `[${id}] ${this.name} --> `
        tmp_ret += this.url_is_regex ? "(R) ": "";
        tmp_ret += this.url.toString();
        return tmp_ret
    }

    long_info() {
        let cfg_str = "<b>URL: " + this.url + "</b>";
        cfg_str += `${this.url_is_regex ? " (Regex)": ""}`;
        cfg_str += `${this.url_test_mode ? " [TEST MODE]": ""}`;

        if (this.use_selector) {
            cfg_str += '</br>Validated with:' + this.jquery_selector;
        }
        if (this.delay) {
            cfg_str += '</br>Delay for ' + this.delay_secs() + ' before closing';
            cfg_str += `${this.allow_cancel ? " and allow cancel": ""}`;
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
                        <i class="bi-edit"></i>
                    </button>
                </td>
                <td class='name_cell'>${this.name}</td>
                <td class='config_cell'>${this.long_info()}</td>
                <td class='delete_cell'>
                    <button type='button'
                        class='btn btn-default delete_btn'
                        data-id="${id}">
                        <i class="bi-edit"></i>
                    </button>
                </td>
            </tr>
`
        return ret;
    }

    as_obj() {
        return {
            name: this.name,
            url: this.url.toString(),
            url_is_regex: this._url_is_regex,
            url_test_mode: this.url_test_mode,
            jquery_selector: this.jquery_selector,
            delay: this.delay,
            allow_cancel: this.allow_cancel
        };
    }

}

export function load_config() {
    // loading config from extensions data store
    if (ATC_TEST_MODE) {
        console.log("Loading dev config...");
        config.urls = atc_test_data;
        console.log("Loaded dev config");
        update_display();
    } else {
        console.log("Loading config...");

        if (!(config.loaded_default)) {
            config.test_mode = default_options.test_mode;
            config.loaded_default = true;
            config.enabled = default_options.enabled;
            config.urls = default_options.urls;
        }

        chrome.storage.sync.get(config, function (result) {
            config.test_mode = result.test_mode;
            config.urls = result.urls;
            console.log("Loaded config (" + config.urls.length.toString() + " urls)");
            console.log(config);
            update_display();
        });

    }
}
