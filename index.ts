import { execute } from "./src";

function parseArgs(args: string[]) {
  const parsed: { [key: string]: string } = {};
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    parsed[key.trim().replace(/^--/, '')] = value;
  });
  return parsed;
}

export async function run(): Promise<number> {
  try {
    if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set');

    console.log('Arguments:', process.argv.slice(2));

    const inputs = parseArgs(process.argv.slice(2));

    console.log('Parsed inputs:', inputs);

    if (!inputs.repository) throw new Error('repository is required');
    if (!inputs['source-branch']) throw new Error('source-branch is required');
    if (!inputs['target-branch']) throw new Error('target-branch is required');
    if (!inputs.label) throw new Error('label is required');

    const githubToken = process.env.GITHUB_TOKEN;
    const repository: string[] = inputs.repository.split('/');
    const sourceBranch: string = inputs['source-branch'];
    const targetBranch: string = inputs['target-branch'];
    const label: string = inputs.label;

    console.info(`Synchronizing branches and labels for repository ${repository.join('/')} from ${sourceBranch} to ${targetBranch} with label ${label}`);

    const runtime = execute({ githubToken, logger: console });
    await runtime.synchronizeBranchesAndLabels({ repository: { owner: repository[0], repo: repository[1] }, sourceBranch, targetBranch, label });

    console.info('Synchronization complete');
  } catch (error) {
    console.error('Error during synchronization:', error);
    return -1;
  }
  return 0;
}

run().then(status => process.exit(status)).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(-1);
});
