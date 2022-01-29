
const url_regex = RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);


function dictGet(obj, prop, def) {
    try {
        let tmp_ret = obj[prop];
        if (tmp_ret === undefined) {
            return def;
        } else {
            return tmp_ret;
        }

    } catch (e) {
        return def;
    }
}


function split_str(str_in) {
    return str_in.split(/\r?\n/);
}

export { url_regex, dictGet, split_str}

