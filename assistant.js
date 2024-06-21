require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;
let currentThreadId = null;

const createThread = async () => {
    try {
        const response = await openai.beta.threads.create();
        if (response && response.id) {
            currentThreadId = response.id;
            return response.id;
        } else {
            throw new Error('Invalid response from create thread API');
        }
    } catch (error) {
        console.error('Error creating thread:', error.message);
        throw error;
    }
};

const addMessageToThread = async (threadId, message) => {
    try {
        const response = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message
        });
        if (response && response.id) {
            return response.id;
        } else {
            throw new Error('Invalid response from add message API');
        }
    } catch (error) {
        console.error('Error adding message to thread:', error.message);
        throw error;
    }
};

const runThread = async (threadId) => {
    try {
        const response = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId
        });
        if (response && response.id) {
            return response.id;
        } else {
            throw new Error('Invalid response from run thread API');
        }
    } catch (error) {
        console.error('Error running thread:', error.message);
        throw error;
    }
};

const getRunStatus = async (threadId, runId) => {
    try {
        const response = await openai.beta.threads.runs.retrieve(threadId, runId);
        if (response && response.status) {
            return response.status;
        } else {
            throw new Error('Invalid response from get run status API');
        }
    } catch (error) {
        console.error('Error retrieving run status:', error.message);
        throw error;
    }
};

const getAssistantMessages = async (threadId) => {
    try {
        const response = await openai.beta.threads.messages.list(threadId);
        if (response && response.data && Array.isArray(response.data)) {
            return response.data;
        } else {
            throw new Error('Invalid response from get assistant messages API');
        }
    } catch (error) {
        console.error('Error retrieving assistant messages:', error.message);
        throw error;
    }
};

const extractRelevantResponse = (messages) => {
    const seenMessages = new Set();
    for (let message of messages) {
        if (message.role === 'assistant' && message.content) {
            for (let content of message.content) {
                if (content.type === 'text' && content.text && content.text.value) {
                    const cleanMessage = content.text.value.replace(/```cmd|```|bash/g, '').trim();
                    if (!seenMessages.has(cleanMessage)) {
                        seenMessages.add(cleanMessage);
                        const lines = cleanMessage.split('\n').map(line => line.trim());
                        // Return the first six lines or fewer if not all are present.
                        const relevantLines = lines.slice(0, 6).join('\n');
                        return relevantLines;
                    }
                }
            }
        }
    }
};



const processInput = async (input) => {
    try {
        const threadId = await createThread();
        await addMessageToThread(threadId, input);
        const runId = await runThread(threadId);

        let status;
        do {
            status = await getRunStatus(threadId, runId);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (status !== 'completed');

        const messages = await getAssistantMessages(threadId);
        const assistantMessage = extractRelevantResponse(messages);

        if (assistantMessage) {
            // Output the message to a file with UTF-8 encoding
            fs.writeFileSync('path\\to\\shellGPT\\output.txt', assistantMessage, { encoding: 'utf8' });
        } else {
            console.error('No relevant response found.');
        }
    } catch (error) {
        console.error('Error processing input:', error.message);
    }
};

// Read command from arguments
const userInput = process.argv.slice(2).join(' ');
processInput(userInput);

// Export functions for potential use in other modules
module.exports = {
    createThread,
    addMessageToThread,
    runThread,
    getRunStatus,
    getAssistantMessages,
    processInput
};
