#!/usr/bin/env node
import { execSync } from 'node:child_process'

if (process.env.CI) {
  process.exit(0)
}

const ports = process.argv.slice(2).map((value) => Number(value)).filter(Boolean)

if (!ports.length) {
  console.error('Usage: node scripts/ensure-port-free.mjs <port> [port...]')
  process.exit(1)
}

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean)

    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGTERM')
      } catch {
        /* ignore */
      }
    }

    if (pids.length) {
      execSync('sleep 0.2')
      for (const pid of pids) {
        try {
          process.kill(Number(pid), 'SIGKILL')
        } catch {
          /* ignore */
        }
      }
      console.log(`Freed port ${port}`)
    }
  } catch {
    /* port already free */
  }
}
