import { test, expect } from 'vitest'
import { harry } from '../../harry/harry'

// this test needs finishing
test('Post function to the harry API route returns a response from the Gemini API when cookies are attatched', async () => {
  //Arrange

  const prompt: string = 'Wheres the LAMMMMBBB SAUCEEEE'

  const promptHarry = async ({ prompt }: { prompt: string }) => {
    const result = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify(prompt),
    })

    return result
  }

  const result = promptHarry({ prompt })
})

test('just testing the harry function without the POST route', async () => {
  //Arrange
  let fullResponse: string = ''

  const prompt: string = 'WHAT ARE YOUU'

  const stream = await harry({ prompt })
  //Act

  for await (const char of stream) {
    fullResponse += char
  }

  //Assert

  expect(typeof fullResponse).toBe('string')
})

test('Testing the POST serverles API route for the harry route doesnt return anything when cookies arent attatched', async () => {})
