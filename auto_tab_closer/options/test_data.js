const test_data = {
    "loaded_default": false,
    "test_mode": false,
    "enabled": true,
    "urls": [
        {
            "url_enabled": true,
            "name": "1_regex_url_test_pass",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/fail_close_test.foobar",
            "selector_test": "",
            "url_is_regex": true,
            "url_test_mode": false,
            "selector": "",
            "delay": 5,
            "allow_cancel": true
        },
        {
            "url_enabled": true,
            "name": "2_normal_url_test_pass",
            "url": "https://example.com/close_test",
            "good_url_test": "https://example.com/close_test\nhttps://example.com/close_test",
            "bad_url_test": "https://example.com/fail_close_test.foobar",
            "selector_test": "",
            "url_is_regex": false,
            "url_test_mode": true,
            "selector": "",
            "delay": 5,
            "allow_cancel": true
        },
        {
            "url_enabled": true,
            "name": "3_selector_test_pass",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/fail_close_test.foobar",
            "selector_test": "<html><title>Fail_example</title></html>",
            "url_is_regex": true,
            "url_test_mode": false,
            "selector": "title:contains('Fail_example')",
            "delay": 5,
            "allow_cancel": true

        },
        {
            "url_enabled": true,
            "name": "4_selector_test_pass",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/fail_close_test.foobar",
            "selector_test": "<html><div class='testclass'>Fail_example</div></html>",
            "url_is_regex": true,
            "url_test_mode": true,
            "selector": ".testclass",
            "delay": 5,
            "allow_cancel": true

        },
        {
            "url_enabled": true,
            "name": "5_bad_selector_fail",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/fail_close_test.foobar",
            "selector_test": "<html><div class='testclass'>Fail_example</div></html>",
            "url_is_regex": true,
            "url_test_mode": false,
            "selector": ".#$",
            "delay": 5,
            "allow_cancel": true

        },
        {
            "url_enabled": true,
            "name": "6_selector_fail_test",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/fail_close_test.foobar",
            "selector_test": "<html><title>should fail</title></html>",
            "url_is_regex": true,
            "url_test_mode": true,
            "selector": "title:contains('Fail_example')",
            "delay": 5,
            "allow_cancel": true
        },
        {
            "url_enabled": true,
            "name": "7_no url test_fail",
            "url": "",
            "good_url_test": "",
            "bad_url_test": "",
            "selector_test": "",
            "url_is_regex": false,
            "url_test_mode": true,
            "selector": "",
            "delay": 5,
            "allow_cancel": false
        },
        {
            "url_enabled": true,
            "name": "8_delay fail test_fail",
            "url": "https://example.com/close_test.*",
            "good_url_test": "",
            "bad_url_test": "",
            "selector_test": "",
            "url_is_regex": true,
            "url_test_mode": false,
            "selector": "",
            "delay": 0,
            "allow_cancel": true
        },
        {
            "url_enabled": true,
            "name": "9_url_good_fail_test",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/no_close_test.foobar\nhttps://example.org/close_test.test",
            "bad_url_test": "https://example.com/close_test.foobar",
            "selector_test": "",
            "url_is_regex": true,
            "url_test_mode": true,
            "selector": "",
            "delay": 5,
            "allow_cancel": false

        },
        {
            "url_enabled": true,
            "name": "10_url_bad_fail_test",
            "url": "https://example.com/close_test.*",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/close_test.foobar",
            "selector_test": "",
            "url_is_regex": true,
            "url_test_mode": true,
            "selector": "",
            "delay": 5,
            "allow_cancel": false

        },
        {
            "url_enabled": true,
            "name": "11_url_normal_good_fail_test",
            "url": "https://example.com/close_test",
            "good_url_test": "https://example.com/close_test.foobar\nhttps://example.com/close_test.test",
            "bad_url_test": "https://example.com/close_test",
            "selector_test": "",
            "url_is_regex": false,
            "url_test_mode": false,
            "selector": "",
            "delay": 5,
            "allow_cancel": true

        }
    ]
}

export {test_data}