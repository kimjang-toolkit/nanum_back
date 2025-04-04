import { Type } from "@google/genai";


/**
 * Analyze the given product image to extract the following fields.
 * Each property has specific requirements for how it should be derived
 * from the image (brand vs. product name, variants, bounding box, etc.).
 * 
 * Rules Summary:
 * 1. product_name
 *    - If no valid product name is found, use an empty string ("").
 *    - If a brand name is naturally integrated (e.g., "Kkokkovally Chicken Breast 12-Pack"), keep it.
 *    - Exclude purely promotional words (e.g., "BEST", "NEW") unless they're part of the official name.
 * 
 * 2. price
 *    - A numeric amount and currency (e.g., "원", "USD"). 
 *    - The total price of the selected product. 
 *    - If unavailable, amount = 0, currency = "".
 * 
 * 3. product_options
 *    - An array of package sizes or variants with their prices (string form, e.g., "19,000원").
 *    - If none, return an empty array [].
 * 
 * 4. item_options
 *    - A list of **distinct item variants** visible in the image.
 *    - Each "item" here is considered a different option if it differs by:
 *      - Label text (e.g., "Smoked Chicken" vs. "Herb Chicken")
 *      - Color (e.g., Red package vs. Green package)
 *      - Size or shape
 *      - Any other visible characteristic (e.g., different flavor or variety)
 *    - If no distinct variants are found, create a single item option using a simplified version of the product_name
 *      (remove promotional words and unnecessary details) with quantity = 1
 *    - If a name is unavailable, use ""; if quantity is unavailable, use 0.
 *    - If the model cannot find any separate variants and product_name is empty, return an empty array [].
 *    - If item options are not found, use a simplified title of the main product as the name.
 *    - If quantity cannot be inferred, try to extract it from the product_name.
 * 
 * 5. selected_product_option
 *    - The user-selected package or variant from the webpage.
 *    - If not specified, use an empty object {}.
 * 
 * 7. main_thumbnail
 *    - The largest, most prominent product image bounding box in near 1:1 aspect ratio.
 *    - If none found, default to { x_min: 0, y_min: 0, x_max: 0, y_max: 0 } with label = "".
 * 
 * All extracted data must conform to the following interface:
 * 
 * Among the item_options in the image, one might be marked or inferred as
 * "selected" in the UI. However, in many UIs, the user picks one flavor or type.
 * If the system or UI specifically indicates which one is chosen,
 * you can cross-reference that with item_options.
 * If not, you can just list them all in item_options without marking a specific selection.
 *
 * (You could optionally add a "selected_item_option" field if needed to track
 * which variant from item_options is chosen. But that depends on your design.) 
 * 
 * Example:
 * {
 *   "product_name": "Kkokkovally Chicken Breast 12-Pack",
 *   "price": { "amount": 19000, "currency": "원" },
 *   "product_options": [
 *     { "name": "10pcs", "price": "10,000원" },
 *     { "name": "20pcs", "price": "19,000원" }
 *   ],
 *   "selected_product_option": { "name": "10pcs", "price": "10,000원" },
 *   "item_options": [
 *     { "name": "Tripe Stew", "quantity": 1 },
 *     { "name": "Soybean Paste Stew", "quantity": 2 }
 *   ],
 *   "main_thumbnail": {
 *     "box_2d": { "x_min": 0, "y_min": 0, "x_max": 320, "y_max": 320 },
 *     "label": "Kkokkovally Chicken Breast 12-Pack"
 *   }
 * }
 */
export interface ExtractedProduct {
  /**
   * The name of the product.
   * If not available, set to "" (empty string).
   */
  product_name: string;

  /**
   * The total price of the selected product.
   * If not available, amount = 0 and currency = "".
   */
  price: {
    amount: number;
    currency: string;
  };

  /**
   * A list of available package sizes or variants, each with a name and price.
   * Example:
   * [
   *   { name: "10pcs", price: "10,000원" },
   *   { name: "20pcs", price: "19,000원" }
   * ]
   * If no product options exist, return an empty array [].
   */
  product_options: Array<{
    name: string;
    price: string;
  }>;

  /**
   * The currently selected package on the webpage, if any.
   * If not specified, use an empty object {}.
   */
  selected_product_option: {
    name: string;
    price: string;
  } | Record<string, never>; // empty object fallback

  /**
   * A breakdown of different flavors/types contained within the selected product.
   * If none found, return an empty array [].
   * If a name is not available, use "";
   * if a quantity is not available, use 0.
   *
   * Example:
   * [
   *   { name: "Tripe Stew", quantity: 1 },
   *   { name: "Soybean Paste Stew", quantity: 2 }
   * ]
   */
  item_options: Array<{
    name: string;
    quantity: number;
  }>;

  /**
   * The main thumbnail containing bounding box info for the most prominent product image,
   * ideally near a 1:1 aspect ratio. Include relevant item variants if possible.
   * If none found, default box_2d = {0,0,0,0} and label = "".
   */
  main_thumbnail: {
    box_2d: {
      x_min: number;
      y_min: number;
      x_max: number;
      y_max: number;
    };
    label: string;
  };
}

