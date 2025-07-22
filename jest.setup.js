jest.setTimeout(10000)

// Cleanup hanging handles
afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 100)) // Small delay to allow resources to clean up
})