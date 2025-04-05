import { GoogleGenAI } from "@google/genai";
import { TaskType, TaskRequest, ImageContent } from "@interface/generativeAI";
import { APIERROR } from "@common/responseType";
import { productInfoExtractPrompt, productInfoExtractJsonConfig } from "./prompts/ProductInfoExtractPrompts";

const tasks = {
  [TaskType.productInfoExtract]: {
    model: 'gemini-2.0-flash',
    prompt: productInfoExtractPrompt,
    jsonConfig: productInfoExtractJsonConfig
  },
}


const genAI = new GoogleGenAI({ apiKey: process.env.GoogleApiKey || '' });

export const createGenerativeAIClient = async (taskRequest: TaskRequest): Promise<string> => {
  const model = tasks[taskRequest.taskType].model; //genAI.getGenerativeModel({ model: tasks[taskRequest.taskType].model });
  const prompt = tasks[taskRequest.taskType].prompt;
  // const jsonConfig = tasks[taskRequest.taskType].jsonConfig;

  const imageContent = await getImageContent(taskRequest);
  if (!imageContent) {
    throw new APIERROR(400, "유효한 이미지가 없습니다.");
  }

  const response = await genAI.models.generateContent({
    model: model,
    contents: [prompt, imageContent],
    // config: jsonConfig
  });
  if (taskRequest.taskType === TaskType.productInfoExtract && response.text) {
    console.log(response.text.replace(/^```json\s*/, '')  // 시작 부분의 ```json 제거
                            .replace(/```$/, '')         // 끝 부분의 ``` 제거
                            .trim());                     // 앞뒤 공백 제거);
    return response.text.replace(/^```json\s*/, '')  // 시작 부분의 ```json 제거
                        .replace(/```$/, '')         // 끝 부분의 ``` 제거
                        .trim();                     // 앞뒤 공백 제거;
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


