
/*

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
]

*/



const config = {
    test_mode: false,
    enabled: true,
    loaded: false,
    urls: []
}


function load_config() {
    // loading config from extensions data store
    console.log("Loading config...");
    chrome.storage.sync.get(config, function (result) {
        config.test_mode = result.test_mode;
        config.enabled = result.enabled;
        config.urls = result.urls;
        config.urls.forEach(function(item) {
            console.log('Loading item: ' + item.name);
            if (item.url_is_regex) {
                console.log('regex url: ' + item.url);
                item.url = new RegExp((item.url));
                console.log('is now url: ' + item.url);
            } else {
                console.log('Normal url: ' + item.url)
            }
        })
        console.log('Test mode = ' + config.test_mode.toString());
        console.log("Loaded config (" + config.urls.length.toString()+ " urls)");
        config.loaded = true;
    });

}


chrome.storage.onChanged.addListener(function() {
        load_config();
});



function check_dom(selector_str) {
    console.log('Checking dom for selector string: '+ selector_str);
    let ret = $(selector_str).length;
    console.log('Found length of selector string: ' + ret.toString());
    return ret
}


function handle_tab_close(tab_id) {
    console.log('Closing tab: ' + tab_id.toString());
    chrome.tabs.remove(tab_id);
}

function cancel_tab_close(timer_id) {
    console.log('Clearing timeer for ' + timer_id.toString());
    clearTimeout(timer_id);
}


function handle_selector_check(item, tabId) {
    chrome.scripting.executeScript({
            target: { tabId: tabId},
            function: check_dom,
            args: {selector_str: item.jquery_selector}
        },
        function(injectionResults) {
            console.log('Selector check returned: ' + injectionResults[0]);
            if (injectionResults[0]) {
                console.log('sending to close handler');
                handle_tab_close_options(item, tabId);
            }

        });
}




function handle_tab_close_options(item, tabId) {
    console.log('Checking for close options');
    let test_mode = false;
    let msg_opt = {
        type: "basic",
        title: "Auto Close Tab",
        message: "The " + item.name + " tab",
        iconUrl: '../icons/ATC_On_128.png'
    };

    if (config.test_mode || item.url_test_mode) {
        console.log('Test mode, just notifying user.')
        msg_opt.title += ' Test';
        msg_opt.message += ' would be closed if this were not a test';
        test_mode = true;
    } else {
        msg_opt.message += ' will be closing';
        if (config.delay === 0) {
            // close the tab
            console.log('no delay, closing the tab.')
            handle_tab_close(tabId);
            return;
        }
    }
    let has_buttons = false;
    console.log('delaying for ' + item.delay.toString()+ ' seconds')
    msg_opt.message += ' in ' + item.delay.toString()+ ' seconds';
    let timer_id = setTimeout(function() {
        if (test_mode) {
            console.log('Would be Closing tab id: ' + tabId.toString());
        } else {
            console.log('Closing tab id: ' + tabId.toString());
            handle_tab_close(tabId);
        }
    }, item.delay * 1000,
        tabId);

    if (item.allow_cancel) {
        console.log('Allowing cancel, creating notification with cancel button');
        // send notification
        // wait x seconds and close the tab
        // or cancel on notification click
        msg_opt.buttons = [
            {title: 'Cancel'},
            {title: 'Close Now'}

        ]
        has_buttons = true;
    }

    chrome.notifications.create(msg_opt);

    if (has_buttons) {
        chrome.notifications.onButtonClicked.addListener(function(note_id, but_index) {
            cancel_tab_close(timer_id);
            if (but_index === 1) {
                if (test_mode) {
                    console.log('Would be Closing tab id: ' + tabId.toString());
                } else {
                    console.log('Closing tab id: ' + tabId.toString());
                    handle_tab_close(tabId);
                }
            }
        });
    }

}


chrome.tabs.onUpdated.addListener(function(tabId, props, tab) {
    if (props.status === "complete") {
        if (!(config.loaded)) {
            load_config();
        }
        let url = tab.url;
        if (url === undefined) {
            url = tab.pendingUrl;
        }
        console.debug('checking url for tab: ' + url);
        console.debug(tab)
        console.debug(config.urls)
        // let break_now = false;
        let is_match = false;
        for (const item of config.urls) {
            console.debug('Checking against ' + item.name);
            console.debug('URL to check: ' + url);
            console.debug('Checking against url: ' + item.url);
            if (item.url_is_regex) {
                console.debug('checking regex ' + item.url.toString());
                if (item.url.test(url)) {
                    console.log('item matches regex!')
                    is_match = true;
                } else {
                    console.log('does not match regex')
                }
            } else {
                console.debug('checking for direct match');
                if (item.url === url) {
                    console.log('matches url!')
                    is_match = true;
                } else {
                    console.debug('does not match url')
                }
            }

            if (is_match) {
                console.log('URL matches, do we need a selector?');
                if (item.use_selector) {
                    console.log('Checking for selector match.');
                    handle_selector_check(item, tabId);
                } else {
                    console.log('no selector needed, sending to close handler');
                    handle_tab_close_options(item, tabId);
                    break;
                }
            }

        }
    }
});


chrome.runtime.onInstalled.addListener((reason) => {
    load_config();
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }
});