export const productInfoExtractPrompt = `
   Analyze the given product image to extract the following fields.
  Each property has specific requirements for how it should be derived
  from the image (brand vs. product name, variants, bounding box, etc.).
  
  Rules Summary:
  1. product_name
    - If no valid product name is found, use an empty string ("").
    - If a brand name is naturally integrated (e.g., "Kkokkovally Chicken Breast 12-Pack"), keep it.
    - Exclude purely promotional words (e.g., "BEST", "NEW") unless they're part of the official name.
  2. price
    - A numeric amount and currency (e.g., "원", "USD"). 
    - The total price of the selected product. 
    - If unavailable, amount = 0, currency = "".
  3. product_options
    - An array of package sizes or variants with their prices (string form, e.g., "19,000원").
    - If none, return an empty array [].
  4. item_options
    - A list of **distinct item variants** visible in the image.
    - Each "item" here is considered a different option if it differs by:
      - Label text (e.g., "Smoked Chicken" vs. "Herb Chicken")
      - Color (e.g., Red package vs. Green package)
      - Size or shape
      - Any other visible characteristic (e.g., different flavor or variety)
    - If no distinct variants are found, create a single item option using a simplified version of the product_name
      (remove promotional words and unnecessary details) with quantity = 1
    - If a name is unavailable, use ""; if quantity is unavailable, use 0.
    - If item options are not found, use a simplified title of the main product as the name.
    - If quantity cannot be inferred, try to extract it from the product_name.
    - If the model cannot find any separate variants and product_name is empty, return an empty array [].
  5. selected_product_option
    - The user-selected package or variant from the webpage.
    - If not specified, use an empty object {}.
  7. main_thumbnail
    - The largest, most prominent product image bounding box in near 1:1 aspect ratio.
    - If none found, default to { x_min: 0, y_min: 0, x_max: 0, y_max: 0 } with label = "".
 
 All extracted data must conform to the following interface:
 
 Among the item_options in the image, one might be marked or inferred as
 "selected" in the UI. However, in many UIs, the user picks one flavor or type.
 If the system or UI specifically indicates which one is chosen,
 you can cross-reference that with item_options.
 If not, you can just list them all in item_options without marking a specific selection.

 (You could optionally add a "selected_item_option" field if needed to track
 which variant from item_options is chosen. But that depends on your design.) 
 
 Example:
 {
   "product_name": "꼬꼬벨리 치킨브라더스 12팩",
   "price": { "amount": 19000, "currency": "원" },
   "product_options": [
     { "name": "10pcs", "price": "10,000원" },
     { "name": "20pcs", "price": "19,000원" }
   ],
   "selected_product_option": { "name": "10pcs", "price": "10,000원" },
   "item_options": [
     { "name": "후라이드", "quantity": 1 },
     { "name": "콩", "quantity": 2 }
   ],
   "main_thumbnail": {
     "box_2d": { "x_min": 0, "y_min": 0, "x_max": 320, "y_max": 320 },
     "label": "꼬꼬벨리 치킨브라더스 12팩"
   }
 }
`

// export const productInfoExtractPrompt = `
//       Analyze the image and ex  tract product information along with the main product thumbnail section. Provide the output in JSON format with the following structure:

//       - \`product_name\`: The name of the product. If the product name is not available, set it to an empty string.
//       - \`price\`: The total price of the selected product. If the price is not available, set it to 0.
//       - \`product_options\`: A list of available product variants (e.g., different pack sizes such as 10pcs, 20pcs, 30pcs, 50pcs).
//       - \`selected_product_option\`: The package size currently selected on the webpage. If the package size is not available, set it to {}.
//       - \`item_options\`: A breakdown of the different types or flavors contained within the selected product, along with their respective quantities. If the item variants are not available, set it to [].
//             1. If there are no product options, set it to an empty array.
//             2. If the name is not available, set it to an empty string.
//             3. If the quantity is not available, set it to 0.
//       - \`main_thumbnail\`: Extract the most **prominent and largest** product image from the webpage, ensuring the following conditions:
//             1\. The **aspect ratio should be as close to 1:1 as possible**.
//             2\. The bounding box should **contain the most relevant area that matches the product name** \(\`product_name\`\)\.
//             3\. If possible, the bounding box should **include all item variants** listed in \`item_variants\`.
//             4\. Select **the largest possible area** while still meeting the above conditions. Output a JSON object containing:
//         - \`box_2d\`: The 2D bounding box coordinates of the detected main product image.
//         - \`label\`: The text label associated with the detected product image. If the label is not available, set it to an empty string.

//       Ensure that:
//       1. \`product_options\` lists all available package sizes and prices.
//       2. \`selected_product_option\` correctly identifies the currently selected package.
//       3. \`item_options\` includes the breakdown of different flavors/types in the selected package.
//       4. \`main_thumbnail\` detects and includes only the **largest and most prominent** product image while **ignoring smaller secondary images**.
//       `

export const productInfoExtractJsonConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      product_name: {
        type: Type.STRING,
        nullable: false,
      },
      price: {
        type: Type.OBJECT,
        properties: {
          amount: {
            type: Type.NUMBER,
            nullable: false,
          },
          currency: {
            type: Type.STRING,
            nullable: false,
          },
        },
        required: ['amount', 'currency'],
      },
      product_options: {
        type: Type.ARRAY,
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
        properties: {
          name: { type: Type.STRING, nullable: false },
          price: { type: Type.STRING, nullable: false },
        },
        required: ['name', 'price'],
      },
      item_options: {
        type: Type.ARRAY,
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
        properties: {
          box_2d: {
            type: Type.OBJECT,
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
      'item_options',
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