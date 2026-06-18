import OpenAI from 'openai'

const featherless = new OpenAI({
  baseURL: 'https://api.featherless.ai/v1',
  apiKey: process.env.FEATHERLESS_API_KEY || '',
})

export async function callFeatherlessModel(
  model: string,
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await featherless.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: 4096,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error(`Featherless API error (model: ${model}):`, error)
    throw new Error(`Failed to call model ${model}: ${error}`)
  }
}

export { featherless }
