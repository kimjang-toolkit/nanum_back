import { Type } from "@google/genai";

export const productInfoExtractPrompt = `
      Analyze the image and ex  tract product information along with the main product thumbnail section. Provide the output in JSON format with the following structure:

      - \`product_name\`: The name of the product. If the product name is not available, set it to an empty string.
      - \`price\`: The total price of the selected product. If the price is not available, set it to 0.
      - \`product_options\`: A list of available product variants (e.g., different pack sizes such as 10pcs, 20pcs, 30pcs, 50pcs).
      - \`selected_product_option\`: The package size currently selected on the webpage. If the package size is not available, set it to {}.
      - \`item_variants\`: A breakdown of the different types or flavors contained within the selected product, along with their respective quantities. If the item variants are not available, set it to [].
            1. If there are no product options, set it to an empty array.
            2. If the name is not available, set it to an empty string.
            3. If the quantity is not available, set it to 0.
      - \`main_thumbnail\`: Extract the most **prominent and largest** product image from the webpage, ensuring the following conditions:
            1\. The **aspect ratio should be as close to 1:1 as possible**.
            2\. The bounding box should **contain the most relevant area that matches the product name** \(\`product_name\`\)\.
            3\. If possible, the bounding box should **include all item variants** listed in \`item_variants\`.
            4\. Select **the largest possible area** while still meeting the above conditions. Output a JSON object containing:
        - \`box_2d\`: The 2D bounding box coordinates of the detected main product image.
        - \`label\`: The text label associated with the detected product image. If the label is not available, set it to an empty string.

      Ensure that:
      1. \`product_options\` lists all available package sizes and prices.
      2. \`selected_product_option\` correctly identifies the currently selected package.
      3. \`item_variants\` includes the breakdown of different flavors/types in the selected package.
      4. \`main_thumbnail\` detects and includes only the **largest and most prominent** product image while **ignoring smaller secondary images**.
      `

export const productInfoExtractJsonConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      product_name: {
        type: Type.STRING,
        description: '제품 이름',
        nullable: false,
      },
      price: {
        type: Type.OBJECT,
        description: '가격 정보',
        properties: {
          amount: {
            type: Type.NUMBER,
            description: '가격 숫자 값',
            nullable: false,
          },
          currency: {
            type: Type.STRING,
            description: '통화 단위 (예: 원, 달러)',
            nullable: false,
          },
        },
        required: ['amount', 'currency'],
      },
      product_options: {
        type: Type.ARRAY,
        description: '옵션 목록',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, nullable: false },
            price: { type: Type.STRING, nullable: false },
          },
          required: ['name', 'price'],
        },
      },
      selected_product_option: {
        type: Type.OBJECT,
        description: '실제 선택된 옵션',
        properties: {
          name: { type: Type.STRING, nullable: false },
          price: { type: Type.STRING, nullable: false },
        },
        required: ['name', 'price'],
      },
      item_variants: {
        type: Type.ARRAY,
        description: '상품 구성',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, nullable: false },
            quantity: { type: Type.NUMBER, nullable: false },
          },
          required: ['name', 'quantity'],
        },
      },
      main_thumbnail: {
        type: Type.OBJECT,
        description: '대표 이미지 정보',
        properties: {
          box_2d: {
            type: Type.OBJECT,
            description: '이미지 내 객체 위치 박스 좌표',
            properties: {
              x_min: { type: Type.NUMBER, nullable: false },
              y_min: { type: Type.NUMBER, nullable: false },
              x_max: { type: Type.NUMBER, nullable: false },
              y_max: { type: Type.NUMBER, nullable: false },
            },
            required: ['x_min', 'y_min', 'x_max', 'y_max'],
          },
          label: {
            type: Type.STRING,
            description: '이미지에 대한 레이블/설명',
            nullable: false,
          },
        },
        required: ['box_2d', 'label'],
      },
    },
    // 어떤 필드를 반드시 포함해야 하는지 명시
    required: [
      'product_name',
      'price',
      'item_variants',
      'main_thumbnail',
    ],
  }
}

/***
 * 
 * #### **Example JSON Output**
      
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
 */