import express from "express";
import dotenv from "dotenv";
import {getLogger} from "./logger";
import {registerQuasarYandexNetRouter} from "./routers/quasar.yandex.net";
import {registerUniproxyAliceYandexNetRouter} from "./routers/uniproxy.alice.yandex.net";
import {OpenAI} from "openai";
import {GigaAMSTTBackend} from "./backend/stt/gigaam";
import {OpenAITTSBackend} from "./backend/tts/openai";
import {BasicProcessorBackend} from "./backend/processors/basic";

dotenv.config({
    path: ".env.local"
})

dotenv.config();

const logger = getLogger();

const PORT = parseInt(process.env.PORT ?? "31115");

const STT_GIGAAM_URL = process.env.STT_GIGAAM_URL ?? "ws://10.0.3.137:8080";

const PROCESSOR_BASIC_URL = process.env.PROCESSOR_BASIC_URL ?? "http://localhost:8080";

const TTS_OPENAI_BASE_URL = process.env.TTS_OPENAI_BASE_URL ?? "http://10.0.3.137:8000";
const TTS_OPENAI_API_KEY = process.env.TTS_OPENAI_API_KEY ?? "";
const TTS_OPENAI_MODEL = process.env.TTS_OPENAI_MODEL ?? "";
const TTS_OPENAI_VOICE = process.env.TTS_OPENAI_VOICE ?? "IVONA 2 Tatyana OEM";
const TTS_OPENAI_SPEED = parseFloat(process.env.TTS_OPENAI_SPEED ?? "1");

const app = express();

const server = app.listen(PORT, e => {
    if (e) {
        logger.error(`Failed to start on :${PORT}: ${e}`);
        return;
    }
    logger.info(`Started on :${PORT}`);
});

registerQuasarYandexNetRouter(app);
registerUniproxyAliceYandexNetRouter({
    stt: new GigaAMSTTBackend(STT_GIGAAM_URL),
    processor: new BasicProcessorBackend(PROCESSOR_BASIC_URL),
    tts: new OpenAITTSBackend(new OpenAI({
        baseURL: TTS_OPENAI_BASE_URL,
        apiKey: TTS_OPENAI_API_KEY
    }), {
        model: TTS_OPENAI_MODEL,
        voice: TTS_OPENAI_VOICE,
        speed: TTS_OPENAI_SPEED
    })
}, app, server);

app.use((req, res) => {
    logger.debug(`Got unknown request: ${req.method} ${req.url}`);
    res.status(500).end();
});