-- Python: use ./venv or ./.venv automatically, so imports resolve
-- even when Neovim wasn't started from an activated shell.

return {
    before_init = function(_, config)
        local root = config.root_dir
        if not root then
            return
        end

        for _, dir in ipairs({ "venv", ".venv" }) do
            local python = root .. "/" .. dir .. "/bin/python"

            if vim.uv.fs_stat(python) then
                config.settings = vim.tbl_deep_extend(
                    "force",
                    config.settings or {},
                    { python = { pythonPath = python } }
                )
                return
            end
        end
    end,
}
