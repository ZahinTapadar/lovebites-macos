-- Completion

return {
    "saghen/blink.cmp",
    version = "1.*",
    event = "InsertEnter",

    opts = {
        keymap = {
            preset = "super-tab",
        },

        completion = {
            menu = {
                border = "rounded",
            },

            documentation = {
                auto_show = true,

                window = {
                    border = "rounded",
                },
            },
        },

        signature = {
            enabled = true,

            window = {
                border = "rounded",
            },
        },
    },
}
