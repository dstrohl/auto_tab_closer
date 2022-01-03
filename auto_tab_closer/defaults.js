
export const default_options = {
    loaded_default: false,
    test_mode: false,
    enabled: true,
    urls: [
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
        {
            name: "Edge",
                url: "https://\\w*\\.vpn\\.f5\\.com/public/oauth_done.html",
            url_is_regex: true,
            url_test_mode: true,
            use_selector: false,
            jquery_selector: "",
            delay: 5,
            allow_cancel: true

        },
        {
            name: "Zoom",
                url: "https://\\.zoom.us/j/.*#success",
            url_is_regex: true,
            url_test_mode: true,
            use_selector: true,
            jquery_selector: "title:contains('Launch Meeting - Zoom')",
            delay: 5,
            allow_cancel: true

        }
    ]

}
