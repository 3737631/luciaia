import { HfInference } from "@huggingface/inference";

const TOKEN = process.env.HF_TOKEN || "placeholder";

const hf = new HfInference(TOKEN);

// Try with explicit provider
for (const provider of ["hf-inference", "together", "replicate", "fal-ai", "deepinfra"]) {
  try {
    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: "beautiful woman portrait",
      provider,
      parameters: { num_inference_steps: 2 },
    }, { outputType: "blob" });
    console.log(`${provider}: OK (${blob.size} bytes)`);
    break;
  } catch (e) {
    console.log(`${provider}: ${e.message.slice(0, 80)}`);
  }
}
