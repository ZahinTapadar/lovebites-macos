-- ============================================================================
-- LSP behaviour shared by every server: keymaps, inlay hints, diagnostics.
-- Per-server settings live in after/lsp/<server>.lua.
-- Loaded from lua/plugins/lsp/lspconfig.lua.
-- ============================================================================

local map = vim.keymap.set

vim.api.nvim_create_autocmd("LspAttach", {
    callback = function(ev)
        local client = vim.lsp.get_client_by_id(ev.data.client_id)

        -- Pyright already provides hover docs; stop Ruff duplicating them.
        if client and client.name == "ruff" then
            client.server_capabilities.hoverProvider = false
        end

        if client and client:supports_method("textDocument/inlayHint") then
            vim.lsp.inlay_hint.enable(true, {
                bufnr = ev.buf,
            })
        end

        local lsp_map = function(lhs, rhs, desc)
            map("n", lhs, rhs, {
                buffer = ev.buf,
                desc = desc,
            })
        end

        lsp_map("gd", vim.lsp.buf.definition, "Go to definition")
        lsp_map("gr", vim.lsp.buf.references, "References")
        lsp_map("gi", vim.lsp.buf.implementation, "Implementation")
        lsp_map("gy", vim.lsp.buf.type_definition, "Type definition")
        lsp_map("K", vim.lsp.buf.hover, "Hover documentation")
        lsp_map("<leader>r", vim.lsp.buf.rename, "Rename symbol")
        lsp_map("<leader>a", vim.lsp.buf.code_action, "Code action")
    end,
})

vim.diagnostic.config({
    virtual_text = {
        prefix = "●",
    },

    float = {
        border = "rounded",
    },

    severity_sort = true,
})
