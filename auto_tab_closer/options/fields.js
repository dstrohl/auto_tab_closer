
/*

import {jqBoolFieldObj, jqFieldObj, jqIntFieldObj, jqBoxObj} from "../scripts/jq_helper.js";
import {dictGet, split_str} from "../scripts/common";

"use strict"

const $S = {
    add_edit_box: new jqBoxObj('add_edit_box'),
    config_box: new jqBoxObj('config_box'),

    url_field: new jqFieldObj('url_field', 'url_field_feedback'),
    name_field: new jqFieldObj("item_name", 'name_field_feedback'),
    is_regex_field: new jqBoolFieldObj('is_regex'),
    tab_test_mode_field: new jqBoolFieldObj('tab_test_mode'),
    delay_sec_field: new jqIntFieldObj('delay_secs', 'delay_field_feedback'),
    delay_cancel_field: new jqBoolFieldObj('delay_cancel'),
    item_selector_field: new jqFieldObj('item_selector', 'selector_field_feedback'),
    tab_enabled_field: new jqBoolFieldObj('tab_enabled', undefined, true),

    good_url_test: new jqFieldObj('url_test_pass', 'url_test_pass_feedback'),
    bad_url_test: new jqFieldObj('url_test_fail', 'url_test_fail_feedback'),
    selector_test: new jqFieldObj('selector_test', 'selector_test_feedback'),

    config_field: new jqFieldObj('config_field', 'config_field_feedback'),
    test_mode_field: new jqBoolFieldObj('test_mode'),
    enabled_field: new jqBoolFieldObj('enabled_field'),


    init_all: function() {
        for (const [key, value] of Object.entries(this)) {
            try {
                value.init();
            } catch(d) {}
        }
    }
}



class FieldOBj {
    has_error = false
    error_text = ''
    name = ''
    default_val = ''
    field_obj = null
    val = ''
    is_shown = false
    is_required = false

    constructor() {
        this.val = this.default_val;
    }

    init() {
        this.error_text = '';
        this.has_error = false;
        if (this.is_required && this.val === "") {
            this.error_text = this.name + ' is a required field.';
            this.has_error = true;
        }
    }

    get_val_from_obj(obj) {
        this.val = dictGet(obj, this.name, this.val);
        this.init();
    }

    set_val_in_obj(obj) {
        obj[this.name] = this.val;
        return obj;
    }
    get_page_val() {
        this.val = this.field_obj.val();
        this.init();
        if (this.has_error) {
            this.field_obj.set_error(false, this.error_text)
        }

    }
    set_page_val() {
        this.clear_page_val();
        this.field_obj.val(this.val);
        if (this.has_error) {
            this.field_obj.set_error(false, this.error_text)
        }
    }

    clear() {
        this.error_text = '';
        this.has_error = false;
        this.val = this.default_val;
        this.field_obj.clear();
    }
    clear_page_val() {
        this.field_obj.clear();
    }

}

class NameFieldObj extends FieldOBj {
    name="name"
    field_obj=$S.name_field
    is_required = true
}

class EnabledFieldObj extends FieldOBj {
    name="enabled"
    field_obj=$S.tab_enabled_field
    default_val = true
}

class TestModeFieldObj extends FieldOBj {
    name="url_test_mode"
    field_obj=$S.tab_test_mode_field
    default_val = false
}

class URLFieldObj extends FieldOBj {
    name = 'url'
    field_obj = $S.url_field
    re_obj = null
    is_regex = false
    good_url_test = ''
    bad_url_test = ''
    bad_test_error = ''
    good_test_error = ''
    has_bad_test_error = false
    has_good_test_error = false
    good_url_test_array = []
    bad_url_test_array = []
    has_tests = false
    is_required=true

    init() {
        this.error_text = '';
        this.has_error = false;
        this.has_tests = false;
        this.good_url_test_array = [];
        this.bad_url_test_array = [];
        this.good_test_error = '';
        this.bad_test_error = '';
        this.has_bad_test_error = false;
        this.has_good_test_error = false;

        let good_test_errors = []
        let bad_test_errors = []

        if (this.val === "") {
            this.error_text = 'URL is a required field.';
            this.has_error = true;
            return;
        }

        if (this.is_regex) {
            try {
                this.re_obj = RegExp(this.val);
            } catch(e) {
                this.has_error = true;
                this.error_text = 'Invalid regex pattern: ' + e.toString();
                return;
            }
        } else {
            this.re_obj = null;
        }

        if (this.good_url_test !== '') {
            this.good_url_test_array = split_str(this.good_url_test);
            this.has_tests = true;
            for (const test_item of this.good_url_test_array) {
                let test_ret = this.check_url(test_item);
                if (!(test_ret)) {
                    this.error_text = 'One or more of the url test matches failed';
                    this.has_error = true;
                    this.has_good_test_error = true;
                    good_test_errors.push('url pattern did not match: ' + test_item);
                }
            }
            if (this.has_good_test_error) {
                this.good_test_error = good_test_errors.join('</br>');
            }
        }

        if (this.bad_url_test !== '') {
            this.bad_url_test_array = split_str(this.bad_url_test);
            this.has_tests = true;
            for (const test_item of this.bad_url_test_array) {
                let test_ret = this.check_url(test_item);
                if (test_ret) {
                    this.error_text = 'One or more of the url test matches failed';
                    this.has_error = true;
                    this.has_bad_test_error = true;
                    bad_test_errors.push('url pattern matched: ' + test_item);
                }
            }
            if (this.has_bad_test_error) {
                this.bad_test_error = bad_test_errors.join('</br>');
            }
        }

    }

    check_url(url) {
        if (this.is_regex) {
            return this.re_obj.test(url);
        } else {
            return this.val === url;
        }

    }

    get_val_from_obj(obj) {
        this.is_regex = dictGet(obj, 'url_is_regex', this.is_regex);
        this.good_url_test = dictGet(obj, 'good_url_test', this.good_url_test);
        this.bad_url_test = dictGet(obj, 'bad_url_test', this.bad_url_test);
        super.get_val_from_obj(obj);
    }
    set_val_in_obj(obj) {
        obj['url_is_regex'] = this.is_regex;
        obj['good_url_test'] = this.good_url_test;
        obj['bad_url_test'] = this.bad_url_test;
        obj = super.set_val_in_obj(obj);
        return obj
    }

    get_page_val() {
        this.good_url_test = $S.good_url_test.val();
        this.bad_url_test = $S.bad_url_test.val();
        this.is_regex = $S.is_regex_field.val();
        super.get_page_val();
    }

    set_page_val() {
        $S.good_url_test.val(this.good_url_test, this.good_test_error);
        $S.bad_url_test.val(this.bad_url_test, this.bad_test_error);
        $S.is_regex_field.val(this.is_regex);
        super.set_page_val();
    }

    clear() {
        this.good_url_test = '';
        this.bad_url_test = '';
        this.has_bad_test = false;
        this.has_good_test = false;
        this.is_regex = false;
        super.clear();
    }

    clear_page_val() {
        this.field_obj.clear_val();
        $S.good_url_test.clear();
        $S.bad_url_test.clear();
        $S.is_regex_field.clear();

    }

}

class DelayFieldObj extends FieldOBj {
    name = 'delay'
    field_obj = $S.delay_sec_field
    default_val = 5
    default_cancel = false
    allow_cancel = true
    val = 5

    init() {
        this.error_text = '';
        this.has_error = false;
        if (this.val === 0 && this.allow_cancel) {
            this.has_error = true;
            this.error_text = 'Delay must be larger than 0 to allow cancel.';

        }
    }

    get_val_from_obj(obj) {
        this.allow_cancel = dictGet(obj, 'allow_cancel', this.allow_cancel);
        super.get_val_from_obj(obj);
    }
    set_val_in_obj(obj) {
        obj['allow_cancel'] = this.allow_cancel;
        obj = super.set_val_in_obj(obj);
        return obj
    }

    get_page_val() {
        this.allow_cancel = $S.delay_cancel_field.val();
        super.get_page_val();
    }

    set_page_val() {
        $S.delay_cancel_field.val(this.allow_cancel);
        super.set_page_val();
    }

    clear() {
        this.allow_cancel = false;
        super.clear();
    }

    clear_page_val() {
        this.field_obj.clear_val();
        $S.delay_cancel_field.clear();
    }


}

class SelectorFieldObj extends FieldOBj {
    name = 'selector'
    field_obj = $S.item_selector_field
    selector_test = ''
    selector_test_error = ''
    has_selector_test_error = false
    has_tests = false
    is_required=false

    init() {
        this.error_text = '';
        this.has_error = false;
        this.has_tests = false;
        this.selector_test_error = ''
        this.has_selector_test_error = false

        if (this.selector_test !== '') {
            this.has_tests = true;
            let test_ret = null;
            try {
                test_ret = $(this.val, this.selector_test);
            } catch(e) {
                this.error_text = 'Selector format error: ' + e.toString();
                this.has_error = true;
                return;
            }
            if (!(test_ret.length)) {
                this.error_text = 'Selector was not found in the test html';
                this.has_error = true;
            }
        }

    }

    get_val_from_obj(obj) {
        this.selector_test = dictGet(obj, 'selector_test', this.selector_test);
        super.get_val_from_obj(obj);
    }
    set_val_in_obj(obj) {
        obj['selector_test'] = this.selector_test
        obj = super.set_val_in_obj(obj);
        return obj
    }

    get_page_val() {
        this.selector_test = $S.selector_test.val();
        super.get_page_val();
    }

    set_page_val() {
        $S.selector_test.val(this.selector_test);
        super.set_page_val();
    }

    clear() {
        this.selector_test = '';
        $S.selector_test.clear();
        super.clear();
    }

    clear_page_val() {
        this.field_obj.clear_val();
        $S.selector_test.clear();
    }

}

class AllTestModeFieldObj extends FieldOBj {
    name="enabled"
    field_obj=$S.test_mode_field
    default_val = false
}

class AllEnabledFieldObj extends FieldOBj {
    name="enabled"
    field_obj=$S.enabled_field
    default_val = true
}

class ConfigFieldObj extends FieldOBj {

    name = 'config'
    field_obj = $S.config_field
    is_required = true
    cfg_obj = null

    set_config(cfg) {
        this.cfg_obj = cfg;
        this.val = JSON.stringify(obj, null, 4);
    }

    init() {
        super.init();
        if (this.has_error) {
            return;
        }
        this.cfg_obj = null;
        try {
            this.cfg_obj = JSON.parse(this.val);
        } catch(e) {
            this.error_text = 'Invalid JSON: ' + e.toString();
            this.has_error = true;
        }
    }

    clear() {
        this.cfg_obj = null;
        super.clear();
    }

}

export {$S, DelayFieldObj, EnabledFieldObj, NameFieldObj, SelectorFieldObj, URLFieldObj, TestModeFieldObj, AllEnabledFieldObj, AllTestModeFieldObj, ConfigFieldObj}*/
