import { GenerateContentResult, GoogleGenerativeAI } from "@google/generative-ai";
import { TaskType, TaskRequest, ImageContent } from "@interface/generativeAI";
import { APIERROR } from "@common/responseType";

const tasks = {
  [TaskType.productInfoExtract]: {
    model: 'gemini-1.5-flash-8b',
    prompt: `
      Analyze the image and extract product information along with the main product thumbnail section. Provide the output in JSON format with the following structure:

      - \`product_name\`: The name of the product.
      - \`price\`: The total price of the selected product.
      - \`product_options\`: A list of available product variants (e.g., different pack sizes such as 10pcs, 20pcs, 30pcs, 50pcs).
      - \`selected_product_option\`: The package size currently selected on the webpage.
      - \`item_variants\`: A breakdown of the different types or flavors contained within the selected product, along with their respective quantities.
      - \`main_thumbnail\`: Extract the most prominent and largest product image from the webpage. Ignore any smaller, secondary images (such as small preview images or additional thumbnails). Output a JSON object containing:
        - \`box_2d\`: The 2D bounding box coordinates of the detected main product image.
        - \`label\`: The text label associated with the detected product image.

      Ensure that:
      1. \`product_options\` lists all available package sizes and prices.
      2. \`selected_product_option\` correctly identifies the currently selected package.
      3. \`item_variants\` includes the breakdown of different flavors/types in the selected package.
      4. \`main_thumbnail\` detects and includes only the **largest and most prominent** product image while **ignoring smaller secondary images**.

      #### **Example JSON Output**
      \`\`\`json
      {
        "product_name": "미식 밀키트 BEST SET (소고기된장전골 & 곱창전골)",
        "price": {
          "amount": 13500,
          "currency": "원"
        },
        "product_options": [
          {"name": "기본 세트", "price": "12,320원"}
        ],
        "selected_product_option": {"name": "기본 세트", "price": "12,320원"},
        "item_variants": [
          {"name": "소고기된장전골", "quantity": 1},
          {"name": "소고기곱창전골", "quantity": 1}
        ],
        "main_thumbnail": {
          "box_2d": {"x_min": 50, "y_min": 100, "x_max": 600, "y_max": 800},
          "label": "미식 밀키트 BEST SET (소고기된장전골 & 곱창전골)"
        }
      }
      \`\`\`
      `
  },
}

const genAI = new GoogleGenerativeAI(process.env.GoogleApiKey || '');

export const createGenerativeAIClient = async (taskRequest: TaskRequest): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: tasks[taskRequest.taskType].model });
  const prompt = tasks[taskRequest.taskType].prompt;

  const imageContent = await getImageContent(taskRequest);

  let generatedContent: GenerateContentResult;

  if (taskRequest.taskType === TaskType.productInfoExtract && imageContent) {

    generatedContent = await model.generateContent([imageContent, prompt]);
    const text = generatedContent.response.text();
    // console.log(generatedContent.response.text());
    return text.replace(/^```json\s*|\s*```$/g, "").trim();
  } else{
    throw new APIERROR(400, "Invalid task type");
  }
};


const getImageContent = async (taskRequest: TaskRequest) : Promise<ImageContent| undefined> => {
  if (taskRequest.imageBase64 && taskRequest.imageMimeType) {
    return {
      inlineData: {
        data: taskRequest.imageBase64,
        mimeType: taskRequest.imageMimeType,
      },
    } as ImageContent;
  } else if (taskRequest.imageUrl && taskRequest.imageMimeType) {
      const imageResp = await fetch(taskRequest.imageUrl)
      .then((response) => response.arrayBuffer());
    return {
      inlineData: {
          data: Buffer.from(imageResp).toString("base64"),
          mimeType: taskRequest.imageMimeType,
      },
    } as ImageContent;
  }
  return undefined;
}


