import test from 'ava'
import daoNew from '../../src/commands/dao_cmds/new'
import { configCliMiddleware } from '../../src/middleware'
import { runAragonCLI, normalizeOutput } from '../utils'
import web3Utils from 'web3-utils'

const daoIdAndAddressAddressRegex = /Created DAO: (.*) at (.*)$/

/**
 * Simulates a yargs middleware run
 * @param {T} args Command arguments
 * @return {T} expanded args with middleware functions
 */
function middleware(args) {
  args.reporter = { ...console, success: console.log }
  return {
    ...configCliMiddleware({ _: [], ...args }),
    ...args,
  }
}

test('creates a new DAO', async t => {
  const args = {
    debug: true,
    apm: {
      'ens-registry': '0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1',
    },
    template: 'bare-template',
    templateVersion: 'latest',
    fnArgs: [],
    fn: 'newInstance',
    deployEvent: 'DeployDao',
  }

  const daoAddress = await daoNew.handler(middleware(args))

  t.assert(web3Utils.isAddress(daoAddress), 'Invalid DAO address')
})

test.skip('assigns an Aragon Id with the "--aragon-id" param', async t => {
  t.plan(3)

  const stdout = await runAragonCLI([
    'dao',
    'new',
    '--debug',
    '--aragon-id',
    'newdao1',
  ])
  const [, daoId, daoAddress] = stdout.match(daoIdAndAddressAddressRegex)

  const resultSnapshot = normalizeOutput(stdout).replace(daoAddress, '')

  t.assert(daoId === `newdao1.aragonid.eth`, 'Invalid Aragon Id')
  t.assert(/0x[a-fA-F0-9]{40}/.test(daoAddress), 'Invalid DAO address')
  t.snapshot(resultSnapshot)
})
