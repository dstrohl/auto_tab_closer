

const config = {
    test_mode=false, urls=[]
}


const url_obj = {
    url: null,
    url_is_regex: false,
    url_test_mode: false,
    use_selector: false,
    jquery_selector: null
}


function atc_load_config() {
    chrome.storage.sync.get(config, function (result) {
        atc_dump_config();
    });
}


function atc_save_config() {
    chrome.storage.sync.set(config, function () {
        atc_dump_config();
    });


}

function atc_dump_config() {
    if (config.test_mode) {
        console.log('AutoTabCloser: Debug Mode is enabled');
    } else {
        console.log('AutoTabCloser: Debug mode is disabled');
    }

    if (config.urls.length == 0) {
        console.log('AutoTabCloser: No urls configured')

    } else {
        console.log('AutoTabCloser: ' + config.urls.length.toString() + ' URLs defined')
        config.urls.forEach(function (item, index) {
            console.log('URL number: ' + index.toString());
            console.log(item)
        });
    }