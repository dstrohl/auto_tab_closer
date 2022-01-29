

function make_error_ul(url_obj) {
    let tmp_error_text = '<ul>'
    for (const ei of url_obj.error_list) {
        tmp_error_text += `<li>${ei}</li>`;
    }
    tmp_error_text += '</ul>'
    return tmp_error_text

}

function make_config_error_ul(cfg, header_text) {
    if (!(cfg.has_error)) {return '';}

    let tmp_ret = header_text === undefined ? '<ul>' : `<h5>${header_text}</h5><ul>`

    for (const url of cfg.urls) {
        if (url.has_error) {
            tmp_ret += `<li>${url.name} Errors:</br>${make_error_ul(url)}</li>`;
        }
    }
    tmp_ret += '</ul>'    
    
    return tmp_ret
}


function url_as_html(id, url_obj) {

    let cfg_str = "URL: <b>" + url_obj.url + "</b>";
    cfg_str += `${url_obj.url_is_regex ? " (Regex)": ""}`;
    cfg_str += `${url_obj.url_test_mode ? " [TEST MODE]": ""}`;
    if (url_obj.url_has_test) {
        cfg_str += '</br>&emsp;&emsp;Has URL Check Tests';
    }

    if (url_obj.has_selector) {
        cfg_str += '</br>Has Content Validation with: "' + url_obj.selector + '"';
        if (url_obj.selector_has_test) {
            cfg_str += '</br>&emsp;&emsp;Has Selector Check Tests';
        }
    }
    if (url_obj.delay) {
        cfg_str += '</br>Delay for ' + url_obj.delay_secs() + ' before closing';
        cfg_str += `${url_obj.allow_cancel ? " and allow cancel": ""}`;
    }
    let name_info = "";

    if (url_obj.has_error) {
        let tmp_error_text = make_error_ul(url_obj)
        name_info = `
            <div>
                <div><b>${url_obj.name}</b></div>
                <div 
                    class="d-inline-block" 
                    data-toggle="popover"  
                    data-trigger="hover"
                    data-html="true"
                    title="Errors in URL configuration:" 
                    data-content="${tmp_error_text}">
                    &emsp;&emsp;ERRORS!
                    ${url_obj.url_enabled ? "" : "</br>&emsp;&emsp;DISABLED"}
                </div>

            </div>`
    } else if (!(url_obj.url_enabled)) {
        name_info = `<div><b>${url_obj.name}</b></br>&emsp;&emsp;DISABLED</div>`
    } else {
        name_info = `<div><b>${url_obj.name}</b></div>`
    }

    id = id.toString();
    return ` 
            <tr class="row_${id}" data-id="${id}">
                <td class="edit_cell">
                    <button type='button'
                        class='btn btn-default edit_btn'
                        data-id="${id}">
                        <i class="bi-pencil-square"></i>
                    </button>
                </td>
                <td class='name_cell'>${name_info}</td>
                <td class='config_cell'>${cfg_str}</td>
                <td class='delete_cell'>
                    <button type='button'
                        class='btn btn-default delete_btn'
                        data-id="${id}">
                        <i class="bi-trash"></i>
                    </button>
                </td>
            </tr>`
}

export {url_as_html, make_error_ul, make_config_error_ul}