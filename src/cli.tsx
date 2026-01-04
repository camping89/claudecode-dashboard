// CLI entry point - main executable with Commander.js + Ink TUI
import { Command } from 'commander'
import { printJsonOutput } from './lib/json-output.js'

const program = new Command()
  .name('cc-dashboard')
  .description('View Claude Code configurations')
  .version('1.0.0')
  .argument('[category]', 'Category to show (skills, agents, commands, hooks, mcp, plugins, settings)')
  .option('-j, --json', 'Output as JSON instead of TUI')
  .action(async (category, opts) => {
    if (opts.json) {
      await printJsonOutput(category || 'all')
    } else {
      await renderTUI(category)
    }
  })

// Lazy load TUI components to avoid Ink initialization issues when using --json
async function renderTUI(initialCategory?: string) {
  const { render } = await import('ink')
  const React = await import('react')
  const { App } = await import('./app.js')
  render(React.createElement(App, { initialCategory }))
}

program.parse()
