import { $, type ShellPromise } from "bun"

type Checkout = (branch: string, options?: { pull?: boolean, create?: boolean }) => Promise<void>
const checkout: Checkout = async (branch, { pull = false, create = false } = {}) => {
  const checkoutOptions = create ? "-b" : ""
  console.log(`Checking out branch: ${branch} with options: ${checkoutOptions}`)
  try {
    const checkoutOutput = await run($`git checkout ${checkoutOptions} ${branch}`)
    console.log(`Checkout output: ${checkoutOutput}`)
  } catch (error) {
    console.error(`Failed to checkout branch ${branch}:`, error)
    throw error
  }

  if (pull) {
    console.log(`Pulling branch: ${branch}`)
    try {
      const pullOutput = await run($`git pull`)
      console.log(`Pull output: ${pullOutput}`)
    } catch (error) {
      console.error(`Failed to pull branch ${branch}:`, error)
      throw error
    }
  }
  console.log(`Checked out and pulled branch: ${branch}`)
}

type CreateBranch = (branch: string) => Promise<void>
const createBranch: CreateBranch = async (branch: string) => {
  console.log(`Creating branch: ${branch}`)
  try {
    await checkout(branch, { create: true })
  } catch (error) {
    console.error(`Failed to create branch ${branch}:`, error)
    throw error
  }
  console.log(`Created branch: ${branch}`)
}

type Merge = (branch: string) => Promise<void>
const merge: Merge = async branch => {
  console.log(`Merging branch: ${branch}`)
  try {
    const mergeOutput = await run($`git merge origin/${branch} --no-verify --no-edit`)
    console.log(`Merge output: ${mergeOutput}`)
  } catch (error) {
    console.error(`Failed to merge branch ${branch}:`, error)
    throw error
  }
  console.log(`Merged branch: ${branch}`)
}

type AbortMerge = () => Promise<void>
const abortMerge: AbortMerge = async () => {
  console.log('Aborting merge')
  try {
    const abortOutput = await run($`git merge --abort`)
    console.log(`Abort output: ${abortOutput}`)
  } catch (error) {
    console.error('Failed to abort merge:', error)
    throw error
  }
  console.log('Merge aborted')
}

type PushForce = (branch: string) => Promise<void>
const pushForce: PushForce = async branch => {
  console.log(`Pushing branch: ${branch} with force`)
  try {
    const pushOutput = await run($`git push --force --set-upstream origin ${branch}`)
    console.log(`Push output: ${pushOutput}`)
  } catch (error) {
    console.error(`Failed to push branch ${branch} with force:`, error)
    throw error
  }
  console.log(`Pushed branch: ${branch} with force`)
}

const run = async (command: ShellPromise, errorMessage?: string): Promise<string> => {
  const { stdout, stderr, exitCode } = await command.quiet()
  const cleanMessage = [errorMessage, stderr.toString()].filter(Boolean).join(": ")
  if (exitCode) {
    console.error(`Command failed: ${cleanMessage}`)
    throw new Error(cleanMessage)
  }
  console.log(`Command output: ${stdout.toString().trim()}`)
  return stdout.toString().trim()
}

export { abortMerge, checkout, createBranch, merge, pushForce }
