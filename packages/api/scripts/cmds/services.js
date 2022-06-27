import path from 'path'
import { fileURLToPath } from 'url'
import execa from 'execa'
import { MINIO_API_PORT } from './minio.js'
import { isPortReachable } from '../utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const composePath = path.join(__dirname, '../../docker/docker-compose.yml')

const PG_PORT = 3000
const PGRST_PORT = 5432
const CLUSTER_PORT = 9094

/**
 * @param {{ project: string }} opts
 */
export async function servicesStartCmd({ project }) {
  const ports = [PG_PORT, PGRST_PORT, MINIO_API_PORT, CLUSTER_PORT]
  const reachablePorts = await Promise.all(ports.map((p) => isPortReachable(p)))
  // if any port is reachable a service is running on it
  if (reachablePorts.some((r) => r)) {
    console.error('⚠️ Services are already running.')
  }
  await execa(
    'docker-compose',
    ['--file', composePath, '--project-name', project, 'up', '--detach'],
    { stdio: 'inherit' }
  )
}

/**
 * @param {{ project: string, clean?: boolean }} opts
 */
export async function servicesStopCmd({ project, clean }) {
  await execa(
    'docker-compose',
    ['--file', composePath, '--project-name', project, 'stop'],
    { stdio: 'inherit' }
  )

  if (clean) {
    await execa(
      'docker-compose',
      [
        '--file',
        composePath,
        '--project-name',
        project,
        'down',
        '--rmi',
        'local',
        '-v',
        '--remove-orphans',
      ],
      { stdio: 'inherit' }
    )
  }
}
