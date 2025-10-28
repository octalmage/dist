import type { MFS } from '@helia/mfs'

/**
 * Generates a unique filename by checking if it exists in MFS.
 * If it exists, detects existing trailing numbers and increments them, or appends 1.
 *
 * @param mfs - The MFS instance to check against
 * @param desiredFilename - The original filename the user wants
 * @returns A unique filename that doesn't conflict with existing files
 *
 * @example
 * // If "snippet.sol" exists, returns "snippet1.sol"
 * // If "snippet1.sol" also exists, returns "snippet2.sol"
 * // If "snippet11.sol" exists, returns "snippet12.sol"
 */
export async function getUniqueFilename(mfs: MFS, desiredFilename: string): Promise<string> {
  // Check if the original filename is available
  try {
    await mfs.stat(`/${desiredFilename}`)
    // File exists, need to generate a unique name
  } catch {
    // File doesn't exist, we can use the original name
    return desiredFilename
  }

  // Parse the filename into name and extension
  const lastDotIndex = desiredFilename.lastIndexOf('.')
  let baseName: string
  let extension: string

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No extension or hidden file
    baseName = desiredFilename
    extension = ''
  } else {
    baseName = desiredFilename.substring(0, lastDotIndex)
    extension = desiredFilename.substring(lastDotIndex) // includes the dot
  }

  // Check if baseName ends with a trailing number
  // Use (\D*\D) to match everything up to the last non-digit character, then (\d+) for trailing digits
  const trailingNumberMatch = baseName.match(/^(.*\D)(\d+)$/)
  if (trailingNumberMatch != null) {
    const nameWithoutNumber = trailingNumberMatch[1]
    let counter = parseInt(trailingNumberMatch[2], 10) + 1

    // Try incrementing from the existing number
    while (counter < 10000) {
      const candidateName = `${nameWithoutNumber}${counter}${extension}`
      try {
        await mfs.stat(`/${candidateName}`)
        counter++
      } catch {
        return candidateName
      }
    }
  }

  // No existing number pattern found, start with 1
  let counter = 1
  while (counter < 1000) {
    const candidateName = `${baseName}${counter}${extension}`
    try {
      await mfs.stat(`/${candidateName}`)
      counter++
    } catch {
      return candidateName
    }
  }

  // Fallback: use timestamp if we somehow hit the limit
  const timestamp = Date.now()
  return `${baseName}-${timestamp}${extension}`
}
