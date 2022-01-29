"use strict"


import {dictGet} from "./common.js";

class JqObj {
    constructor(obj_selector) {
        this.obj_selector = obj_selector;
        this.setup = false;
        this.obj = null;
    }
    get_obj(sel) {

        let tmp_ret = $('#' + sel)
        if (tmp_ret.length === 0) {
            console.error('Could not find the element matching ' + sel)
        }
        return tmp_ret

    }
    init() {
        if (this.setup) {return;}
        this.obj = this.get_obj(this.obj_selector)
        this.sub_init();
        this.setup = true;

    }
    sub_init() {}

}

class jqBoxObj extends JqObj {
    hide() {
        this.obj.hide();
    }
    show() {
        this.obj.show();
    }
    text(text_in) {
        this.obj.text(text_in);

    }
    html(text_in) {
        this.obj.html(text_in);
    }
    clear() {
        this.obj.text('');
    }
}

class jqModal extends JqObj {
    hide() {
        this.obj.modal('hide');
    }
    show() {
        this.obj.modal('show');
    }
}

class jqFieldObj {

    default_val = '';
    field_obj = null;
    feedback_obj = null;
    has_feedback = false;

    constructor(field_name, default_val, field_selector, feedback_sel, error_text_name) {
        this.field_name = field_name
        this.field_selector = field_selector === undefined ? '#' + this.field_name + '_field' : '#' + field_selector
        this.feedback_sel = feedback_sel === undefined ? '#' + this.field_name + '_field_feedback' : '#' + feedback_sel
        this.default_val = default_val === undefined ? this.default_val : default_val
        this.error_text_name = error_text_name === undefined ? this.field_name + '_error_text' : error_text_name
    }

    init() {
        if (this.setup) {return;}


        this.field_obj = $(this.field_selector)
        if (this.field_obj.length === 0) {
            console.error('Could not find the element matching ' + this.field_selector)
            return
        }
        this.feedback_obj = $(this.feedback_sel)
        if (this.field_obj.length === 0) {
            console.log(`No Feedback for ${this.field_selector}, could not find the element matching ${this.field_selector}`)
        } else {
            this.has_feedback = true;
        }

        this.clear()
        this.setup = true;
    }

    get val() {
        return this.field_obj.val();
    }

    set val(val) {
        this.field_obj.val(val);
    }

    get_val_from_obj(obj) {
        this.clear()
        this.val = dictGet(obj, this.field_name, this.default_val)
        if (this.has_feedback) {
            this.set_error(dictGet(obj, this.error_text_name, ''))
        }

    }

    set_val_in_obj(obj) {
        obj[this.field_name] = this.val
        return obj
    }

    set_error(error_text) {
        if (!(this.has_feedback)) {return;}
        if (error_text === '') {
            this.clear_error();
        } else {
            this.feedback_obj.html(error_text);
            this.field_obj.addClass('is-invalid');
        }
    }

    clear_error() {
        if (!(this.has_feedback)) {return;}
        this.feedback_obj.text('');
        this.field_obj.removeClass('is-invalid');
    }

    clear_val() {
        this.val = this.default_val
    }

    clear() {
        this.clear_val();
        this.clear_error();
    }
}


class jqBoolFieldObj extends  jqFieldObj {
    default_val=false;
    set val(val) {
        this.field_obj.prop('checked', val);
    }

    get val() {
        return this.field_obj.prop('checked');
    }

}

class jqIntFieldObj extends  jqFieldObj {
    default_val = 5;

    get val() {
        let tmp_ret = this.field_obj.val();
        return parseInt(tmp_ret);
    }

    set val(val) {
        val = parseInt(val);
        this.field_obj.val(val);
    }

}


export {jqIntFieldObj, jqFieldObj, jqBoolFieldObj, jqBoxObj, jqModal}