
export async function writeText(text: string) {
  try {
    await window.navigator.clipboard.writeText(text)
  } catch (error: unknown) {
    console.error((error as Error).message)
  }
}
