import { IDfIntent, IDfResponse } from './DfTypes'
import { MakeLogger } from '../../lib/LogLib'

const logger = new MakeLogger('dflow')

// projectId: ID of the GCP project where Dialogflow agent is deployed
const projectId = 'asylum-dgkb';
// sessionId: String representing a random number or hashed user identifier
const sessionId = '123456';
// queries: A set of sequential queries to be send to Dialogflow agent for Intent Detection
const languageCode = 'en';

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
): Promise<IDfResponse> {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryParams: {},
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    // @ts-ignore
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

interface INlpEntity {
  name: string
  value: string
}

interface INlpIntent {
  displayName: string
}

interface INlpResult {
  intentName: string
  confidence: number
  intent: INlpIntent
  entities: INlpEntity[]
  entNames: string[]
  firstEnt?: string
  textResponse: string    // built inside DF
  builtResponse: string
}

async function dfQuery(query): Promise<INlpResult> {
  // projectId, sessionId, queries, languageCode
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let context;
  let intentResponse;
  try {
    logger.log(`DF Query: ${query}`);

    intentResponse = await detectIntent(
      projectId,
      sessionId,
      query,
      context,
      languageCode
    );

    // logger.logObj('dfResult', intentResponse.queryResult, { force: true });
    // Use the context from this response for next queries
    context = intentResponse.queryResult.outputContexts;

  } catch (error) {
    logger.error(error);
  }

  let entities: INlpEntity[] = []
  // fucking google API returns key:val list
  const dfEntities = intentResponse.queryResult.parameters.fields
  for (const entType of Object.keys(dfEntities)) {
    const elem = dfEntities[entType]
    let val
    // google WTF so complicated
    if (elem.kind && elem.kind === 'listValue') {
      for (const listEnt of elem.listValue.values) {
        val = listEnt.stringValue
        const ent: INlpEntity = {
          name: entType,  // eg 'roomThing'
          value: val   // eg 'wardrobe'
        }
        entities.push(ent)
      }
    } else {
      // single entity
      val = elem.stringValue
      const ent: INlpEntity = {
        name: entType,  // eg 'roomThing'
        value: val   // eg 'wardrobe'
      }
      entities.push(ent)
    }
  }

  logger.logObj('intentResponse.queryResult', intentResponse.queryResult, { force: true })

  const entNames = entities.map(e => e.value)
  const firstEnt = entities && entities[0] ? entities[0].value : undefined
  const dfIntent = intentResponse.queryResult.intent
  const intentName = dfIntent ? dfIntent.displayName : undefined
  const builtResponse = `${intentName} ${firstEnt || ''}`.trim()
  let textResponse
  try {
    textResponse = intentResponse.queryResult.fulfillmentMessages[0].text.text[0]
  } catch {
    logger.log('no textResponse')
  }

  const nlpResult: INlpResult = {
    intentName,
    builtResponse,
    textResponse,
    intent: intentResponse.queryResult.intent,
    confidence: intentResponse.queryResult.intentDetectionConfidence,
    entNames: entNames,
    firstEnt,
    entities
  }

  logger.logObj('nlpResult', nlpResult, { force: true })

  return nlpResult

}

export { dfQuery, INlpResult, INlpEntity }
