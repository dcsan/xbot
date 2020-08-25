
interface IDfResponse {
  // "fulfillmentMessages": [
  //   {
  //     "platform": "PLATFORM_UNSPECIFIED",
  //     "text": {
  //       "text": [
  //         ""
  //       ]
  //     },
  //     "message": "text"
  //   }
  // ],
  "outputContexts": [],
  "queryText": string,
  "speechRecognitionConfidence": 0,
  "action": string,

  // so this is bad design
  "parameters": {
    // "fields": {
    //   "roomthing": {
    //     "stringValue": "wardrobe",
    //     "kind": "stringValue"
    //   }
    // }
  },
  "allRequiredParamsPresent": boolean,
  // "fulfillmentText": string,
  // "webhookSource": string,
  // "webhookPayload": null,
  "intent": IDfIntent
  "intentDetectionConfidence": number,
  // "diagnosticInfo": null,
  // "languageCode": "en",
  // "sentimentAnalysisResult": null
}

interface IDfIntent {
  "inputContextNames": string[],
  "events": string[],
  "trainingPhrases": string[],
  "outputContexts": string[],
  "parameters": string[],
  "messages": string[],
  "defaultResponsePlatforms": [],
  "followupIntentInfo": [],
  "name": "projects/asylum-dgkb/agent/intents/d3b7a086-5324-415d-8653-19997dfc8c7f",
  "displayName": "open thing",
  "priority": 0,
  "isFallback": false,
  "webhookState": "WEBHOOK_STATE_UNSPECIFIED",
  "action": "",
  "resetContexts": false,
  "rootFollowupIntentName": "",
  "parentFollowupIntentName": "",
  "mlDisabled": false
}

export { IDfIntent, IDfResponse }